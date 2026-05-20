import type { Address } from "viem";
import {
  LEVERAGE_DECIMALS,
  WAD_DECIMALS_POW,
} from "../../../../sdk/constants/math.js";
import type { Asset } from "../../../../sdk/router/types.js";
import { formatBN, toBigInt, toBN } from "../../../../sdk/utils/formatter.js";
import type { TokenData } from "../../../charts/token-data.js";
import { calculateEarnings } from "../../apy/calculate-earnings.js";
import { calculateEffectiveBorrowRate } from "../../apy/calculate-effective-borrow-rate.js";
import { getComplexAPYList } from "../../apy/get-complex-apy-list.js";
import { getSafeBaseBorrowRate } from "../../apy/get-safe-base-borrow-rate.js";
import { AssetUtils } from "../../assets-math.js";
import { BigIntMath } from "../../bigint-math.js";
import { EMPTY_ADDRESS, EMPTY_OBJECT } from "../../constants.js";
import { calcHealthFactor } from "../../creditAccount/calc-health-factor.js";
import { calcQuotaUpdate } from "../../creditAccount/quota-utils.js";
import { PriceUtils } from "../../price-math.js";
import { isZeroBalance } from "../../validation/is-zero-balance.js";
import { validateBalances } from "../../validation/validate-balances.js";
import { validateCreditManager } from "../../validation/validate-credit-manager.js";
import { validateHF } from "../../validation/validate-hf.js";
import { validateOpenAccount } from "../../validation/validate-open-account.js";
import { validateOpenAccountPoolStatus } from "../../validation/validate-open-account-pool-status.js";
import { validateTokenToObtain } from "../../validation/validate-token-to-obtain.js";
import { getCMAllowedCollaterals } from "../credit-managers/get-cm-allowed-collaterals.js";
import { getWalletBalancesAllowedOnCM } from "../credit-managers/get-wallet-balances-allowed-on-cm.js";
import { getCollateralByDebt } from "../leverage/get-collateral-by-debt.js";
import type { LeverageFactor } from "../leverage/get-factor-from-leverage.js";
import { getLeverageFromFactor } from "../leverage/get-leverage-from-factor.js";
import { getRecommendedDebt } from "../leverage/get-recommended-debt.js";
import { getComplexPointsList } from "../points/get-complex-points-list.js";
import { getPointsInfo } from "../points/get-points-info.js";
import { getListWithAmountInTarget } from "../tokens/get-list-with-amount-in-target.js";
import type { Strategy } from "../types/strategy.js";
import type {
  APYList,
  CreditManagerData,
  PoolData,
  PricesRecord,
} from "../types/strategy-data.js";
import type { StrategyCMEarningsInfo } from "../types/strategy-earnings.js";
import { calculateTotalAPY } from "./calculate-total-apy.js";
import { calculateTotalPoints } from "./calculate-total-points.js";

