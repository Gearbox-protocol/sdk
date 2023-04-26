import { ethers } from "ethers";

import { tokenDataByNetwork } from "../tokens/token";
import { IERC20__factory } from "../types";
import { ADDRESS_0X0 } from "./constants";

export const MAINNET_NETWORK = 1;
export const GOERLI_NETWORK = 5;
export const OPTIMISM_NETWORK = 10;
export const POLYGON_NETWORK = 137;
export const LOCAL_NETWORK = 1337;
export const TENDERLY_NETWORK = 123456;
export const HARDHAT_NETWORK = 31337;
export const ARBITRUM_NETWORK = 42161;

export const CHAINS = {
  Mainnet: MAINNET_NETWORK,
  Goerli: GOERLI_NETWORK,
  Local: LOCAL_NETWORK,
  Hardhat: HARDHAT_NETWORK,
  MainnetTenderlyFork: TENDERLY_NETWORK,
  Optimism: OPTIMISM_NETWORK,
  Polygon: POLYGON_NETWORK,
  Arbiturum: ARBITRUM_NETWORK,
} as const;

export type NetworkType = "Mainnet" | "Goerli"; // | "Optimism" | "Polygon";

const SUPPORTED_CHAINS: Record<number, NetworkType> = {
  [CHAINS.Mainnet]: "Mainnet",
  [CHAINS.Goerli]: "Goerli",
  [CHAINS.Local]: "Mainnet",
  [CHAINS.MainnetTenderlyFork]: "Mainnet",
  // [CHAINS.Optimism]: "Optimism",
  // [CHAINS.Polygon]: "Polygon",
};

export const getNetworkType = (
  chainId: number,
  localAs: NetworkType = "Mainnet",
): NetworkType => {
  const chainType = SUPPORTED_CHAINS[chainId];

  if (chainId === CHAINS.Local) {
    return localAs;
  } else if (chainType) {
    return chainType;
  }

  throw new Error("Unsupported network");
};

export const isSupportedNetwork = (
  chainId: number | undefined,
): chainId is number => chainId !== undefined && !!SUPPORTED_CHAINS[chainId];

export async function detectNetwork(
  provider: ethers.providers.Provider,
): Promise<NetworkType> {
  try {
    const usdcMainnet = IERC20__factory.connect(
      tokenDataByNetwork.Mainnet.USDC,
      provider,
    );
    await usdcMainnet.balanceOf(ADDRESS_0X0);
    return "Mainnet";
  } catch {
    try {
      const usdcMainnet = IERC20__factory.connect(
        tokenDataByNetwork.Goerli.USDC,
        provider,
      );
      await usdcMainnet.balanceOf(ADDRESS_0X0);
      return "Goerli";
    } catch {
      throw new Error("Unsupported network");
    }
  }
}
