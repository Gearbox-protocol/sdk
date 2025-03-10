import type { MarketData } from "../base";
import type { AddressProviderState } from "../core";

export interface GearboxState {
  currentBlock: bigint;
  addressProvider: AddressProviderState;
  markets: MarketData[];
}
