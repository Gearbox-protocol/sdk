import type { Token } from "../../model/index.js";
import { getTokenPrettyName, type NetworkType } from "../chain/chains.js";

/**
 * Display name of a leveraged strategy: the target collateral over the
 * borrowed underlying, e.g. `"wstETH / WETH"`.
 *
 * A curated pretty name from {@link getTokenPrettyName} wins over the target's
 * ticker when one is configured.
 *
 * @param target - Collateral the position is built around.
 * @param underlying - Token the position borrows.
 * @param network - Chain id or network type label of the market.
 **/
export function strategyName(
  target: Token,
  underlying: Token,
  network: number | bigint | NetworkType,
): string {
  const pretty = getTokenPrettyName(target.address, network);
  return `${pretty ?? target.symbol} / ${underlying.symbol}`;
}
