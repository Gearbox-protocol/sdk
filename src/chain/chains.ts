import { NetworkType } from "@gearbox-protocol/sdk-gov";
import { Chain } from "viem";

import { arbitrum, mainnet, optimism, base } from "viem/chains";

export const chains: Record<NetworkType, Chain> = {
  Mainnet: mainnet,
  Arbitrum: arbitrum,
  Optimism: optimism,
  Base: base,
};
