import type { Address } from "abitype";
import { getAddress } from "viem";

import type { NetworkType } from "../chain/index.js";

export const DEFAULT_MARKET_CONFIGURATORS: Record<
  NetworkType,
  Record<Address, string>
> = {
  Mainnet: {
    "0x354fe9f450F60b8547f88BE042E4A45b46128a06": "Chaos Labs",
  },
  Arbitrum: {
    "0x354fe9f450F60b8547f88BE042E4A45b46128a06": "Chaos Labs",
  },
  Optimism: {
    "0x2a15969CE5320868eb609680751cF8896DD92De5": "Chaos Labs",
  },
  Base: {},
  Sonic: { "0x8FFDd1F1433674516f83645a768E8900A2A5D076": "Chaos Labs" },
};

export function getDefaultMarketConfigurators(network: NetworkType): Address[] {
  return Object.keys(DEFAULT_MARKET_CONFIGURATORS[network]).map(a =>
    getAddress(a),
  );
}
