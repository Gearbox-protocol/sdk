import type {
  BorrowLimitCause,
  InsufficientPoolLiquidityError,
  Token,
} from "../../../model/index.js";
import { insufficientPoolLiquidity } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface BorrowLimitArgs {
  requested: bigint;
  available: bigint;
  limit: BorrowLimitCause;
  underlying: Token;
  maxBorrowAmount?: bigint;
}

/**
 * What the pool will hand over, against what is asked for.
 *
 * `available` and `limit` are the caller's reading of which limit is in the
 * way; this check only compares. `maxBorrowAmount` is the largest debt still
 * takeable, left out when none is.
 */
export function checkBorrowLimit(
  args: BorrowLimitArgs,
): InsufficientPoolLiquidityError[] {
  const { requested, available, limit, underlying, maxBorrowAmount } = args;
  if (requested <= available) {
    return [];
  }
  return [
    insufficientPoolLiquidity({
      requested: amountOf(underlying, requested),
      available: amountOf(underlying, available),
      limit,
      ...(maxBorrowAmount === undefined
        ? {}
        : { maxBorrowAmount: amountOf(underlying, maxBorrowAmount) }),
    }),
  ];
}
