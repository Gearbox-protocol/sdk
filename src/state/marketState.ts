import { CreditFactoryState } from "./creditState";
import { PoolFactoryState } from "./poolState";
import { PriceOracleState } from "./priceFactoryState";

export interface MarketState {
  pool: PoolFactoryState;
  creditManagers: Array<CreditFactoryState>;
  priceOracle: PriceOracleState;
}
