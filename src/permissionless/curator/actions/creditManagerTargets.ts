/**
 * Credit manager targets: an action names the credit manager it configures
 * either by address or by a reference to a credit suite the same GIP deploys.
 *
 * A credit suite deployed by `MARKET::createCreditSuite` with an `id` is
 * referred to as `suite:<id>`. The reference is resolved to the suite's
 * predicted address when the actions run, so changing the suite's params —
 * which changes its address — does not require retargeting the actions that
 * configure it.
 **/
import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { isSameAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";

export type CreditSuiteRef = `suite:${string}`;

/** An address, or a reference to a credit suite deployed by the same GIP. **/
export type CreditManagerTarget = Address | CreditSuiteRef;

/**
 * Placeholder a bundle uses for "the credit manager this bundle configures":
 * the suite it deploys, or the market's single existing credit manager.
 * `applyBundle` binds it; catalog bundles spell it as the zero address.
 **/
export const BUNDLE_TARGET: CreditSuiteRef = "suite:$bundle";

export function creditSuiteRef(id: string): CreditSuiteRef {
  return `suite:${id}`;
}

export function isCreditSuiteRef(value: unknown): value is CreditSuiteRef {
  return typeof value === "string" && value.startsWith("suite:");
}

export function creditSuiteId(ref: CreditSuiteRef): string {
  return ref.slice("suite:".length);
}

export const creditSuiteRefSchema = z
  .string()
  .regex(/^suite:.+$/, "Invalid credit suite reference") as z.ZodType<
  CreditSuiteRef,
  string
>;

export const creditManagerTargetSchema: z.ZodType<CreditManagerTarget, string> =
  z.union([addressSchema, creditSuiteRefSchema]);

/** Whether two targets name the same credit manager, as written. **/
export function isSameTarget(
  a: CreditManagerTarget,
  b: CreditManagerTarget,
): boolean {
  if (isCreditSuiteRef(a) || isCreditSuiteRef(b)) return a === b;
  return isSameAddress(a, b);
}

/** Canonical spelling of a target, for keys. **/
export function targetKey(target: CreditManagerTarget): string {
  return isCreditSuiteRef(target) ? target : target.toLowerCase();
}

/** `P` with its credit manager target resolved to an address. **/
export type ResolvedParams<P> = P extends unknown
  ? P extends { creditManager: CreditManagerTarget }
    ? { [K in keyof P]: K extends "creditManager" ? Address : P[K] }
    : P
  : never;

/** The target an action's params name, if they name one. **/
export function targetOf(params: unknown): CreditManagerTarget | undefined {
  if (params === null || typeof params !== "object") return undefined;
  const target = (params as { creditManager?: unknown }).creditManager;
  return typeof target === "string"
    ? (target as CreditManagerTarget)
    : undefined;
}

/**
 * The action with its credit manager target replaced by `to` when it is
 * `from`; any other action is returned as is.
 **/
export function retargetCreditManager<A extends { params: object }>(
  action: A,
  from: CreditManagerTarget,
  to: CreditManagerTarget,
): A {
  const target = targetOf(action.params);
  if (target === undefined || !isSameTarget(target, from)) return action;
  return { ...action, params: { ...action.params, creditManager: to } };
}

/** The zero address placeholder of catalog bundles, as a {@link BUNDLE_TARGET}. **/
export function normalizeBundleTarget<A extends { params: object }>(
  action: A,
): A {
  const target = targetOf(action.params);
  return target !== undefined &&
    !isCreditSuiteRef(target) &&
    isSameAddress(target, zeroAddress)
    ? retargetCreditManager(action, target, BUNDLE_TARGET)
    : action;
}
