import type { IGearboxError } from "./errors.js";

/**
 * The success half of every refusable answer: the data the method was asked
 * for, behind the `ok` discriminant a caller must narrow first.
 **/
export interface SDKResult<T> {
  ok: true;
  data: T;
}

/**
 * The failure half: one of the errors that method's own signature names —
 * see {@link IGearboxError} for what every error carries.
 **/
export interface SDKError<E extends IGearboxError = IGearboxError> {
  ok: false;
  error: E;
}

/**
 * What a method that can be refused answers with. `ok` is the discriminant,
 * and narrowing it settles which of the two fields is there — a caller
 * cannot read `data` without having ruled the failure out first.
 *
 * ```ts
 * const res = await sdk.opportunities.prepare.depositStrategy(position, params);
 * if (isSDKError(res)) {
 *   return showRefusal(res.error);   // res.error: exactly this method's union
 * }
 * res.data;                          // res.data: StrategyResult
 * ```
 *
 * @typeParam T - What the method answers when it can.
 * @typeParam E - The errors that method can refuse with. Naming them
 * per method is the point: the union is the list of everything a caller has
 * to handle, checked by the compiler.
 **/
export type SDKReturn<T, E extends IGearboxError> = SDKResult<T> | SDKError<E>;

/** The success half, built. */
export function sdkOk<T>(data: T): SDKResult<T> {
  return { ok: true, data };
}

/** The failure half, built. */
export function sdkErr<E extends IGearboxError>(error: E): SDKError<E> {
  return { ok: false, error };
}

/**
 * Narrows a {@link SDKReturn} to its failure half. Trivial over `ok`, but it
 * names the intent at call sites that would otherwise read `!r.ok`.
 **/
export function isSDKError<T, E extends IGearboxError>(
  answer: SDKReturn<T, E>,
): answer is SDKError<E> {
  return !answer.ok;
}
