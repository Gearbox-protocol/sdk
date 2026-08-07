import type { AssetType, ChainId } from "./primitives.js";

export interface PositionFilter {
  /**
   * Keep only opportunities on these chains.
   **/
  chainIds?: ChainId[];
  /**
   * Asset type of underlying (we hardcode few addresses of underlyings)
   **/
  underlyingType?: AssetType;
  redemptionDelayed?: boolean;
}

// biome-ignore lint/suspicious/noEmptyInterface: <x>
export interface LiquidatableAccount {
  // estimatedProfit: USD;
}
