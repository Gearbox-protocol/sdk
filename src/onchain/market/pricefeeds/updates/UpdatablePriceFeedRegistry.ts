import { type Address, type BlockTag, parseAbi } from "viem";
import { priceFeedCompressorAbi } from "../../../../abi/compressors/priceFeedCompressor.js";
import {
  ADDRESS_0X0,
  AP_PRICE_FEED_COMPRESSOR,
  AP_PRICE_FEED_STORE,
  VERSION_RANGE_310,
} from "../../../constants/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { IPriceUpdateTx, RawTx } from "../../../types/index.js";
import { createRawTx } from "../../../utils/index.js";
import type { IHooks } from "../../../utils/internal/index.js";
import { Hooks } from "../../../utils/internal/index.js";
import { PriceFeedRegistry } from "../PriceFeedRegistry.js";
import type { IPriceFeedContract, PriceUpdate } from "../types.js";
import { getRawPriceUpdates } from "./getRawPriceUpdates.js";
import { isUpdatablePriceFeed } from "./isUpdatablePriceFeed.js";
import type {
  IPriceUpdater,
  LatestUpdate,
  UpdatablePriceFeedRegistryHooks,
  UpdatePriceFeedsResult,
} from "./types.js";
import { updatableDependencies } from "./updatableDependencies.js";

/**
 * @deprecated Support for updatable price feeds is deprecated.
 * {@link PriceFeedRegistry} that also orchestrates off-chain price updates.
 **/
