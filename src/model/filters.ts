/**
 * The vocabulary every read-model filter is written in: how a single condition
 * says "do not narrow", and how a predicate asks whether it narrows at all.
 **/

/**
 * Sentinel a filter condition can be set to instead of being omitted.
 **/
export const FILTER_ALL = "all";

/**
 * Type of {@link FILTER_ALL}.
 **/
export type FilterAll = typeof FILTER_ALL;

/**
 * A filter condition: a value, the {@link FILTER_ALL} sentinel, or omitted.
 *
 * @example
 * ```ts
 * const kind: Filterable<OpportunityKind> = "pool"; // only pools
 * const anyKind: Filterable<OpportunityKind> = "all"; // pools and strategies
 * ```
 **/
export type Filterable<T> = T | FilterAll;

/**
 * Whether a condition narrows anything. An omitted condition and one set to
 * {@link FILTER_ALL} both do not, so this is the only check a predicate needs.
 **/
export function isFilterSet<T>(
  condition: Filterable<T> | undefined,
): condition is T {
  return condition !== undefined && condition !== FILTER_ALL;
}
