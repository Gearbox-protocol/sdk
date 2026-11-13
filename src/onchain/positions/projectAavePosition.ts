import { type Address, isAddressEqual } from "viem";
import type { AavePositionProjection } from "../../model/index.js";
import {
  DUST_THRESHOLD,
  MAX_UINT16,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  RAY,
  SECONDS_PER_YEAR,
} from "../constants/math.js";
import type { OnchainSDK } from "../index.js";
import {
  iAaveOracleAbi,
  iAaveV3PoolAbi,
  iPoolAddressesProviderAbi,
} from "../market/adapters/abi/aave/index.js";
import { AaveHorizonBridgeAdapterContract } from "../market/adapters/contracts/AaveHorizonBridgeAdapterContract.js";
import { AaveV3PoolAdapterContract } from "../market/adapters/contracts/AaveV3PoolAdapterContract.js";
import { calcPositionLeverage } from "../market/math.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Where an Aave Horizon opening lands, and how much the Aave side lends.
 **/
export interface AaveProjection {
  aave: AavePositionProjection;
  /**
   * The most the owner's Aave position can borrow once the collateral is in
   * it, in the market underlying: Aave lends up to the collateral times its
   * LTV, less what the owner already owes there, and the finalizer bot borrows
   * the whole Gearbox debt or reverts.
   **/
  maxDebt: bigint;
}

/**
 * Where an opening lands once it has moved to Aave Horizon, from the snapshot
 * of the credit account it is built in.
 *
 * The finalizer bot supplies the account's RWA to the pool and borrows the
 * Gearbox debt against it on the owner's behalf, so the Aave side is read off
 * the pool for `owner`: the reserve's LTV and liquidation threshold (its eMode
 * category's, where the owner is in one that lists it), the Aave oracle's
 * prices, the variable borrow rate of the underlying, and whatever the owner
 * already holds and owes there. `healthFactor` and `liquidationPrice` are of
 * that whole position; the values describe this opening alone.
 *
 * The RWA is either on the account already, and the position is on Aave at
 * once (the bot's move is the next block), or still being minted: then the
 * account holds the withdrawal phantom token of a delayed operation the
 * withdrawal compressor lists for the credit manager, the mint takes that
 * operation's `withdrawalLength` and is assumed to come out one for one, and
 * the Gearbox debt accrues interest at the credit manager's rate meanwhile.
 *
 * `undefined` when the credit manager cannot move the account to Aave: no
 * pool adapter lists an asset of the account or the RWA it is being minted
 * into, or no bridge adapter takes its aToken against the underlying.
 **/
