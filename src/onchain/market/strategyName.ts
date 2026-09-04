import type { Token } from "../../model/index.js";

/**
 * Display name of a leveraged strategy: the target collateral over the
 * borrowed underlying, e.g. `"wstETH / WETH"`.
 *
 * Uses each token's display {@link Token.symbol}, which may already be a
 * curated pretty name or a `"source -> target"` redemption rewrite.
 *
 * @param target - Collateral the position is built around.
 * @param underlying - Token the position borrows.
 **/
export function strategyName(target: Token, underlying: Token): string {
  return `${target.symbol} / ${underlying.symbol}`;
}
