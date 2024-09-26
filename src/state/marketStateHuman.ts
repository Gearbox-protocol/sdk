import { CreditFactoryStateHuman } from "./creditStateHuman";
import { PoolFactoryStateHuman } from "./poolStateHuman";
import { PriceFactoryStateHuman } from "./priceFactoryStateHuman";

export interface MarketStateHuman {
  pool: PoolFactoryStateHuman;
  creditManagers: Array<CreditFactoryStateHuman>;
  priceOracle: PriceFactoryStateHuman;
}
