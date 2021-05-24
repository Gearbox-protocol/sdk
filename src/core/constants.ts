import { BigNumber } from "ethers";

export const MAX_INT = BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
);
export const MAINNET_NETWORK = 1;
export const KOVAN_NETWORK = 42;
export const LOCAL_NETWORK = 1337;

export type NetworkType = "Mainnet" | "Kovan" | "Local";

export const RAY = BigNumber.from(10).pow(27);
export const halfRAY = RAY.div(2);
export const WAD = BigNumber.from(10).pow(18);

export const PERCENTAGE_FACTOR = 1e4;
export const LIQUIDATION_DISCOUNTED_SUM = 9500;
export const HEALTH_FACTOR_MIN_AFTER_UPDATE = 12000;

export const timeRanges: Record<string, number> = {
  // "1H": 3600,
  "1D": 3600 * 24,
  "1W": 3600 * 24 * 7,
  "1M": 3600 * 24 * 30,
  "1Y": 3600 * 24 * 365
};
