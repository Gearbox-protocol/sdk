import type { ChainScopedFilter, DataResponse } from "../../model/index.js";

/**
 * Narrows an already-read list, rows and metadata alike. `undefined` passes
 * through, so a read still in flight stays that way.
 *
 * @typeParam T - Row type.
 * @typeParam F - Filter type.
 * @param matches - Whether one row satisfies the filter, e.g.
 *   `matchesOpportunityFilter`.
 **/
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
