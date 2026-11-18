import type { Address } from "viem";
import { isSameAddress } from "../../utils/addressUtils.js";
import type { PeripheryContractDomain } from "../addPeripheryContractActionData.js";
import type { GipMarketAction } from "../types.js";

/** Anything that carries an already-registered periphery address + domain. **/
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
 **/
export function isPeripheryContractAdded(args: {
  address: Address;
  domain: PeripheryContractDomain;
  registered?: readonly PeripheryRegistryEntry[];
  queuedActions?: readonly GipMarketAction[];
}): boolean {
  const domain = args.domain.toUpperCase();
  const matches = (address: Address, entryDomain: string) =>
    isSameAddress(address, args.address) &&
    entryDomain.toUpperCase() === domain;

  return (
    (args.registered ?? []).some(entry =>
      matches(entry.address, entry.domain),
    ) ||
    (args.queuedActions ?? []).some(
      action =>
        action.type === "MARKET::addPeripheryContract" &&
        matches(action.params.peripheryContract, action.params.domain),
    )
  );
}
