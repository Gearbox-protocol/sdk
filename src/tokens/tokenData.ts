import {
  NetworkType,
  PartialRecord,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";

import { STATIC_TOKEN } from "../config";
import { TokenDataPayload } from "../payload/token";

const ALIASES: PartialRecord<SupportedToken, string> = {
  USDC_e: "USDC.e",
  dUSDC_eV3: "dUSDC.eV3",
  sdUSDC_eV3: "sdUSDC.eV3",
};

const NETWROK_DEPENDENT_ALIASES: Record<
  NetworkType,
  PartialRecord<SupportedToken, string>
> = {
  Mainnet: {},
  Optimism: {
    dUSDCV3: "dUSDC.eV3",
    sdUSDCV3: "sdUSDC.eV3",
  },
  Arbitrum: {},
  Base: {},
};

export class TokenData {
  readonly title: string;
  readonly symbol: SupportedToken;
  readonly address: string;
  readonly decimals: number;
  readonly icon: string;

  constructor(payload: TokenDataPayload, network?: NetworkType) {
    const symbol = payload.symbol;
    const networkAlias = network
      ? NETWROK_DEPENDENT_ALIASES[network][symbol]
      : undefined;

    this.title = networkAlias || ALIASES[symbol] || payload.title || symbol;
    this.address = payload.addr.toLowerCase();
    this.symbol = symbol;
    this.decimals = payload.decimals;
    this.icon = `${STATIC_TOKEN}${symbol.toLowerCase()}.svg`;
  }

  compareBySymbol(b: TokenData): number {
    return this.symbol > b.symbol ? 1 : -1;
  }
}
