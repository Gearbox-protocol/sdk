import type { Address } from "viem";

export type TokenTypePool =
  | "eth"
  | "stable"
  | "btc"
  | "wbnb"
  | "s"
  | "hemiBTC"
  | "mon"
  | "somi";

export interface PoolConfigPayload {
  // is used to recognize pool in the list; maybe show this name instead of version + underlying symbol?
  name: string;
  // pool address
  address: Address;
  // chain id and network type as they are written in sdk. wrong entries are being omitted
  chainId: number;
  network: string;
  // is used to recognize pool in the list; maybe show this name instead name from sdk?
  curator: string;
  poolType: [TokenTypePool];
  // is used hide pools with low interest checkbox on the main page
  isLowInterest?: boolean;
}