export class UpdatablePriceFeedRegistry
  extends PriceFeedRegistry
  implements IHooks<UpdatablePriceFeedRegistryHooks>
{
  readonly #hooks = new Hooks<UpdatablePriceFeedRegistryHooks>();
  readonly #updaters: IPriceUpdater[];
  #latestUpdate: LatestUpdate | undefined;

  constructor(sdk: OnchainSDK) {
    super(sdk);
    this.#updaters = [];
  }

  /**
   * @internal
   * Registers a callback for price-feed registry lifecycle events.
   * @param event - Event name.
   * @param handler - Callback to invoke.
   **/
  public addHook = this.#hooks.addHook.bind(this.#hooks);
  /**
   * @internal
   * Removes a previously registered hook.
   * @param event - Event name.
   * @param handler - Callback to remove.
   **/
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  /**
   * Generates transactions to push fresh off-chain prices to updatable feeds.
   *
   * @param priceFeeds - Top-level price feeds whose updatable dependencies
   *   will be resolved, or a filter (`{ main: true }` / `{ reserve: true }`)
   *   to gather feeds from all oracles. When omitted, all registered feeds
   *   are used.
   **/
  public async generatePriceFeedsUpdateTxs(
    priceFeeds?: IPriceFeedContract[] | { main: true } | { reserve: true },
  ): Promise<UpdatePriceFeedsResult> {
    let updateables: readonly IPriceFeedContract[] = this.feeds;
    let filterRemark = "";
    if (priceFeeds) {
      if (Array.isArray(priceFeeds)) {
        updateables = priceFeeds.flatMap(pf => updatableDependencies(pf));
      } else if ("main" in priceFeeds && priceFeeds.main) {
        filterRemark = " main";
        updateables = this.sdk.marketRegister.priceOracles
          .flatMap(o => o.mainPriceFeeds.values())
          .flatMap(pf => updatableDependencies(pf.priceFeed));
      } else if ("reserve" in priceFeeds && priceFeeds.reserve) {
        filterRemark = " reserve";
        updateables = this.sdk.marketRegister.priceOracles
          .flatMap(o => o.reservePriceFeeds.values())
          .flatMap(pf => updatableDependencies(pf.priceFeed));
      }
    }

    return this.#generateUpdateTxs(updateables, filterRemark);
  }

  /**
   * Similar to {@link generatePriceFeedsUpdateTxs}, but returns raw structures instead of transactions
   * @param priceFeeds
   * @returns
   */
  public async generatePriceFeedsUpdates(
    priceFeeds?: IPriceFeedContract[] | { main: true } | { reserve: true },
  ): Promise<PriceUpdate[]> {
    const updates = await this.generatePriceFeedsUpdateTxs(priceFeeds);
    return getRawPriceUpdates(updates);
  }

  /**
   * Similar to {@link generatePriceFeedsUpdates}, but returns raw transaction to PriceFeedStore.updatePrices
   * @param priceFeeds
   * @returns
   */
  public async getPriceFeedStoreUpdateTx(
    priceFeeds?: IPriceFeedContract[] | { main: true } | { reserve: true },
  ): Promise<RawTx> {
    const pfs = this.sdk.addressProvider.getAddress(AP_PRICE_FEED_STORE);
    const updates = await this.generatePriceFeedsUpdates(priceFeeds);
    return createRawTx(pfs, {
      abi: parseAbi(["function updatePrices((address,bytes)[])"]),
      functionName: "updatePrices",
      args: [updates.map(u => [u.priceFeed, u.data] as const)],
    });
  }

  /**
   * Similar to {@link generatePriceFeedsUpdateTxs}, but will generate necessary price update transactions for external price feeds (not known to sdk)
   * This does not add feeds to this registry, so they won't be implicitly included in future generatePriceFeedsUpdateTxs calls
   * @param feeds
   * @param block
   * @returns
   */
  public async generateExternalPriceFeedsUpdateTxs(
    feeds: Address[],
    block?: { blockNumber: bigint } | { blockTag: BlockTag },
  ): Promise<UpdatePriceFeedsResult> {
    const [priceFeedCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_PRICE_FEED_COMPRESSOR,
      VERSION_RANGE_310,
    );
    const blockParam = block ?? { blockNumber: this.sdk.currentBlock };
    const result = await this.client.readContract({
      address: priceFeedCompressorAddress,
      abi: priceFeedCompressorAbi,
      functionName: "loadPriceFeedTree",
      args: [feeds],
      ...blockParam,
      // @ts-expect-error
      gas: this.sdk.gasLimit,
    });
    const leaves = result
      .map(node => this.get(node.baseParams.addr) ?? this.create(node))
      .filter(isUpdatablePriceFeed);
    return this.#generateUpdateTxs(leaves, "");
  }

  /**
   * Similar to {@link generateExternalPriceFeedsUpdateTxs}, but returns raw structures instead of transactions
   * @param feeds
   * @param block
   * @returns
   */
  public async generateExternalPriceFeedsUpdates(
    feeds: Address[],
    block?: { blockNumber: bigint } | { blockTag: BlockTag },
  ): Promise<PriceUpdate[]> {
    const updates = await this.generateExternalPriceFeedsUpdateTxs(
      feeds,
      block,
    );
    return getRawPriceUpdates(updates);
  }

  /**
   * Loads PARTIAL information about all updatable price feeds from MarketCompressor
   * Discovered price feeds are not saved anywhere in PriceFeedRegistry, and can later be used to load price feed updates
   */
  public async getPartialUpdatablePriceFeeds(
    configurators: Address[],
  ): Promise<IPriceFeedContract[]> {
    if (this.#updaters.length === 0) {
      return [];
    }
    const [priceFeedCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_PRICE_FEED_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.logger?.debug(
      { configurators },
      `calling getUpdatablePriceFeeds in block ${this.sdk.currentBlock}`,
    );
    const result = await this.client.readContract({
      address: priceFeedCompressorAddress,
      abi: priceFeedCompressorAbi,
      functionName: "getUpdatablePriceFeeds",
      args: [
        {
          configurators,
          pools: [],
          underlying: ADDRESS_0X0,
        },
      ],
      blockNumber: this.sdk.currentBlock,
      // @ts-expect-error
      gas: this.sdk.gasLimit,
    });
    this.logger?.debug(
      `loaded ${result.length} partial updatable price feeds in block ${this.sdk.currentBlock}`,
    );
    return result.map(baseParams => this.create({ baseParams }));
  }

  /**
   * @internal
   * Diagnostic snapshot of the most recent price-update round, or
   * `undefined` if no updates have been generated yet.
   **/
  public get latestUpdate(): LatestUpdate | undefined {
    return this.#latestUpdate;
  }

  /**
   * @internal
   * Returns true if any of the updaters are in historical mode
   */
  public get historical(): boolean {
    return this.#updaters.some(u => u.historical);
  }

  async #generateUpdateTxs(
    updateables: readonly IPriceFeedContract[],
    filterRemark: string,
  ): Promise<UpdatePriceFeedsResult> {
    if (updateables.length === 0) {
      return { txs: [], timestamp: 0 };
    }

    const txs: IPriceUpdateTx[] = [];
    const latestUpdate: LatestUpdate = {
      updates: [],
      timestamp: Math.floor(Date.now() / 1000),
    };

    const updates = (
      await Promise.all(
        this.#updaters.map(u =>
          u.getUpdateTxs([...updateables]).catch(() => []),
        ),
      )
    ).flat();

    let maxTimestamp = 0;
    for (const tx of updates) {
      const { data } = tx;
      const { timestamp } = data;
      if (timestamp > maxTimestamp) {
        maxTimestamp = timestamp;
      }
      txs.push(tx);
      latestUpdate.updates.push(data);
    }
    // sort txs by price feed address to make it deterministic
    txs.sort((a, b) =>
      a.raw.to.toLowerCase().localeCompare(b.raw.to.toLowerCase()),
    );

    const result: UpdatePriceFeedsResult = { txs, timestamp: maxTimestamp };
    const tsDelta = BigInt(maxTimestamp) - this.sdk.timestamp;
    this.logger?.debug(
      `generated ${txs.length}${filterRemark} price feed update transactions, timestamp: ${maxTimestamp} (delta ${tsDelta})`,
    );
    if (txs.length) {
      await this.#hooks.triggerHooks("updatesGenerated", result);
    }
    this.#latestUpdate = latestUpdate;
    return result;
  }
}
