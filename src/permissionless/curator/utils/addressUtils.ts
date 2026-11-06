import type { Address } from "viem";

/**
 * Canonical form of an address.
 *
 * State records are keyed by lower-case addresses and every comparison in this
 * package is case-insensitive, so checksummed and lower-case input behave alike.
 **/
export function lowerAddress(address: string): Address {
  return address.toLowerCase() as Address;
}

/** Case-insensitive address equality. **/
export function isSameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

/** Canonical addresses in first-seen order, without duplicates. **/
export function uniqueAddresses(addresses: Iterable<string>): Address[] {
  return [...new Set([...addresses].map(lowerAddress))];
}
