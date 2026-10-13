import { z } from "zod/v4";
import type {
  AnalyticsPositionFilterOptions,
  AnalyticsPositionListOptions,
  AnalyticsPositionPage,
} from "../../model/analytics.js";
import {
  analyticsPositionFilterOptionsQuerySchema,
  analyticsPositionFilterOptionsSchema,
  analyticsPositionListQuerySchema,
  analyticsPositionPageSchema,
} from "../../model/analytics.schema.js";
import type { ChainScopedFilter } from "../../model/filters.js";
import type { DataResponse } from "../../model/response.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";
import type { IOffchainAnalyticsPositions } from "./types.js";

/** Backend client for protocol-wide position analytics. */
export class OffchainAnalyticsPositions
  extends AbstractOffchainNamespace
  implements IOffchainAnalyticsPositions
{
  constructor(options: GearboxAPIOptions) {
    super("OffchainAnalyticsPositions", options);
  }

  /** {@inheritDoc IOffchainAnalyticsPositions.filterOptions} */
  public async filterOptions(
    filter?: ChainScopedFilter,
  ): Promise<DataResponse<AnalyticsPositionFilterOptions>> {
    return this.get({
      path: "/v2/analytics/positions/filter-options",
      query: z.encode(analyticsPositionFilterOptionsQuerySchema, {
        chainIds: this.scopedChainIds(filter),
      }),
      schema: analyticsPositionFilterOptionsSchema,
    });
  }

  /** {@inheritDoc IOffchainAnalyticsPositions.list} */
  public async list(
    options?: AnalyticsPositionListOptions,
  ): Promise<DataResponse<AnalyticsPositionPage>> {
    return this.get({
      path: "/v2/analytics/positions",
      query: z.encode(analyticsPositionListQuerySchema, {
        ...options,
        chainIds: this.scopedChainIds(options),
      }),
      schema: analyticsPositionPageSchema,
    });
  }
}
