/**
 * Building blocks for `MarketActionDefinition.key`, `requires` and `provides`.
 *
 * `key` names what an action configures: a later action of the same type with
 * the same key merges into the earlier one. Resources name what one action
 * makes available to another, which decides where a new action is placed.
 **/
import type { Address } from "viem";
import { stableStringify } from "../../utils/objectUtils.js";
import {
  type CreditManagerTarget,
  targetKey,
} from "../creditManagerTargets.js";

/** At most one action of this type makes sense per market. **/
export const single = (): string => "";

export const byToken = (params: { token: Address }): string =>
  params.token.toLowerCase();

export const byCreditManager = (params: {
  creditManager: CreditManagerTarget;
}): string => targetKey(params.creditManager);

export const byCreditManagerAndToken = (params: {
  creditManager: CreditManagerTarget;
  token: Address;
}): string => `${targetKey(params.creditManager)}:${byToken(params)}`;

/** An adapter is identified by its credit manager and target. **/
export const byAdapter = (params: {
  creditManager: CreditManagerTarget;
  target: Address;
}): string =>
  `${targetKey(params.creditManager)}:${params.target.toLowerCase()}`;

/** Every param except `omit`, in a canonical spelling. **/
export function paramsKey<P extends object>(
  params: P,
  omit: readonly (keyof P)[] = [],
): string {
  const kept = Object.fromEntries(
    Object.entries(params).filter(([name]) => !omit.includes(name as keyof P)),
  );
  return stableStringify(kept);
}

/** Resource names for `requires` / `provides`. **/
export const resource = {
  asset: (token: Address) => `asset:${token.toLowerCase()}`,
  creditManager: (target: CreditManagerTarget) => `cm:${targetKey(target)}`,
  collateral: (target: CreditManagerTarget, token: Address) =>
    `collateral:${targetKey(target)}:${token.toLowerCase()}`,
  adapter: (target: CreditManagerTarget, adapterTarget: Address) =>
    `adapter:${targetKey(target)}:${adapterTarget.toLowerCase()}`,
  periphery: (domain: string, address: Address) =>
    `periphery:${domain}:${address.toLowerCase()}`,
  contract: (address: Address) => `contract:${address.toLowerCase()}`,
};

/** What an action addressed to one credit manager needs. **/
export const requiresCreditManager = (params: {
  creditManager: CreditManagerTarget;
}): string[] => [resource.creditManager(params.creditManager)];

/** What an action configuring one collateral of a credit manager needs. **/
export const requiresCollateral = (params: {
  creditManager: CreditManagerTarget;
  token: Address;
}): string[] => [
  resource.creditManager(params.creditManager),
  resource.collateral(params.creditManager, params.token),
];

/** What an action configuring one quoted asset needs. **/
export const requiresAsset = (params: { token: Address }): string[] => [
  resource.asset(params.token),
];
