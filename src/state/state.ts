import { Address, Hex } from "viem";
import { CoreState } from "./coreState";
import { CreditFactoryState } from "./creditState";
import { PeripheryState } from "./peripheryState";
import { PoolFactoryState } from "./poolState";
import { PriceOracleState } from "./priceFactoryState";
import { RouterState } from "./routerState";
import { MarketState } from "./marketState";

export interface BaseContractState {
  address: Address;
  version: number;
  contractType: string;
}

export interface GearboxState {
  block: number;
  timestamp: number;
  core: CoreState;
  markets: Array<MarketState>;
  // priceOracle: PriceOracleState;
  // poolState: Array<PoolFactoryState>;
  // creditState: Array<CreditFactoryState>;
  routerState?: RouterState;
  contractLabels: Record<Address, string>;
}
