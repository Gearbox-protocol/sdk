import { SupportedToken } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

export interface TokenDataPayload {
  title?: string;
  addr: Address;
  symbol: SupportedToken;
  decimals: number;
}
