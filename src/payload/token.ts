import type { SupportedToken } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

export interface TokenDataPayload {
  title?: string;
  addr: Address;
  symbol: SupportedToken;
  decimals: number;
}
