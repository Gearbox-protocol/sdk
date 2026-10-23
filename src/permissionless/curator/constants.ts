/**
 * Raw units of the underlying the MarketConfigurator must hold for every pool
 * it creates: creating a pool mints dead shares out of that balance.
 **/
export const POOL_CREATION_DEPOSIT = 100_000n;

/** Seconds in two weeks, the credit configurator's expiration grace period. **/
export const TWO_WEEKS = 14 * 24 * 60 * 60;

/** Shortest liquidation threshold ramp `CreditConfiguratorV3` accepts. **/
export const MIN_RAMP_DURATION = 2 * 24 * 60 * 60;

/** Largest timestamp a ramp may end at (`type(uint40).max`). **/
export const UINT40_MAX = 2 ** 40 - 1;
