import type { Address } from "viem";

import type { SupportedToken } from "../../sdk-gov-legacy";

export interface TokenDataPayload {
  title?: string;
  addr: Address;
  symbol: SupportedToken;
  decimals: number;
}
