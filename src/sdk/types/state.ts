import type { MarketData } from "../base/index.js";
import type { AddressProviderState } from "../core/index.js";

export interface GearboxState {
  currentBlock: bigint;
  addressProvider: AddressProviderState;
  markets: MarketData[];
}
