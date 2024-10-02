import type { CreditFactoryStateHuman } from "./creditStateHuman";
import type { PoolFactoryStateHuman } from "./poolStateHuman";
import type { PriceFactoryStateHuman } from "./priceFactoryStateHuman";

export interface MarketStateHuman {
  pool: PoolFactoryStateHuman;
  creditManagers: Array<CreditFactoryStateHuman>;
  priceOracle: PriceFactoryStateHuman;
}
