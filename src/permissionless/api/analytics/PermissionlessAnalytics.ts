import { AbstractOffchainNamespace } from "../../../offchain/AbstractOffchainNamespace.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import { priceFeedChartSchema } from "./schemas.js";
import type { PriceChartArgs, PriceFeedPriceChart } from "./types.js";

/**
 * History of the permissionless stack: what a thing did, rather than what it
 * is.
 *
 * Separate from {@link PermissionlessOracles} because the two are read on
 * different clocks. A feed's identity settles when a curator uploads it and
 * is read once per page; its price moves every block and is re-read whenever
 * a window changes. Folding the series into the feed would make every range
 * switch re-fetch the identity, and every identity read carry a series the
 * caller may never draw.
 *
 * ```ts
 * const chart = await permissionless.analytics.priceChart({
 *   chainId: 1,
 *   address: feed,
 *   range: "1w",
 * });
 * ```
 **/
export class PermissionlessAnalytics extends AbstractOffchainNamespace {
  constructor(options: GearboxPermissionlessOptions) {
    // Every route names its chain in the path, so there is no configured set
    // to scope a read by.
    super("PermissionlessAnalytics", { ...options, chainIds: [] });
  }

  /**
   * The price one feed reported over a window.
   *
   * Backend-only by construction: the chain serves the present, and
   * reconstructing a series from it would mean an archive read per point.
   *
   * @throws When the PriceFeedStore does not carry the feed. An address the
   * store never held has no indexed history, and answering an empty series
   * would read as "no price yet" rather than as the mistake it is.
   **/
  public async priceChart({
    chainId,
    address,
    range,
  }: PriceChartArgs): Promise<PriceFeedPriceChart> {
    return this.getData({
      path: `/pfs/${chainId}/price-feed/${address}/chart`,
      query: { range },
      schema: priceFeedChartSchema,
    });
  }
}
