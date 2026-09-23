import type {
  InsufficientPoolLiquidityError,
  Token,
} from "../../../model/index.js";
import { insufficientPoolLiquidity } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface PoolLiquidityArgs {
  requested: bigint;
  available: bigint;
  underlying: Token;
}

/** What the pool can hand over, against what is being taken out of it. */
export function checkPoolLiquidity(
  args: PoolLiquidityArgs,
): InsufficientPoolLiquidityError[] {
  const { requested, available, underlying } = args;
  if (requested <= available) {
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
