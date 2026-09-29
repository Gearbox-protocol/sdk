import type { Address } from "viem";
import type { MarketActions } from "../index.js";
import type { PeripheryContractDomain } from "../market-add-periphery-contract.js";

/** Anything that carries an already-registered periphery address + domain. */
export interface PeripheryRegistryEntry {
  address: Address;
  domain: string;
}

/**
 * Shared guard for `MARKET::addPeripheryContract`.
 *
 * A periphery contract counts as already added when its normalized
 * address/domain pair is either registered on chain (`registered`) or queued
 * anywhere in the same GIP (`queuedActions` — pass the actions of every
 * touched market, not just the current one).
 */
export function isPeripheryContractAdded(args: {
  address: Address;
  domain: PeripheryContractDomain;
  registered?: readonly PeripheryRegistryEntry[];
  queuedActions?: readonly MarketActions[];
}): boolean {
  const address = args.address.toLowerCase();
  const domain = args.domain.toUpperCase();

  const isRegistered = (args.registered ?? []).some(
    entry =>
      entry.address.toLowerCase() === address &&
      entry.domain.toUpperCase() === domain,
  );
  if (isRegistered) return true;

  return (args.queuedActions ?? []).some(
    action =>
      action.type === "MARKET::addPeripheryContract" &&
      action.params.peripheryContract.toLowerCase() === address &&
      action.params.domain.toUpperCase() === domain,
  );
}
