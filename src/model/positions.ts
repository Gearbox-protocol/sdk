import type { ChainId } from "./primitives.js";

export interface PositionFilter {
  isZeroDebt?: boolean;
  /**
   * Keep only opportunities on these chains.
   **/
  chainIds?: ChainId[];
}
