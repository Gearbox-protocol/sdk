import type { Address } from "viem";

export interface PriceFeed {
  address: Address;
  contractType: string;
  version: number;
  deployedBy: Address;
  isInStore: boolean;
  stalenessPeriod: number;
  name: string;
}
