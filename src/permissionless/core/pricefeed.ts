import type { Address } from "viem";

export interface PriceFeed {
  address: Address;
  contractType: string;
  version: number;
  deployedBy: Address;
  stalenessPeriod: number;
  name: string;
}
