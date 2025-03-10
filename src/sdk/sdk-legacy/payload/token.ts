import type { Address } from "viem";

import type { SupportedToken } from "../../sdk-gov-legacy";

export interface TokenDataPayload {
  addr: Address;

  title?: string;
  symbol: SupportedToken;
  name: string;

  decimals: number;
}
