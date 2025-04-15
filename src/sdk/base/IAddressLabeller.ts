import type { Address } from "viem";

/**
 * Helper interface to ease v3.1 refactoring and migration from static methods
 */
export interface IAddressLabeller {
  set: (
    address: Address,
    label: string | ((oldLabel?: string) => string),
  ) => void;
  get: (address: Address) => string;
  all: Record<Address, string>;
}
