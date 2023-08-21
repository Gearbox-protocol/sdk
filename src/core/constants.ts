export const MAX_INT = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

export const RAY_DECIMALS_POW = 27;
export const RAY = 10n ** BigInt(RAY_DECIMALS_POW);
export const halfRAY = RAY / 2n;
export const WAD_DECIMALS_POW = 18;
export const WAD = 10n ** BigInt(WAD_DECIMALS_POW);

export const PRICE_DECIMALS_POW = 8;
export const PRICE_DECIMALS = 10n ** BigInt(PRICE_DECIMALS_POW);

export const SECONDS_PER_YEAR = 365 * 24 * 3600;
export const MS_PER_YEAR = SECONDS_PER_YEAR * 1000;

export const PERCENTAGE_DECIMALS = 100n;
export const PERCENTAGE_FACTOR = 10000n;

export const timeRanges: Record<string, number> = {
  // "1H": 3600,
  "1D": 3600 * 24,
  "1W": 3600 * 24 * 7,
  "1M": 3600 * 24 * 30,
  "1Y": 3600 * 24 * 365,
};

export const LEVERAGE_DECIMALS = 100n;
export const SLIPPAGE_DECIMALS = 100n;
export const ADDRESS_0X0 = "0x0000000000000000000000000000000000000000";

// Used in tests
export const DUMB_ADDRESS = "0xC4375B7De8af5a38a93548eb8453a498222C4fF2";
export const DUMB_ADDRESS2 = "0x93548eB8453a498222C4FF2C4375b7De8af5A38a";
export const DUMB_ADDRESS3 = "0x822293548EB8453A49c4fF2c4375B7DE8AF5a38A";
export const DUMB_ADDRESS4 = "0x498222C4Ff2C4393548eb8453a75B7dE8AF5A38a";

export const NOT_DEPLOYED = "NOT DEPLOYED";
