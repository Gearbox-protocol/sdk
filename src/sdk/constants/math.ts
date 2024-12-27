export const MAX_INT = BigInt(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);
export const MIN_INT96 = -39614081257132168796771975168n;
export const MAX_UINT256 =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;
export const MAX_UINT16 = 65535n;

export const RAY_DECIMALS_POW = 27;
export const RAY = 10n ** BigInt(RAY_DECIMALS_POW);
export const halfRAY = RAY / 2n;
export const WAD_DECIMALS_POW = 18;
export const WAD = 10n ** BigInt(WAD_DECIMALS_POW);

export const PRICE_DECIMALS_POW = 8;
export const PRICE_DECIMALS = 10n ** BigInt(PRICE_DECIMALS_POW);

export const SECONDS_PER_YEAR = 365 * 24 * 3600;

export const PERCENTAGE_DECIMALS = 100n;
export const PERCENTAGE_FACTOR = 10000n;
export const LEVERAGE_DECIMALS = 100n;
export const SLIPPAGE_DECIMALS = 100n;
