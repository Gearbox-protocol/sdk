import type {
  InsufficientPoolLiquidityError,
  Token,
} from "../../../model/index.js";
import { insufficientPoolLiquidity } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface PoolPayoutArgs {
  requested: bigint;
  available: bigint;
  underlying: Token;
}

/**
 * What the pool can pay out, against what is being taken out.
 *
 * The operator is not `checkBorrowLimit`'s: a pool holding exactly the amount
 * asked for still cannot serve it, so equality is already a refusal. That is
 * the rule the legacy withdrawal validator enforced and it is preserved to the
 * unit.
 */
export function checkPoolPayout(
  args: PoolPayoutArgs,
): InsufficientPoolLiquidityError[] {
  const { requested, available, underlying } = args;
  if (requested < available) {
    return [];
  }
  return [
    insufficientPoolLiquidity({
      requested: amountOf(underlying, requested),
      available: amountOf(underlying, available),
      limit: "poolAvailableLiquidity",
    }),
  ];
}
