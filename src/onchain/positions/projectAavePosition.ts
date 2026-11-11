import type { AavePositionProjection } from "../../model/index.js";
import { PERCENTAGE_FACTOR, SECONDS_PER_YEAR } from "../constants/math.js";
import type { OnchainSDK } from "../index.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Mint settlement period, until each RWA token reports its own.
 **/
const MINT_DURATION = 5 * 24 * 3600;

/**
 * Where an opening lands once it has moved to Aave Horizon, from the snapshot
 * of the credit account it is built in.
 *
 * Placeholder until the Aave Horizon contracts ship: the mint is assumed to
 * take {@link MINT_DURATION} and to mint the account's balances one for one,
 * and the Aave side is weighed by the credit manager's own projection.
 **/
export function projectAavePosition(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
): AavePositionProjection {
  const market = sdk.marketRegister.findByCreditManager(snapshot.creditManager);
  // Opening borrows the whole debt from the pool.
  const pool = { availableLiquidityChange: -snapshot.totalDebt };
  const rate = sdk.positions.metrics(snapshot, pool).borrowRate.totalOnDebt;
  const interest =
    (snapshot.totalDebt * BigInt(rate) * BigInt(MINT_DURATION)) /
    (PERCENTAGE_FACTOR * BigInt(SECONDS_PER_YEAR));
  const {
    totalValue,
    totalDebt,
    netValue,
    assets,
    healthFactor,
    liquidationPrice,
    borrowRate,
    leverage,
  } = sdk.positions.projection(
    { ...snapshot, totalDebt: snapshot.totalDebt + interest },
    pool,
  );

  return {
    totalValue,
    totalDebt,
    netValue,
    assets,
    healthFactor,
    liquidationPrice,
    borrowRate,
    leverage,
    mintPeriodInterest: market.toUnderlyingAmount(interest),
    mintDuration: MINT_DURATION,
    estLiveAt: Number(sdk.timestamp) + MINT_DURATION,
  };
}
