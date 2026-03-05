import { type Address, isAddressEqual, zeroAddress } from "viem";

import type {
  BasicSwapCall,
  CurveAddLiquidity,
  CurveRemoveLiquidity,
  LegacyAdapterOperation,
  TokenAmount,
  Transfers,
} from "./legacyAdapterOperations.js";
import type { TokenTransfer } from "./types.js";

/**
 * Converts an ordered array of {@link TokenTransfer} into net signed balance
 * changes ({@link Transfers}) for the given credit account.
 */
export function toNetTransfers(
  transfers: TokenTransfer[],
  creditAccount: Address,
): Transfers {
  const result: Transfers = {};
  for (const { token, amount, from, to } of transfers) {
    if (isAddressEqual(from, creditAccount)) {
      result[token] = (result[token] ?? 0n) - amount;
    }
    if (isAddressEqual(to, creditAccount)) {
      result[token] = (result[token] ?? 0n) + amount;
    }
  }
  return result;
}

/**
 * Extracts the bare function name from a Solidity signature.
 * `"redeemDiff(uint256)"` → `"redeemDiff"`, `"getReward()"` → `"getReward"`
 */
export function fnSigToName(signature: string): string {
  const i = signature.indexOf("(");
  return i >= 0 ? signature.slice(0, i) : signature;
}

/**
 * Splits signed transfer map into positive (inflows) and negative (outflows, stored as absolute values).
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L274-L289 — Go `parsePosNegAmount`
 */
export function parsePosNegAmount(transfers: Transfers): {
  pos: TokenAmount[];
  neg: TokenAmount[];
} {
  const pos: TokenAmount[] = [];
  const neg: TokenAmount[] = [];
  for (const [token, amount] of Object.entries(transfers)) {
    if (amount < 0n) {
      neg.push({ token: token as Address, amount: (-amount).toString() });
    } else if (amount > 0n) {
      pos.push({ token: token as Address, amount: amount.toString() });
    }
  }
  return { pos, neg };
}

/**
 * Parses transfers into a basic swap (one token in, one token out).
 * Expects at most 1 positive and 1 negative entry.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/account_operation.go#L306-L321 — Go `SwapParse`
 */
export function swapFromTransfers(transfers: Transfers): BasicSwapCall {
  const { pos, neg } = parsePosNegAmount(transfers);
  return {
    from: neg[0]?.token ?? zeroAddress,
    fromAmount: neg[0]?.amount ?? "0",
    to: pos[0]?.token ?? zeroAddress,
    toAmount: pos[0]?.amount ?? "0",
  };
}

/**
 * Returns all positive-balance entries as reward token amounts.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L214-L226 — Go `getReward` handler
 */
export function rewardsFromTransfers(transfers: Transfers): TokenAmount[] {
  return parsePosNegAmount(transfers).pos;
}

/**
 * Returns all transfer entries as token amounts (absolute values).
 * Used for ConvexWithdrawAndClaim where all transfers (including withdrawals) are reported.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L250-L261
 */
export function allTransfersAsTokenAmounts(
  transfers: Transfers,
): TokenAmount[] {
  return Object.entries(transfers).map(([token, amount]) => ({
    token: token as Address,
    amount: (amount < 0n ? -amount : amount).toString(),
  }));
}

/**
 * Parses transfers into a CurveAddLiquidity operation.
 * Negative entries are the added liquidity tokens, the single positive entry is the LP token received.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L154-L164
 */
export function curveAddLiquidityFromTransfers(
  transfers: Transfers,
): CurveAddLiquidity {
  const { pos, neg } = parsePosNegAmount(transfers);
  return {
    operation: "CurveAddLiquidity",
    addedLiquidity: neg,
    lpToken: pos[0]?.token ?? zeroAddress,
    lpAmount: pos[0]?.amount ?? "0",
  };
}

/**
 * Parses transfers into a CurveRemoveLiquidity operation.
 * Positive entries are the received tokens, the single negative entry is the LP token burned.
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L145-L153
 */
export function curveRemoveLiquidityFromTransfers(
  transfers: Transfers,
): CurveRemoveLiquidity {
  const { pos, neg } = parsePosNegAmount(transfers);
  return {
    operation: "CurveRemoveLiquidity",
    tokenReceived: pos,
    lpToken: neg[0]?.token ?? zeroAddress,
    lpAmount: neg[0]?.amount ?? "0",
  };
}

/**
 * Shared classification logic for Curve adapter operations.
 * Uses {@link fnSigToName} to strip parameter types so matching works with both
 * bare names (`"exchange"`) and full signatures (`"exchange(int128,int128,uint256,uint256)"`).
 * Also handles `_diff_` adapter variants (e.g. `remove_diff_liquidity_one_coin`).
 *
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type.go#L132-L164
 * @see https://github.com/Gearbox-protocol/charts_server/blob/master/core/operation_type_v3.go#L39-L104
 */
export function classifyCurveOperation(
  functionName: string,
  transfers: Transfers,
): LegacyAdapterOperation | undefined {
  const fn = fnSigToName(functionName);

  if (fn.startsWith("exchange")) {
    return { operation: "CurveExchange", ...swapFromTransfers(transfers) };
  }
  // remove_liquidity_one_coin / remove_diff_liquidity_one_coin (must precede remove_liquidity)
  if (fn.includes("remove") && fn.includes("liquidity_one_coin")) {
    return {
      operation: "CurveRemoveLiquidityOneCoin",
      ...swapFromTransfers(transfers),
    };
  }
  // Only exact add_liquidity (and add_liquidity_one_coin) map to CurveAddLiquidity.
  // Diff variants like add_diff_liquidity_one_coin are NOT recognized by charts_server → Swap.
  if (fn === "add_liquidity" || fn === "add_liquidity_one_coin") {
    return curveAddLiquidityFromTransfers(transfers);
  }
  // remove_liquidity / remove_liquidity_imbalance / remove_diff_liquidity
  if (fn.includes("remove") && fn.includes("liquidity")) {
    return curveRemoveLiquidityFromTransfers(transfers);
  }
  return undefined;
}
