import { SupportedToken } from "@gearbox-protocol/sdk-gov";

export interface TokenDataPayload {
  title?: string;
  addr: string;
  symbol: SupportedToken;
  decimals: number;
}
