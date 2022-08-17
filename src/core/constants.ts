import { BigNumber } from "ethers";

export const MAX_INT = BigNumber.from(
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
);

export const MAINNET_NETWORK = 1;
export const GOERLI_NETWORK = 5;
export const KOVAN_NETWORK = 42;
export const LOCAL_NETWORK = 1337;
export const HARDHAT_NETWORK = 31337;

export type NetworkType = "Mainnet" | "Kovan" | "Goerli";

export const getNetworkType = (chainId: number): NetworkType => {
  switch (chainId) {
    case MAINNET_NETWORK:
    case LOCAL_NETWORK:
      return "Mainnet";
    case KOVAN_NETWORK:
      return "Kovan";
    case GOERLI_NETWORK:
      return "Goerli";
    default:
      throw new Error("unknown network");
  }
};

export const RAY_DECIMALS_POW = 27;
export const RAY = BigNumber.from(10).pow(RAY_DECIMALS_POW);
export const halfRAY = RAY.div(2);
export const WAD_DECIMALS_POW = 18;
export const WAD = BigNumber.from(10).pow(WAD_DECIMALS_POW);

export const PRICE_DECIMALS_POW = 8;
export const PRICE_DECIMALS = BigNumber.from(10).pow(PRICE_DECIMALS_POW);

export const SECONDS_PER_YEAR = 365 * 24 * 3600;

export const PERCENTAGE_DECIMALS = 100;
export const PERCENTAGE_FACTOR = 1e4;
export const LIQUIDATION_DISCOUNTED_SUM = 9500;
export const UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD = 9300;

export const timeRanges: Record<string, number> = {
  // "1H": 3600,
  "1D": 3600 * 24,
  "1W": 3600 * 24 * 7,
  "1M": 3600 * 24 * 30,
  "1Y": 3600 * 24 * 365,
};

export const LEVERAGE_DECIMALS = 100;
export const SLIPPAGE_DECIMALS = 100;
export const ADDRESS_0X0 = "0x0000000000000000000000000000000000000000";
