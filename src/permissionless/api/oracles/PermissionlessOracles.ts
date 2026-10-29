import {
  type Address,
  type Chain,
  erc20Abi,
  type PublicClient,
  type Transport,
} from "viem";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import type { PriceFeedData } from "../../../model/opportunities.js";
import { priceFeedDataSchema } from "../../../model/opportunities.schema.js";
import { AbstractOffchainNamespace } from "../../../offchain/AbstractOffchainNamespace.js";
import type { NetworkType } from "../../../onchain/index.js";
import {
  AP_PRICE_FEED_COMPRESSOR,
  getAssetType,
  getNetworkType,
  isRWAToken,
  isSupportedNetwork,
} from "../../../onchain/index.js";
import { AddressProviderContract } from "../../bindings/address-provider.js";
import { Addresses } from "../../deployment/addresses.js";
import { getPrices } from "../../utils/price-update/get-prices.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import {
  byCentrality,
  feedKey,
  pricesByFeed,
  toCap,
  totalQuotas,
} from "./enrich.js";
import {
  assetDetailsSchema,
  assetSummariesSchema,
  priceFeedDetailsSchema,
  priceFeedStoresSchema,
} from "./schemas.js";
import type {
  AssetArgs,
  AssetCap,
  AssetsArgs,
  FeedCap,
  MarketCap,
  PermissionlessAssetDetails,
  PermissionlessAssetQuota,
  PermissionlessAssetSummary,
  PermissionlessPriceFeedDetails,
  PermissionlessPriceFeedStore,
  PriceFeedArgs,
  PriceFeedPrice,
  PriceFeedRef,
} from "./types.js";

export const GET_PRICES_GAS_LIMIT_BY_CHAIN_ID: Record<number, bigint> = {
  143: 100_000_000n,
};

export const GET_PRICES_CHUNK_SIZE = 200;

/**
 * What a market slot is: an oracle, a token, and whether it is the reserve
 * one. Not the market — a market that has switched oracles has rows under
 * each, and the slots are the old oracle's and the new one's separately.
 */
function slotKey(oracle: Address, token: Address, reserve: boolean): string {
  return `${oracle.toLowerCase()}:${token.toLowerCase()}:${reserve}`;
}