export async function projectAavePosition(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
  owner: Address,
): Promise<AaveProjection | undefined> {
  const suite = sdk.marketRegister.findCreditManager(snapshot.creditManager);
  const market = sdk.marketRegister.findByCreditManager(snapshot.creditManager);
  const underlying = market.unwrappedUnderlying;
  const adapters = suite.creditManager.adapters.values();
  const poolAdapters = adapters.filter(
    (p): p is AaveV3PoolAdapterContract =>
      p instanceof AaveV3PoolAdapterContract,
  );

  const compressor = sdk.withdrawalCompressor;
  const delayed = compressor?.state
    ? compressor.getWithdrawableAssets(snapshot.creditManager)
    : [];

  // The finalizer bot supplies one RWA: the account's asset the pool lists, or
  // the one a pending mint on the account claims into.
  let collateral: { token: Address; balance: bigint } | undefined;
  let mintDuration = 0;
  let poolAdapter: AaveV3PoolAdapterContract | undefined;
  for (const a of snapshot.assets) {
    if (a.balance <= DUST_THRESHOLD || isAddressEqual(a.token, underlying)) {
      continue;
    }
    const mint = delayed.find(d =>
      isAddressEqual(d.withdrawalPhantomToken, a.token),
    );
    const token = mint ? mint.underlying : a.token;
    poolAdapter = poolAdapters.find(p => p.isAssetAllowed(token));
    if (poolAdapter) {
      collateral = { token, balance: a.balance };
      mintDuration = mint ? Number(mint.withdrawalLength) : 0;
      break;
    }
  }
  if (!collateral || !poolAdapter) {
    return undefined;
  }
  const pool = poolAdapter.targetContract;

  const [rwaReserve, debtReserve, account, eMode, provider] =
    await sdk.client.multicall({
      contracts: [
        {
          address: pool,
          abi: iAaveV3PoolAbi,
          functionName: "getReserveData",
          args: [collateral.token],
        },
        {
          address: pool,
          abi: iAaveV3PoolAbi,
          functionName: "getReserveData",
          args: [underlying],
        },
        {
          address: pool,
          abi: iAaveV3PoolAbi,
          functionName: "getUserAccountData",
          args: [owner],
        },
        {
          address: pool,
          abi: iAaveV3PoolAbi,
          functionName: "getUserEMode",
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
    });

  const bridgeAdapter = adapters.find(
    (b): b is AaveHorizonBridgeAdapterContract =>
      b instanceof AaveHorizonBridgeAdapterContract &&
      b.isATokenAllowed(rwaReserve.aTokenAddress) &&
      b.isDebtTokenAllowed(underlying),
  );
  if (!bridgeAdapter) {
    return undefined;
  }

  const oracle = await sdk.client.readContract({
    address: provider,
    abi: iPoolAddressesProviderAbi,
    functionName: "getPriceOracle",
  });
  const [[rwaPrice, underlyingPrice], categoryParams] = await Promise.all([
    sdk.client.readContract({
      address: oracle,
      abi: iAaveOracleAbi,
      functionName: "getAssetsPrices",
      args: [[collateral.token, underlying]],
    }),
    eMode > 0n
      ? sdk.client.multicall({
          contracts: [
            {
              address: pool,
              abi: iAaveV3PoolAbi,
              functionName: "getEModeCategoryCollateralConfig",
              args: [Number(eMode)],
            },
            {
              address: pool,
              abi: iAaveV3PoolAbi,
              functionName: "getEModeCategoryCollateralBitmap",
              args: [Number(eMode)],
            },
          ],
          allowFailure: false,
          batchSize: 0,
        })
      : undefined,
  ]);

  const rwaConfig = rwaReserve.configuration.data;
  let ltv = rwaConfig & 0xffffn;
  let liquidationThreshold = (rwaConfig >> 16n) & 0xffffn;
  const [category, bitmap] = categoryParams ?? [];
  if (category && bitmap && (bitmap >> BigInt(rwaReserve.id)) & 1n) {
    ltv = BigInt(category.ltv);
    liquidationThreshold = BigInt(category.liquidationThreshold);
  }
  const rwaScale = 10n ** ((rwaConfig >> 48n) & 0xffn);
  const underlyingScale =
    10n ** ((debtReserve.configuration.data >> 48n) & 0xffn);
  const collateralBase = account[0];
  const debtBase = account[1];
  const currentLiquidationThreshold = account[3];
  const currentLtv = account[4];

  // Opening borrows the whole debt from the pool.
  const gearboxPool = { availableLiquidityChange: -snapshot.totalDebt };
  const gearboxRate = sdk.positions.metrics(snapshot, gearboxPool).borrowRate
    .totalOnDebt;
  const interest =
    (snapshot.totalDebt * BigInt(gearboxRate) * BigInt(mintDuration)) /
    (PERCENTAGE_FACTOR * BigInt(SECONDS_PER_YEAR));
  const totalDebt = snapshot.totalDebt + interest;

  const suppliedBase = (collateral.balance * rwaPrice) / rwaScale;
  const borrowedBase = ceilDiv(totalDebt * underlyingPrice, underlyingScale);
  const owedBase = debtBase + borrowedBase;
  const weightedLiquidation =
    collateralBase * currentLiquidationThreshold +
    suppliedBase * liquidationThreshold;
  const borrowableBase =
    (collateralBase * currentLtv + suppliedBase * ltv) / PERCENTAGE_FACTOR;

  const totalValue =
    (collateral.balance * rwaPrice * underlyingScale) /
    (rwaScale * underlyingPrice);
  const rate = Number(
    (debtReserve.currentVariableBorrowRate * PERCENTAGE_FACTOR) / RAY,
  );
  // The RWA price at which the owner's health factor reaches 1, the rest of
  // the position held where it is.
  const uncovered =
    owedBase * PERCENTAGE_FACTOR - collateralBase * currentLiquidationThreshold;
  const liquidationPrice =
    liquidationThreshold === 0n
      ? null
      : uncovered <= 0n
        ? 0n
        : (uncovered * rwaScale * PRICE_DECIMALS) /
          (collateral.balance * liquidationThreshold * underlyingPrice);

  return {
    aave: {
      totalValue: market.toUnderlyingAmount(totalValue),
      totalDebt: market.toUnderlyingAmount(totalDebt),
      netValue: market.toUnderlyingAmount(totalValue - totalDebt),
      assets: [
        market.priceOracle.toTokenAmount(collateral.token, collateral.balance),
      ],
      healthFactor: Number(
        owedBase > 0n ? weightedLiquidation / owedBase : MAX_UINT16,
      ),
      liquidationPrice,
      borrowRate: {
        total:
          totalValue > 0n ? Number((BigInt(rate) * totalDebt) / totalValue) : 0,
        totalOnDebt: rate,
        base: rate,
        quotas: [],
      },
      leverage: calcPositionLeverage(totalValue, totalDebt),
      mintPeriodInterest: market.toUnderlyingAmount(interest),
      mintDuration,
      estLiveAt: Number(sdk.timestamp) + mintDuration,
      bridge: bridgeAdapter.bridge,
    },
    maxDebt:
      borrowableBase > debtBase
        ? ((borrowableBase - debtBase) * underlyingScale) / underlyingPrice
        : 0n,
  };
}

function ceilDiv(a: bigint, b: bigint): bigint {
  return (a + b - 1n) / b;
}
