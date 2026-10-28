/**
 * Building blocks for adapter state schemas. Kept apart from `builtinAdapterPlugins.ts` so
 * that plugin modules can import it without a circular dependency.
 **/
import { zeroAddress } from "viem";
import {
  address,
  boolean,
  type Fields,
  identity,
  integer,
  type ObjectNode,
  object,
  string,
  unknownWhen,
} from "../../state/diff/schemaNodes.js";
import type { AdapterStateBase } from "./defineAdapterPlugin.js";

/** Element type of an array-valued field. **/
export type ItemOf<T, K extends keyof T> = T[K] extends readonly (infer I)[]
  ? I
  : never;

/** Fields shared by every adapter state. **/
const baseAdapterFields: Fields<AdapterStateBase> = {
  type: identity(string),
  version: identity(integer),
  target: identity(address),
  // Zero until the adapter is deployed.
  adapter: unknownWhen(identity(address), v => v === zeroAddress),
  isForbidden: boolean,
};

/** Schema of an adapter state: the shared fields plus the adapter's own. **/
export function adapterStateSchema<
  T extends AdapterStateBase = AdapterStateBase,
>(
  own: Omit<Fields<T>, keyof AdapterStateBase> = {} as Omit<
    Fields<T>,
    keyof AdapterStateBase
  >,
): ObjectNode {
  return object<T>({ ...baseAdapterFields, ...own } as Fields<T>);
}

/** Schema of an adapter state that has no fields of its own. **/
export const plainAdapterStateSchema: ObjectNode = adapterStateSchema();

export const lower = (value: string): string => value.toLowerCase();

/** Presence rule for items carrying an `allowed` flag. **/
export const allowed = (item: { allowed: boolean }): boolean =>
  item.allowed === true;

/** Presence rule for items carrying a `status` that is boolean or enum. **/
export const enabled = (item: { status: boolean | number }): boolean =>
  item.status !== false && item.status !== 0;

/** Orders a token pair so that (A, B) and (B, A) are the same item. **/
export function orderPair(
  value: Record<string, unknown>,
): Record<string, unknown> {
  const [token0, token1] = [String(value.token0), String(value.token1)]
    .map(lower)
    .sort();
  return { ...value, token0, token1 };
}

export const pairKey = (item: { token0: string; token1: string }): string =>
  [item.token0, item.token1].map(lower).sort().join("-");

export const pairFields = {
  token0: identity(address),
  token1: identity(address),
};