/** An unknown thrown value, as something a log line can carry. */
function describe(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/**
 * The price feeds of one chain: the PriceFeedStore as the backend has indexed
 * it, and the prices behind it.
 *
 * ```ts
 * const store = await permissionless.oracles.store({ chainId: 1 });
 * const prices = await permissionless.oracles.getPrices(
 *   store.priceFeeds.map(({ address }) => ({ chainId: 1, address })),
 * );
 * ```
 *
 * The backend answers what it has indexed; anything that is only true at a
 * block — a price, a market cap, a quota in one currency, the period an
 * oracle holds for a slot — is read here, off the chain, and folded into what
 * it answered. That is why these reads mix a request with a multicall rather
 * than being either one.
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
   *
   * {@link stores} narrowed to one and unwrapped, which is the whole of it:
   * there is one route either way, and a chain the backend does not serve has
   * no store to answer with rather than an empty one.
   *
   * @throws When the backend serves no store for the chain.
   **/
  public async store({
    chainId,
  }: {
    chainId: number;
  }): Promise<PermissionlessPriceFeedStore> {
    const [store] = await this.stores({ chainId });
    if (!store) {
      throw new Error(`no PriceFeedStore served for chain ${chainId}`);
    }
    return store;
  }

  /**
   * The same stores for every chain the backend serves.
   *
   * One request rather than {@link store} per chain, which is what a page
   * showing all of them would otherwise do: the backend assembles them in the
   * same few queries it assembles one in, so the chains cost little more than
   * the largest of them.
   *
   * Each entry names its own chain, so a store is never attributed by
   * position. `chainId` narrows it to one, for a caller that wants the list
   * shape either way.
   *
   * ```ts
   * const stores = await permissionless.oracles.stores();
   * ```
   **/
  public async stores({
    chainId,
  }: AssetsArgs = {}): Promise<PermissionlessPriceFeedStore[]> {
    return this.getData({
      path: "/pfs/stores",
      // An absent chain is a condition that does not narrow, and `getData`
      // leaves such an entry out of the URL rather than sending it empty.
      query: { chainId: chainId?.toString() },
      schema: priceFeedStoresSchema,
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
   * Each market row also carries the staleness period that market's own
   * oracle holds for the slot, read off the chain here — see
   * {@link PermissionlessPriceFeedMarket.marketStalenessPeriod}.
   *
   * @throws When the store does not carry the feed. A private draft is not
   * here — it lives in whichever app wrote it.
   **/
  public async feed({
    chainId,
    address,
  }: PriceFeedArgs): Promise<PermissionlessPriceFeedDetails> {
    const feed = address.toLowerCase() as Address;
    const indexed = await this.getData({
      path: `/pfs/${chainId}/price-feed/${address}`,
      schema: priceFeedDetailsSchema,
    });

    const periods = await this.#stalenessPeriods(
      chainId,
      feed,
      indexed.markets,
    );

    return {
      ...indexed,
      markets: indexed.markets.map(market => ({
        ...market,
        marketStalenessPeriod:
          periods.get(
            slotKey(market.priceOracle, market.token, market.reserve),
          ) ?? null,
      })),
    };
  }

  /**
   * Staleness period each market's own oracle holds for the feed's slots,
   * keyed by {@link slotKey}.
   *
   * One call per oracle rather than per slot: the compressor answers for a
   * whole oracle at once, and a feed in a dozen markets of the same curator
   * would otherwise pay a round trip per token. Scoped to the tokens actually
   * asked about, since the unscoped overload returns the oracle's entire feed
   * tree as well.
   *
   * Failures are warnings and not errors. A slot missing from the answer keeps
   * its `null`, which the caller reports as "the oracle would not say" — the
   * alternative is failing a read whose indexed half is perfectly good.
   */
  async #stalenessPeriods(
    chainId: number,
    feed: Address,
    rows: Array<{ priceOracle: Address; token: Address; reserve: boolean }>,
  ): Promise<Map<string, number>> {
    const periods = new Map<string, number>();
    if (rows.length === 0) {
      return periods;
    }

    const tokensByOracle = new Map<Address, Set<Address>>();
    for (const row of rows) {
      let tokens = tokensByOracle.get(row.priceOracle);
      if (!tokens) {
        tokens = new Set<Address>();
        tokensByOracle.set(row.priceOracle, tokens);
      }
      tokens.add(row.token);
    }

    let client: PublicClient<Transport, Chain>;
    let compressor: Address;
    try {
      client = this.#chains.client(chainId);
      compressor = await new AddressProviderContract(
        Addresses.ADDRESS_PROVIDER,
        client,
      ).getLatestVersionAddress(AP_PRICE_FEED_COMPRESSOR);
    } catch (e) {
      this.logger?.warn(
        `no PriceFeedCompressor for chain ${chainId}, reporting no market staleness periods: ${describe(e)}`,
      );
      return periods;
    }

    const oracles = [...tokensByOracle.keys()];
    const results = await client.multicall({
      contracts: oracles.map(oracle => ({
        address: compressor,
        abi: priceFeedCompressorAbi,
        functionName: "getPriceOracleState" as const,
        args: [oracle, [...(tokensByOracle.get(oracle) ?? [])]],
      })),
      allowFailure: true,
    });

    oracles.forEach((oracle, i) => {
      const result = results[i];
      if (result?.status !== "success") {
        this.logger?.warn(
          `price oracle ${oracle} of chain ${chainId} would not report its feed map`,
        );
        return;
      }

      const { priceFeedMap } = result.result as {
        priceFeedMap: ReadonlyArray<{
          token: Address;
          reserve: boolean;
          priceFeed: Address;
          stalenessPeriod: number;
        }>;
      };

      for (const entry of priceFeedMap) {
        // The index named this feed for the slot; where the oracle names
        // another, the slot has since moved on and the period it holds is not
        // this feed's to report.
        if (entry.priceFeed.toLowerCase() !== feed) {
          continue;
        }
        periods.set(
          slotKey(oracle, entry.token, entry.reserve),
          Number(entry.stalenessPeriod),
        );
      }
    });

    return periods;
  }

  /**
   * One asset of the store: the feeds allowed for it, and the markets that
   * take it as collateral.
   *
   * The mirror of {@link feed}, and the call to reach for when the question is
   * "what prices this token and what is it backing" rather than "where is this
   * feed used". Both read the same market slots; which end they are indexed
   * from is the difference.
   *
   * ```ts
   * const { priceFeeds, markets, quotaUsedUsd } =
   *   await permissionless.oracles.asset({ chainId: 1, address: token });
   * ```
   *
   * The quota totals are worked out here, over the very market rows this
   * answers with — see {@link PermissionlessQuotaTotals}.
   *
   * @throws When the chain has no metadata for the address. An asset nothing
   * was indexed for has no symbol or decimals, so there is no row to answer.
   **/
  public async asset({
    chainId,
    address,
  }: AssetArgs): Promise<PermissionlessAssetDetails> {
    const indexed = await this.getData({
      path: `/pfs/${chainId}/asset/${address}`,
      schema: assetDetailsSchema,
    });

    const priceOf = await this.#underlyingPrices(
      indexed.markets.map(market => ({
        chainId,
        underlyingPriceFeed: market.underlyingPriceFeed,
      })),
    );

    return {
      ...indexed,
      ...totalQuotas(indexed.markets, feed => priceOf(chainId, feed)),
    };
  }

  /**
   * The price of every underlying the given quota rows name, looked up by
   * chain and feed.
   *
   * Distinct feeds only, because an asset in a dozen markets of the same
   * underlying names the same feed a dozen times, and a list of every chain's
   * assets names a handful of feeds per chain between them all.
   */
  async #underlyingPrices(
    rows: Array<{ chainId: number; underlyingPriceFeed: Address | null }>,
  ): Promise<(chainId: number, feed: Address) => bigint | null | undefined> {
    const refs = new Map<string, PriceFeedRef>();
    for (const { chainId, underlyingPriceFeed } of rows) {
      if (underlyingPriceFeed === null) {
        continue;
      }
      const address = underlyingPriceFeed.toLowerCase() as Address;
      refs.set(feedKey(chainId, address), { chainId, address });
    }

    const prices = pricesByFeed(await this.getPrices([...refs.values()]));
    return (chainId, feed) => prices.get(feedKey(chainId, feed));
  }

  /**
   * Every asset the store carries, with what its markets make of it.
   *
   * Enough on its own to render a list of assets: the alternative is the
   * store's whole read for the names plus a call per row for the quotas, and
   * this is one request either way you scope it.
   *
   * Ordered by how central each asset is — the markets it underlies first,
   * then what is quoted against it, then what it is allowed — so a consumer
   * renders the rows as they arrive. Omit `chainId` for every chain the
   * backend serves, ordered the same way across all of them.
   *
   * Each row also carries its quota totals and what this SDK's tables say the
   * asset is, neither of which is served — see
   * {@link PermissionlessAssetSummary}. The totals are what the last two terms
   * of the order are over, so this waits for them rather than handing back a
   * list that would reshuffle a moment later.
   *
   * ```ts
   * const assets = await permissionless.oracles.assets({ chainId: 1 });
   * const everywhere = await permissionless.oracles.assets();
   * ```
   **/
  public async assets({
    chainId,
  }: AssetsArgs = {}): Promise<PermissionlessAssetSummary[]> {
    const indexed = await this.getData({
      path: "/pfs/assets",
      // An absent chain is a condition that does not narrow, and `getData`
      // leaves such an entry out of the URL rather than sending it empty.
      query: { chainId: chainId?.toString() },
      schema: assetSummariesSchema,
    });

    // One lookup per chain rather than per asset: the network a chain is on
    // never changes, and a list of every chain is mostly rows of a few of
    // them. A chain the tables do not cover is one whose assets are simply
    // unclassified, not a reason to fail a list the backend answered in full.
    const networks = new Map<number, NetworkType | undefined>();
    for (const { chainId: id } of indexed) {
      if (!networks.has(id)) {
        networks.set(
          id,
          isSupportedNetwork(id) ? getNetworkType(id) : undefined,
        );
      }
    }

    const priceOf = await this.#underlyingPrices(
      indexed.flatMap(asset =>
        asset.marketQuotas.map(quota => ({
          chainId: asset.chainId,
          underlyingPriceFeed: quota.underlyingPriceFeed,
        })),
      ),
    );

    return indexed
      .map(asset => {
        const network = networks.get(asset.chainId);
        return {
          ...asset,
          ...totalQuotas(asset.marketQuotas, feed =>
            priceOf(asset.chainId, feed),
          ),
          assetType:
            network === undefined
              ? null
              : (getAssetType(asset.address, network) ?? null),
          isRwa:
            network === undefined ? false : isRWAToken(asset.address, network),
        };
      })
      .sort(byCentrality);
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
   * What the named feeds price, read off the chain.
   *
   * Prices exactly what is asked for, at the current block, across as many
   * chains as the list names — one read per chain, so a screen listing every
   * chain's feeds pays per chain and not per row. A feed the store does not
   * carry prices the same way, which is what makes this the call to reach for
   * after a deploy, or while a form is still choosing between candidates.
   *
   * Feeds needing a fresh answer before they can be read are updated inside
   * the same simulation, so a push-based feed prices as readily as a
   * pull-based one. `null` is a feed whose read reverted, and a chain with no
   * client configured is every one of its feeds reading `null` rather than a
   * failed call — the figures built on them are floors either way.
   *
   * ```ts
   * const [{ price }] = await permissionless.oracles.getPrices([
   *   { chainId: 1, address: feed },
   * ]);
   * ```
   *
   * @returns One entry per feed asked for, in the order asked, each price in
   * the 8 decimals every Gearbox feed reports.
   **/
  public async getPrices(feeds: PriceFeedRef[]): Promise<PriceFeedPrice[]> {
    const byChain = new Map<number, Address[]>();
    for (const { chainId, address } of feeds) {
      const addresses = byChain.get(chainId) ?? [];
      addresses.push(address.toLowerCase() as Address);
      byChain.set(chainId, addresses);
    }

    const chainIds = [...byChain.keys()];
    const results = await Promise.all(
      chainIds.map(async chainId => {
        const priceFeeds = [...new Set(byChain.get(chainId) ?? [])];
        try {
          return await getPrices({
            client: this.#chains.client(chainId),
            priceFeeds,
            chunkSize: GET_PRICES_CHUNK_SIZE,
            gasLimit: GET_PRICES_GAS_LIMIT_BY_CHAIN_ID[chainId],
          });
        } catch (e) {
          this.logger?.warn(
            `chain ${chainId} would not price its ${priceFeeds.length} feed(s), reporting them unpriced: ${describe(e)}`,
          );
          return {} as Record<Address, bigint | null>;
        }
      }),
    );

    const prices = new Map(chainIds.map((id, i) => [id, results[i] ?? {}]));
    return feeds.map(({ chainId, address }) => ({
      chainId,
      address,
      price: prices.get(chainId)?.[address.toLowerCase() as Address] ?? null,
    }));
  }

  /**
   * What one chain's feeds value one chain's assets at: `price × totalSupply`
   * per pair.
   *
   * Asked from whichever side the caller is looking at — one asset through
   * each of its feeds, or one feed over each of the assets it prices — because
   * a screen shows one row per feed or one row per asset, never the full
   * cross product. Both answer the same pairs in the same shape.
   *
   * Two reads per chain: the prices, and one multicall for the assets'
   * supplies and decimals. Several scopes can be asked at once, which is how a
   * table of every asset's feeds pays per chain rather than per row; the pairs
   * come back in the order the scopes named them. A pair neither read could
   * resolve has a `null` cap, which is not a zero.
   *
   * ```ts
   * const caps = await permissionless.oracles.getMarketCap({
   *   chainId: 1,
   *   asset: token,
   *   priceFeeds: [main, reserve],
   * });
   * ```
   **/
  public async getMarketCap(
    scope: AssetCap | FeedCap | Array<AssetCap | FeedCap>,
  ): Promise<MarketCap[]> {
    const pairs = (Array.isArray(scope) ? scope : [scope]).flatMap(one =>
      "asset" in one
        ? one.priceFeeds.map(priceFeed => ({
            chainId: one.chainId,
            priceFeed: priceFeed.toLowerCase() as Address,
            asset: one.asset.toLowerCase() as Address,
          }))
        : one.assets.map(asset => ({
            chainId: one.chainId,
            priceFeed: one.priceFeed.toLowerCase() as Address,
            asset: asset.toLowerCase() as Address,
          })),
    );

    if (pairs.length === 0) {
      return [];
    }

    const feeds = new Map<string, PriceFeedRef>();
    const assetsByChain = new Map<number, Set<Address>>();
    for (const { chainId, priceFeed, asset } of pairs) {
      feeds.set(feedKey(chainId, priceFeed), { chainId, address: priceFeed });
      const assets = assetsByChain.get(chainId) ?? new Set<Address>();
      assets.add(asset);
      assetsByChain.set(chainId, assets);
    }

    const chainIds = [...assetsByChain.keys()];
    const [prices, perChain] = await Promise.all([
      this.getPrices([...feeds.values()]),
      Promise.all(
        chainIds.map(chainId =>
          this.#supplies(chainId, [...(assetsByChain.get(chainId) ?? [])]),
        ),
      ),
    ]);

    const priced = pricesByFeed(prices);
    const supplies = new Map(chainIds.map((id, i) => [id, perChain[i]]));

    return pairs.map(({ chainId, priceFeed, asset }) => {
      const supply = supplies.get(chainId)?.get(asset);
      return {
        chainId,
        priceFeed,
        asset,
        cap:
          supply === undefined
            ? null
            : toCap(
                priced.get(feedKey(chainId, priceFeed)),
                supply.totalSupply,
                supply.decimals,
              ),
      };
    });
  }

  /**
   * Each asset's supply and the decimals it is counted in, which is what turns
   * a supply into an amount.
   *
   * Both read rather than one of them taken from the index, so that a cap can
   * be asked for an address nothing was indexed for at all — a token a form is
   * still choosing, say. An asset missing from the answer is left out, and
   * caps over it come back `null`.
   */
  async #supplies(
    chainId: number,
    assets: Address[],
  ): Promise<Map<Address, { totalSupply: bigint | null; decimals: number }>> {
    const supplies = new Map<
      Address,
      { totalSupply: bigint | null; decimals: number }
    >();

    let client: PublicClient<Transport, Chain>;
    try {
      client = this.#chains.client(chainId);
    } catch (e) {
      this.logger?.warn(
        `chain ${chainId} has no client, reporting no market caps: ${describe(e)}`,
      );
      return supplies;
    }

    const results = await client.multicall({
      contracts: assets.flatMap(address => [
        { address, abi: erc20Abi, functionName: "totalSupply" as const },
        { address, abi: erc20Abi, functionName: "decimals" as const },
      ]),
      allowFailure: true,
    });

    assets.forEach((address, i) => {
      const supply = results[2 * i];
      const decimals = results[2 * i + 1];
      // Without decimals there is no reading the supply at all, so the asset
      // is left out rather than counted in whatever units happened to come
      // back.
      if (decimals?.status !== "success") {
        this.logger?.warn(
          `asset ${address} of chain ${chainId} would not report its decimals, reporting no market cap for it`,
        );
        return;
      }
      supplies.set(address, {
        totalSupply:
          supply?.status === "success" ? (supply.result as bigint) : null,
        decimals: Number(decimals.result),
      });
    });

    return supplies;
  }
}
