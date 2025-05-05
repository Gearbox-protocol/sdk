import type { MarketData } from "../base/index.js";
import type { NetworkType } from "../chain/chains.js";
import type { AddressProviderState } from "../core/index.js";
import type { PluginMap, PluginStateMap } from "../plugins/index.js";

export interface GearboxState<Plugins extends PluginMap = {}> {
  /**
   * State version, checked duryng hydration
   * This is not the same as @gearbox-protocol/sdk package version
   */
  version: number;
  network: NetworkType;
  chainId: number;
  currentBlock: bigint;
  timestamp: bigint;
  addressProvider: AddressProviderState;
  markets: MarketData[];
  plugins: PluginStateMap<Plugins>;
}
