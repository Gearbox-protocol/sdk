import type { MarketData } from "../base/index.js";
import type { NetworkType } from "../chain/chains.js";
import type { AddressProviderState } from "../core/index.js";

export interface GearboxState {
  network: NetworkType;
  chainId: number;
  currentBlock: bigint;
  timestamp: bigint;
  addressProvider: AddressProviderState;
  markets: MarketData[];
}
