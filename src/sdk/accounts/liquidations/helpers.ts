import type { Address } from "viem";
import type { CreditAccountData } from "../../base/index.js";
import type { NetworkType } from "../../chain/index.js";
import { PERCENTAGE_FACTOR } from "../../constants/index.js";
import { hexEq } from "../../utils/index.js";
import type { CurrentWithdrawals } from "../withdrawal-compressor/index.js";
import type { LiquidatorWithdrawal } from "./types.js";

/**
 * Token balances at or below this threshold are treated as dust and ignored,
 * consistent with the rest of the SDK (see `filterDust`).
 **/
export const DUST_THRESHOLD = 10n;

/**
 * Estimated amount (in underlying) the liquidator pays to fully liquidate an
 * account: the part of total value used to repay debt and protocol fees.
 *
 * @param totalValue - Account total value in underlying
 * @param liquidationDiscount - Liquidation discount in bps (`100% - liquidation premium`)
 **/
export function calcRepaymentAmount(
  totalValue: bigint,
  liquidationDiscount: number,
): bigint {
  return (totalValue * BigInt(liquidationDiscount)) / PERCENTAGE_FACTOR;
}

/**
 * Estimated liquidator profit (in underlying): the liquidation premium part
 * of total value.
 *
 * @param totalValue - Account total value in underlying
 * @param liquidationDiscount - Liquidation discount in bps (`100% - liquidation premium`)
 **/
export function calcEstimatedProfit(
  totalValue: bigint,
  liquidationDiscount: number,
): bigint {
  return (
    (totalValue * (PERCENTAGE_FACTOR - BigInt(liquidationDiscount))) /
    PERCENTAGE_FACTOR
  );
}

/**
 * Picks the main asset being liquidated: the most valuable enabled
 * non-underlying collateral token above dust (by oracle value in underlying).
 * Returns `undefined` when the account has no eligible non-underlying
 * collateral above dust.
 *
 * @param ca - Credit account data
 * @param convert - Converts a token balance into its value in underlying;
 * must return `0n` when the price is unavailable
 **/
export function pickMainAsset(
  ca: CreditAccountData,
  convert: (token: Address, balance: bigint) => bigint,
): Address | undefined {
  let bestValue = 0n;
  let bestToken: Address | undefined;
  for (const t of ca.tokens) {
    if (hexEq(t.token, ca.underlying)) {
      continue;
    }
    if ((t.mask & ca.enabledTokensMask) === 0n) {
      continue;
    }
    if (t.balance <= DUST_THRESHOLD) {
      continue;
    }
    const value = convert(t.token, t.balance);
    if (value > bestValue) {
      bestValue = value;
      bestToken = t.token;
    }
  }
  return bestToken;
}

/**
 * Flattens delayed withdrawals of a liquidator into per-output rows:
 * claimable outputs have no `claimableAt` (claimable now), pending outputs
 * carry the estimated claim timestamp.
 *
 * @param current - Claimable and pending withdrawals from the withdrawal compressor
 * @param network - Network the withdrawals live on
 **/
export function toLiquidatorWithdrawals(
  current: CurrentWithdrawals,
  network: NetworkType,
): LiquidatorWithdrawal[] {
  const rows: LiquidatorWithdrawal[] = [];
  for (const w of current.claimable) {
    for (const o of w.outputs) {
      rows.push({
        network,
        sourceToken: w.token,
        token: o.token,
        amount: o.amount,
      });
    }
  }
  for (const w of current.pending) {
    for (const o of w.expectedOutputs) {
      rows.push({
        network,
        sourceToken: w.token,
        token: o.token,
        amount: o.amount,
        claimableAt: w.claimableAt,
      });
    }
  }
  return rows;
}