export function getCMYouCanEarn<CM extends CreditManagerData>({
  allPrices,
  creditManager,
  tokensList,
  delayedPhantoms,
  nativeTokenAddress,
  wrappedNativeTokenAddress,
  walletBalances,
  strategy,
  slippage,
  quotaReserve,
  apyList,
  pools,
}: {
  allPrices: PricesRecord | undefined;
  creditManager: CM;
  tokensList: Record<Address, TokenData>;
  delayedPhantoms: Record<Address, boolean>;
  nativeTokenAddress: Address;
  wrappedNativeTokenAddress: Address | undefined;
  walletBalances: Record<`0x${string}`, bigint> | undefined;
  strategy: Strategy;
  slippage: number;
  quotaReserve: number;
  apyList: APYList | undefined;
  pools: Record<`0x${string}`, PoolData>;
}): StrategyCMEarningsInfo<CM> {
  const baseInfo = {
    strategy: strategy.name,
    strategyChainId: strategy.chainId,
    strategyNetwork: strategy.network,
    strategyType: strategy.strategyType,

    creditManager: creditManager.address,
    cmName: creditManager.name,
    underlyingToken:
      tokensList[creditManager.underlyingToken]?.title ||
      creditManager.underlyingToken,
    targetToken:
      tokensList[strategy.tokenOutAddress]?.title || strategy.tokenOutAddress,
  };
  if (!walletBalances) {
    return {
      status: "error",
      description: "No wallet balances",
      otherInfo: baseInfo,
      data: undefined,
    };
  }

  const targetTokenAddress = strategy.tokenOutAddress;
  const targetDecimals = tokensList[targetTokenAddress]?.decimals || 18;

  const prices = allPrices?.[creditManager?.pool || EMPTY_ADDRESS];
  if (!prices) {
    return {
      status: "error",
      description: "No prices for cm pool",
      otherInfo: baseInfo,
      data: undefined,
    };
  }

  const collateralRecord = getCMAllowedCollaterals({
    creditManager,
    tokensList,
    zeroDebt: false,
    delayedPhantoms,
    nativeTokenAddress: nativeTokenAddress,
    wrappedNativeTokenAddress: wrappedNativeTokenAddress,
    extraCollaterals: {
      list: strategy.additionalCollaterals,
      prices,
    },
  });
  const walletBalancesSorted = getWalletBalancesAllowedOnCM({
    walletBalances,
    collateralRecord,

    nativeTokenAddress,
    wrappedNativeTokenAddress: wrappedNativeTokenAddress,
    tokensList,
    prices,

    isPaused: creditManager?.isPaused,
  });

  const filtered = walletBalancesSorted.filter(a => !isZeroBalance(a.balance));

  // initial guess start: we assume that assetValueFrom = collateral.balance
  const collateral_initial = filtered[0];
  if (!collateral_initial || collateral_initial.balance === 0n) {
    return {
      status: "error",
      description: `Initial collateral is zero`,
      otherInfo: {
        ...baseInfo,

        walletBalancesSorted,
        filtered,
      },
      data: undefined,
    };
  }

  const collateralPrice = prices[collateral_initial.token] || 0n;
  const collateralDecimals =
    tokensList[collateral_initial.token]?.decimals || 18;

  const underlyingPrice = prices[creditManager.underlyingToken] || 0n;
  const underlyingDecimals =
    tokensList[creditManager.underlyingToken]?.decimals || 18;

  const assetValueFrom_initial = PriceUtils.convertByPrice(
    PriceUtils.calcTotalPrice(
      collateralPrice,
      collateral_initial.balance,
      collateralDecimals,
    ),
    {
      price: underlyingPrice,
      decimals: underlyingDecimals,
    },
  );
  if (!assetValueFrom_initial || assetValueFrom_initial === 0n) {
    return {
      status: "error",
      description: "Initial asset value from is zero",
      otherInfo: baseInfo,
      data: undefined,
    };
  }
  const recommendedDebt_initial = getRecommendedDebt({
    targetToken: targetTokenAddress,
    amount: assetValueFrom_initial,
    creditManager,
    slippage,
    swapCollateral: true,
    leverageLimit: strategy.maxLeverage,
  });
  const lt = creditManager.liquidationThresholds[targetTokenAddress] || 0n;
  const recommendedAssetValueFrom = getCollateralByDebt(
    recommendedDebt_initial.maxDebt,
    lt,
    toBN("1.013", 4),
  );
  // initial guess end
  // meaningful assetValueFrom is obtained
  const assetValueFrom = BigIntMath.min(
    assetValueFrom_initial,
    recommendedAssetValueFrom,
  );
  if (!assetValueFrom || assetValueFrom === 0n) {
    return {
      status: "error",
      description: "Asset value from is zero",
      otherInfo: baseInfo,
      data: undefined,
    };
  }

  const assetValueFromTarget = PriceUtils.convertByPrice(
    PriceUtils.calcTotalPrice(
      underlyingPrice,
      assetValueFrom,
      underlyingDecimals,
    ),
    {
      price: collateralPrice,
      decimals: collateralDecimals,
    },
  );
  const collateral: [Asset] = [
    { token: collateral_initial.token, balance: assetValueFromTarget },
  ];

  const recommendedDebt = getRecommendedDebt({
    targetToken: targetTokenAddress,
    amount: assetValueFrom,
    creditManager,
    slippage,
    swapCollateral: true,
    leverageLimit: strategy.maxLeverage,
  });

  const debt = recommendedDebt.maxDebt;

  const totalAmount = assetValueFrom + debt;
  const targetPrice = prices[targetTokenAddress] || 0n;

  const totalAmountInTarget = PriceUtils.convertByPrice(
    PriceUtils.calcTotalPrice(underlyingPrice, totalAmount, underlyingDecimals),
    {
      price: targetPrice,
      decimals: targetDecimals,
    },
  );

  const assets: Array<Asset> = [
    {
      token: targetTokenAddress,
      balance: totalAmountInTarget,
    },
  ];
  const assetsWithAmountInTarget = getListWithAmountInTarget({
    assets,
    targetToken: creditManager.underlyingToken,
    prices,
    tokensList,
  });
  const assetsWithAmountInTargetRecord = AssetUtils.constructAssetRecord(
    assetsWithAmountInTarget,
  );

  const quotasAfter = calcQuotaUpdate({
    quotas: creditManager.quotas,
    initialQuotas: EMPTY_OBJECT,
    assetsAfterUpdate: assetsWithAmountInTargetRecord,
    allowedToObtain: assetsWithAmountInTargetRecord,
    allowedToSpend: EMPTY_OBJECT,
    quotaReserve: toBigInt(quotaReserve),
    maxDebt: creditManager.maxDebt,
    calcModification: undefined,

    liquidationThresholds: creditManager.liquidationThresholds,
  });
  const desiredQuota = quotasAfter.desiredQuota;
  const quotaDecrease = quotasAfter.quotaDecrease;
  const quotaIncrease = quotasAfter.quotaIncrease;
  const quotaUpdate = [...quotaDecrease, ...quotaIncrease];

  const hf = calcHealthFactor({
    assets: assetsWithAmountInTarget,
    quotas: desiredQuota,
    prices,
    liquidationThresholds: creditManager.liquidationThresholds,
    underlyingToken: creditManager.underlyingToken,
    debt,
    quotasInfo: creditManager.quotas,
    tokensList,
  });

  const pool = pools?.[creditManager.pool];

  const error =
    validateCreditManager({ creditManager }) ||
    validateOpenAccountPoolStatus({
      pool,
      creditManager,
      debt,
      targetToken: targetTokenAddress,
    }) ||
    validateTokenToObtain({
      targetToken: strategy.tokenOutAddress,
      creditManager,
    }) ||
    validateBalances({
      balances: walletBalances,
      assets: collateral,
    }) ||
    validateOpenAccount({
      desiredQuota: desiredQuota,
      quotaUpdate: quotaUpdate,
      debt,
      creditManager,
      loading: false,
    }) ||
    validateHF({ hf });
  if (error) {
    return {
      status: "error",
      description: `Resulting CA did not pass validation: ${error.message}`,
      otherInfo: {
        ...baseInfo,

        hf,
      },
      data: undefined,
    };
  }

  const apyRecord = getComplexAPYList(
    apyList?.apyList,
    apyList?.extraCollateralAPYList,
    creditManager.pool,
  );
  if (!apyRecord) {
    return {
      status: "error",
      description: "No complex apy record",
      otherInfo: baseInfo,
      data: undefined,
    };
  }

  const pointsList = getComplexPointsList(
    apyList?.pointsList,
    apyList?.extraCollateralPointsList,
    pool?.address,
  );
  if (!pointsList) {
    return {
      status: "error",
      description: "No complex points record",
      otherInfo: baseInfo,
      data: undefined,
    };
  }

  const pointsInfo = getPointsInfo({
    chainId: strategy.chainId,
    pointsList,
    token: strategy.tokenOutAddress,
    creditManagers: {
      [creditManager.address]: creditManager,
    },
  });

  const baseBorrowRateTo = pool
    ? getSafeBaseBorrowRate({
        creditManager,
        pool,
        availableLiquidityChange: debt * -1n,
      })
    : creditManager.baseBorrowRate;
  const effectiveBorrowRate = calculateEffectiveBorrowRate({
    underlyingTokenAddress: creditManager.underlyingToken,
    baseRateWithFee: baseBorrowRateTo,
    apyList: apyRecord,
  });

  const totalAPY = calculateTotalAPY({
    caAssets: assetsWithAmountInTarget,
    lpAPY: apyRecord,
    prices,

    quotaRates: creditManager.quotas,
    quotas: desiredQuota,
    feeInterest: creditManager.feeInterest,

    totalValue: totalAmount,
    debt,

    underlyingToken: creditManager.underlyingToken,
    tokensList,

    pointsInfo,
    effectiveBorrowRate,
    showAPY: true,
  });

  const earn = calculateEarnings({
    overallAPYBigInt: totalAPY.overallAPYBigInt,
    targetAmount: assetValueFrom,
    targetToken: creditManager.underlyingToken,
    tokensList,
    prices,
  });

  const points = calculateTotalPoints({
    pointsAsset: pointsInfo ? assetsWithAmountInTarget[0] : undefined,
    cmAddress: creditManager.address,
    info: pointsInfo,
    totalValue: totalAmount,
    assetValue: assetValueFrom,
    prices,
    tokensList,
    underlyingToken: creditManager.underlyingToken,
  });

  const leverage = getLeverageFromFactor(
    ((debt * LEVERAGE_DECIMALS) / assetValueFrom) as LeverageFactor,
  );

  const info = {
    info: {
      strategy,
      creditManager,

      collateral,
      assetsWithAmountInTarget,

      assetValue: assetValueFrom,
      debt,
      totalAmount,

      assetValueInUSD: PriceUtils.calcTotalPrice(
        underlyingPrice,
        assetValueFrom,
        underlyingDecimals,
      ),

      maxAPY: totalAPY,
      bonusAPY: undefined,
      extraAPY: [],

      maxLeverage: leverage,
    },
    earnings: earn,
    points,

    otherInfo: {
      ...baseInfo,

      collateral: collateral.map(c => ({
        token: tokensList[c.token]?.title || c.token,
        balance: formatBN(c.balance, WAD_DECIMALS_POW, 4),
      })),

      apy: formatBN(totalAPY.overallAPYBigInt || 0, 4, 4),
      earningsUSD: formatBN(earn.earningsUSD || 0n, WAD_DECIMALS_POW, 4),

      assetValue: formatBN(assetValueFrom, targetDecimals, 4),
      debt: formatBN(debt, targetDecimals, 4),
      totalAmount: formatBN(totalAmount, underlyingDecimals, 4),

      assetValueFrom_initial: formatBN(
        assetValueFrom_initial,
        targetDecimals,
        4,
      ),
      debt_initial: formatBN(
        recommendedDebt_initial.maxDebt,
        targetDecimals,
        4,
      ),
    },
  };

  return { status: "ok", description: "ok", data: info };
}
