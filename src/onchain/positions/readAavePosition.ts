import { erc20Abi } from "viem";
import type { AavePosition, PositionCollateral } from "../../model/index.js";
import type { CreditAccountData } from "../base/index.js";
import {
  DUST_THRESHOLD,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  RAY,
} from "../constants/math.js";
import type { OnchainSDK } from "../index.js";
import {
  iAaveOracleAbi,
  iAaveV3PoolAbi,
  iPoolAddressesProviderAbi,
} from "../market/adapters/abi/aave/index.js";
import { AaveHorizonBridgeAdapterContract } from "../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import { calcPositionLeverage, healthFactorBps } from "../market/math.js";
import { strategyName } from "../market/strategyName.js";
import { calcTimeToLiquidationMs } from "./calcTimeToLiquidationMs.js";

/**
 * The Aave Horizon position of a credit account's owner — the investor of an
 * RWA account — on the pool the account's credit manager moves positions to,
 * reported beside that account.
 *
 * The pool and its RWAs come from the credit manager's Aave pool adapter, kept
 * to those whose aToken a Horizon bridge adapter of the same credit manager
 * takes against the underlying (the asset an RWA underlying wraps). Values are
 * at the Aave oracle's prices, the ones Aave liquidates at.
 *
 * `undefined` when the credit manager has no such adapters, or the owner
 * neither supplies any of those RWAs nor owes anything on the pool.
 **/
export async function readAavePosition(
  sdk: OnchainSDK,
  ca: CreditAccountData<true>,
  blockNumber?: bigint,
): Promise<AavePosition | undefined> {
  const suite = sdk.marketRegister.findCreditManager(ca.creditManager);
  const market = sdk.marketRegister.findByCreditManager(ca.creditManager);
  const underlying = market.unwrappedUnderlying;
  const adapters = suite.creditManager.adapters.values();
  const poolAdapter = adapters.find(
    (p): p is AaveV3PoolAdapterContract =>
      p instanceof AaveV3PoolAdapterContract,
  );
  const bridgeAdapter = adapters.find(
    (b): b is AaveHorizonBridgeAdapterContract =>
      b instanceof AaveHorizonBridgeAdapterContract &&
      b.isDebtTokenAllowed(underlying),
  );
  if (!poolAdapter || !bridgeAdapter) {
    return undefined;
  }
  const pool = poolAdapter.targetContract;
  const owner = ca.investor ?? ca.owner;
  const assets = poolAdapter.allowedAssets.filter(
    a => !market.isUnderlyingLike(a),
  );

  const [[account, provider], [debtReserve, ...reserves]] = await Promise.all([
    sdk.client.multicall({
      contracts: [
        {
          address: pool,
          abi: iAaveV3PoolAbi,
          functionName: "getUserAccountData",
          args: [owner],
        },
        {
          address: pool,
          abi: iAaveV3PoolAbi,
          functionName: "ADDRESSES_PROVIDER",
        },
      ],
      allowFailure: false,
      batchSize: 0,
      blockNumber,
    }),
    sdk.client.multicall({
      contracts: [underlying, ...assets].map(
        asset =>
          ({
            address: pool,
            abi: iAaveV3PoolAbi,
            functionName: "getReserveData",
            args: [asset],
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
      blockNumber,
    }),
  ]);
  if (!debtReserve) {
    return undefined;
  }
  const listed = assets.flatMap((token, i) => {
    const reserve = reserves[i];
    return reserve && bridgeAdapter.isATokenAllowed(reserve.aTokenAddress)
      ? [{ token, reserve }]
      : [];
  });
  if (!listed.length) {
    return undefined;
  }

  const [oracle, [owed = 0n, ...supplied]] = await Promise.all([
    sdk.client.readContract({
      address: provider,
      abi: iPoolAddressesProviderAbi,
      functionName: "getPriceOracle",
      blockNumber,
    }),
    sdk.client.multicall({
      contracts: [
        debtReserve.variableDebtTokenAddress,
        ...listed.map(l => l.reserve.aTokenAddress),
      ].map(
        token =>
          ({
            address: token,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [owner],
          }) as const,
      ),
      allowFailure: false,
      batchSize: 0,
      blockNumber,
    }),
  ]);
  const held = listed.flatMap(({ token, reserve }, i) => {
    const balance = supplied[i] ?? 0n;
    return balance > DUST_THRESHOLD ? [{ token, reserve, balance }] : [];
  });
  if (!held.length && owed === 0n) {
    return undefined;
  }

  const [underlyingPrice, ...prices] = await sdk.client.readContract({
    address: oracle,
    abi: iAaveOracleAbi,
    functionName: "getAssetsPrices",
    args: [[underlying, ...held.map(h => h.token)]],
    blockNumber,
  });
  const scale = (configuration: bigint): bigint =>
    10n ** ((configuration >> 48n) & 0xffn);
  const underlyingScale = scale(debtReserve.configuration.data);
  let totalValue = 0n;
  held.forEach(({ reserve, balance }, i) => {
    totalValue +=
      (balance * (prices[i] ?? 0n) * underlyingScale) /
      (scale(reserve.configuration.data) * underlyingPrice);
  });

  const debtBase = account[1];
  const currentLiquidationThreshold = account[3];
  const healthFactor = healthFactorBps(account[5]);
  const rate = Number(
    (debtReserve.currentVariableBorrowRate * PERCENTAGE_FACTOR) / RAY,
  );
  // Aave's liquidation threshold of the owner is that of the one collateral,
  // eMode included, while it is the only one
  const sole = held.length === 1 ? held[0] : undefined;
  let liquidationPrice: bigint | null = null;
  if (sole && currentLiquidationThreshold > 0n) {
    liquidationPrice =
      (debtBase *
        PERCENTAGE_FACTOR *
        scale(sole.reserve.configuration.data) *
        PRICE_DECIMALS) /
      (sole.balance * currentLiquidationThreshold * underlyingPrice);
  }

  const { priceOracle } = market;
  const collaterals: PositionCollateral[] = held.map(({ token, balance }) => ({
    collateral: priceOracle.toTokenAmount(token, balance),
    quota: priceOracle.toTokenAmount(market.underlying, 0n),
    withdrawals: [],
  }));
  const targetCollateral = sole
    ? sdk.tokensMeta.mustGetToken(sole.token)
    : suite.accountTargetCollateral(ca.creditAccount);

  return {
    kind: "aave",
    chainId: sdk.chainId,
    creditManager: ca.creditManager,
    creditAccount: ca.creditAccount,
    underlyingToken: suite.underlyingToken,
    name: targetCollateral
      ? strategyName(targetCollateral, suite.underlyingToken)
      : suite.underlyingToken.symbol,
    curator: market.curator,
    targetCollateral,
    leverage: calcPositionLeverage(totalValue, owed),
    borrowApy: rate,
    totalDebt: market.toUnderlyingAmount(owed),
    totalValue: market.toUnderlyingAmount(totalValue),
    healthFactor,
    borrowRate: {
      total: totalValue > 0n ? Number((BigInt(rate) * owed) / totalValue) : 0,
      totalOnDebt: rate,
      base: rate,
      quotas: [],
    },
    timeToLiquidation: calcTimeToLiquidationMs(healthFactor, BigInt(rate)),
    liquidationPrice,
    collaterals,
    pool,
    bridge: bridgeAdapter.bridge,
  };
}
