import type { ChainScopedFilter, DataResponse } from "../../model/index.js";
import type { FilterResult } from "./types.js";

/**
 * Narrows an already-read list, rows and metadata alike. `undefined` passes
 * through, so a read still in flight stays that way, and an envelope narrows to
 * an envelope, see {@link FilterResult}.
 *
 * @typeParam T - Row type.
 * @typeParam F - Filter type.
 * @typeParam R - What the response was given as.
 * @param matches - Whether one row satisfies the filter, e.g.
 *   `matchesOpportunityFilter`.
 **/
export function filterResponse<
  T,
  F extends ChainScopedFilter,
  R extends DataResponse<T[]> | undefined,
>(
  response: R,
  filter: F | undefined,
  matches: (row: T, filter?: F) => boolean,
): FilterResult<R, T>;
export function filterResponse<T, F extends ChainScopedFilter>(
  response: DataResponse<T[]> | undefined,
  filter: F | undefined,
  matches: (row: T, filter?: F) => boolean,
): DataResponse<T[]> | undefined {
  if (!response) {
    return undefined;
  }
  const chainIds = filter?.chainIds;
  return {
    data: response.data.filter(row => matches(row, filter)),
    meta: {
      chains: chainIds
        ? response.meta.chains.filter(chain => chainIds.includes(chain.chainId))
        : response.meta.chains,
    },
  };
}
