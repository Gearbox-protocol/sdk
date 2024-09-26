import type { NetworkType } from "@gearbox-protocol/sdk-gov";
import type { Chain } from "viem";
import { arbitrum, base, mainnet, optimism } from "viem/chains";

export const chains: Record<NetworkType, Chain> = {
  Mainnet: mainnet,
  Arbitrum: arbitrum,
  Optimism: optimism,
  Base: base,
};
