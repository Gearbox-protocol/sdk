import type { CreditFactoryState } from "./creditState";
import type { PoolFactoryState } from "./poolState";
import type { PriceOracleState } from "./priceFactoryState";

export interface MarketState {
  pool: PoolFactoryState;
  creditManagers: Array<CreditFactoryState>;
  priceOracle: PriceOracleState;
}
