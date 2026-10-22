import type { Address } from "viem";
import type { PriceFeedData } from "../../../model/opportunities.js";
import { priceFeedDataSchema } from "../../../model/opportunities.schema.js";
import { AbstractOffchainNamespace } from "../../../offchain/AbstractOffchainNamespace.js";
import { getPrices } from "../../utils/price-update/get-prices.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import {
  priceFeedDetailsSchema,
  priceFeedMarketCapsSchema,
  priceFeedStoreSchema,
  pricesSchema,
} from "./schemas.js";
import type {
  GetPricesArgs,
  PermissionlessPriceFeedDetails,
  PermissionlessPriceFeedMarketCaps,
  PermissionlessPriceFeedStore,
  PermissionlessPrices,
  PriceFeedArgs,
} from "./types.js";

export const GET_PRICES_GAS_LIMIT_BY_CHAIN_ID: Record<number, bigint> = {
  143: 100_000_000n,
};

export const GET_PRICES_CHUNK_SIZE = 200;

/**
 * The price feeds of one chain: the PriceFeedStore as the backend has indexed
 * it, and the prices behind it.
 *
 * ```ts
 * const store = await permissionless.oracles.store({ chainId: 1 });
 * const { prices } = await permissionless.oracles.prices({ chainId: 1 });
 * ```
 *
 * Read-only. What the store carries is decided on chain, so putting a feed
 * there is a batch the instance owner executes — see
 * {@link InstanceOwnerTransactions} — not a row a client writes here.
 **/
export class PermissionlessOracles extends AbstractOffchainNamespace {
  readonly #chains: ChainsNamespace;

  constructor(options: GearboxPermissionlessOptions, chains: ChainsNamespace) {
    // Every route names its chain in the path, so there is no configured set
    // to scope a read by.
    super("PermissionlessOracles", { ...options, chainIds: [] });
    this.#chains = chains;
  }

  /**
   * The store with the assets and feeds of one chain.
   **/
  public async store({
    chainId,
  }: {
    chainId: number;
  }): Promise<PermissionlessPriceFeedStore> {
    return this.getData({
      path: `/pfs/${chainId}`,
      schema: priceFeedStoreSchema,
    });
  }

  /**
   * One feed of the store: what it is, which assets it may price, and which
   * market slots it currently fills.
   *
   * Singular where {@link store} is plural, and not a filter over it: the
   * store answers what a list renders, while this answers what a feed is used
   * for, which the store does not carry at all.
   *
   * ```ts
   * const { priceFeed, markets } = await permissionless.oracles.feed({
   *   chainId: 1,
   *   address: feed,
   * });
   * ```
   *
   * @throws When the store does not carry the feed. A private draft is not
   * here — it lives in whichever app wrote it.
   **/
  public async feed({
    chainId,
    address,
  }: PriceFeedArgs): Promise<PermissionlessPriceFeedDetails> {
    return this.getData({
      path: `/pfs/${chainId}/price-feed/${address}`,
      schema: priceFeedDetailsSchema,
    });
  }

  /**
   * The feeds one feed reads from, recursively.
   *
   * Answers for any feed the chain has indexed, store member or not: a
   * composite feed's children are rarely in the store themselves, and a tree
   * that stopped at the first of them would not be one.
   *
   * ```ts
   * const tree = await permissionless.oracles.dependencies({
   *   chainId: 1,
   *   address: feed,
   * });
   * ```
   **/
  public async dependencies({
    chainId,
    address,
  }: PriceFeedArgs): Promise<PriceFeedData> {
    return this.getData({
      path: `/pfs/${chainId}/price-feed/${address}/graph`,
      schema: priceFeedDataSchema,
    });
  }

  /**
   * What the market values each of one feed's assets at.
   *
   * Prefer this over {@link prices} whenever the caller is looking at a single
   * feed. That one prices the whole store, which costs the backend one
   * `totalSupply` call per asset of every market on the chain; this costs it
   * one price lookup and one multicall over the feed's own assets.
   *
   * ```ts
   * const { marketCaps } = await permissionless.oracles.feedMarketCaps({
   *   chainId: 1,
   *   address: feed,
   * });
   * ```
   **/
  public async feedMarketCaps({
    chainId,
    address,
  }: PriceFeedArgs): Promise<PermissionlessPriceFeedMarketCaps> {
    return this.getData({
      path: `/pfs/${chainId}/price-feed/${address}/market-caps`,
      schema: priceFeedMarketCapsSchema,
    });
  }

  /**
   * A price per feed, and a market cap per feed and asset. The feeds the
   * indexer has not seen are read off the chain by the backend, so the store
   * is priced whole.
   *
   * Chain-wide, and priced accordingly — see {@link feedMarketCaps} for one
   * feed.
   **/
  public async prices({
    chainId,
  }: {
    chainId: number;
  }): Promise<PermissionlessPrices> {
    return this.getData({
      path: `/pfs/${chainId}/prices`,
      schema: pricesSchema,
    });
  }

  /**
   * The price each of the named feeds reports, read off the chain.
   *
   * Where {@link prices} answers for the store as a whole and at whatever
   * moment the backend priced it, this prices exactly the feeds asked for, at
   * the current block. A feed the store does not carry prices the same way,
   * which is what makes this the call to reach for after a deploy, or while a
   * form is still choosing between candidates.
   *
   * Feeds needing a fresh answer before they can be read are updated inside
   * the same simulation, so a push-based feed prices as readily as a
   * pull-based one. `null` is a feed whose read reverted, not a zero.
   *
   * ```ts
   * const prices = await permissionless.oracles.getPrices({
   *   chainId: 1,
   *   priceFeeds: [feed],
   * });
   * ```
   *
   * @returns A price per feed, in the 8 decimals every Gearbox feed reports.
   **/
  public async getPrices({
    chainId,
    priceFeeds,
  }: GetPricesArgs): Promise<Record<Address, bigint | null>> {
    return getPrices({
      client: this.#chains.client(chainId),
      priceFeeds,
      chunkSize: GET_PRICES_CHUNK_SIZE,
      gasLimit: GET_PRICES_GAS_LIMIT_BY_CHAIN_ID[chainId],
    });
  }
}
