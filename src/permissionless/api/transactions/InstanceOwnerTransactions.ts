import type { Address, Chain, PublicClient, Transport } from "viem";
import {
  AP_PRICE_FEED_COMPRESSOR,
  ChainContractsRegister,
  createRawTx,
  type GearboxChain,
  getNetworkType,
  OnchainSDK,
  type RawTx,
  VERSION_RANGE_310,
} from "../../../onchain/index.js";
import { AddressProviderContract } from "../../bindings/address-provider.js";
import { InstanceManagerContract } from "../../bindings/instance-manager.js";
import { PriceFeedStoreContract } from "../../bindings/price-feed-store.js";
import { Addresses } from "../../deployment/addresses.js";
import {
  convertRawTxToSafeMultisigTx,
  getSafeBatch,
} from "../../utils/governance/batch.js";
import type { InstanceTxs } from "../../utils/governance/types.js";
import { INSTANCE_MANAGER } from "../../utils/literals.js";
import { getUpdatablePriceFeeds } from "../../utils/price-update/get-updatable-feeds.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import { PriceFeedNotInStoreError } from "../errors.js";
import type { PermissionlessOracles } from "../oracles/PermissionlessOracles.js";
import { getFeedsToUpdate, updateBounds } from "./lp-price-feeds.js";
import type {
  AddFeedsArgs,
  ChangeNamesArgs,
  ChangeStalenessPeriodsArgs,
  ForbidFeedsArgs,
  InstanceTxsArgs,
} from "./types.js";

const lower = (value: string): string => value.toLowerCase();

/** Everything a batch needs beyond the transactions themselves. */
interface BatchContext {
  chainId: number;
  client: PublicClient<Transport, Chain>;
  store: PriceFeedStoreContract;
  instanceManager: InstanceManagerContract;
  /** The Safe that owns the instance and will execute the batch. */
  instanceOwner: Address;
}

/**
 * The Safe batches an instance owner executes to apply what a curator
 * prepared: adding their private feeds to the PriceFeedStore, renaming feeds,
 * changing staleness periods, forbidding feeds and refreshing LP bounds.
 *
 * Every batch is wrapped with `wrapConfigureLocal`, so the InstanceManager is
 * the only caller the PriceFeedStore ever sees.
 *
 * Backend-free: a batch is built off the chain it will be executed on, and
 * the store it reads is the one {@link PermissionlessOracles} already
 * fetched. Nothing is sent either — a curator never executes these
 * themselves. They prepare a batch and hand it to the instance owner, who
 * reviews and executes it from their Safe.
 *
 * ```ts
 * const txs = await permissionless.transactions.addFeeds({
 *   chainId: 1,
 *   owner: curator,
 *   feeds: [feed],
 *   pairs: [{ asset, priceFeed: feed.address }],
 * });
 * ```
 **/
export class InstanceOwnerTransactions {
  readonly #chains: ChainsNamespace;
  readonly #oracles: PermissionlessOracles;

  constructor(chains: ChainsNamespace, oracles: PermissionlessOracles) {
    this.#chains = chains;
    this.#oracles = oracles;
  }

  /**
   * The batch that adds the named feeds to the store and allows the named
   * edges on it.
   *
   * Both lists come from the caller. Which feeds are private, and which asset
   * each is meant to price, is held wherever the curator prepared them — the
   * backend indexes the store, so a feed that has not reached it yet is not
   * something this client can discover.
   *
   * Only feeds that actually carry an edge are added: a feed nobody priced
   * would land in the store doing nothing.
   **/
  public async addFeeds({ chainId, owner, feeds, pairs }: AddFeedsArgs) {
    const batch = await this.#batchContext(chainId);

    const connected = new Set(pairs.map(pair => lower(pair.priceFeed)));
    const feedsToAdd = feeds.filter(feed => connected.has(lower(feed.address)));

    const txs = [
      ...feedsToAdd.map(feed =>
        batch.store.addPriceFeedTx(
          feed.address,
          feed.stalenessPeriod,
          feed.name,
        ),
      ),
      ...pairs.map(pair =>
        batch.store.allowPriceFeedTx(pair.asset, pair.priceFeed),
      ),
    ];

    return this.#envelope({
      batch,
      author: owner,
      name: "pfs-updates",
      txs,
      touchedFeeds: feedsToAdd.map(feed => feed.address),
    });
  }

  /**
   * The batch that renames feeds already in the store. A name is part of what
   * the store holds, so changing one is a remove and a fresh add, followed by
   * allowing the feed again on every asset that priced it.
   **/
  public async changeNames({ chainId, owner, names }: ChangeNamesArgs) {
    const [batch, store] = await Promise.all([
      this.#batchContext(chainId),
      this.#oracles.store({ chainId }),
    ]);
    const feedToAssets = await this.#feedToAssets(batch.store);

    // Both maps are keyed lowercase: the caller names feeds in whatever
    // casing it holds, and a checksummed address must not silently miss.
    const inStore = new Map(
      store.priceFeeds.map(feed => [lower(feed.address), feed]),
    );

    const txs: RawTx[] = [];
    for (const [address, name] of Object.entries(names) as [
      Address,
      string,
    ][]) {
      const feed = inStore.get(lower(address));
      if (!feed) {
        throw new PriceFeedNotInStoreError(address, chainId);
      }

      txs.push(
        batch.store.removePriceFeedTx(feed.address),
        batch.store.addPriceFeedTx(feed.address, feed.stalenessPeriod, name),
      );
      for (const asset of feedToAssets.get(lower(address)) ?? []) {
        txs.push(batch.store.allowPriceFeedTx(asset, feed.address));
      }
    }

    return this.#envelope({
      batch,
      author: owner,
      name: "pricefeed-name-changes",
      txs,
      touchedFeeds: Object.keys(names) as Address[],
    });
  }

  /**
   * The batch that changes how long each feed's price stays valid.
   **/
  public async changeStalenessPeriods({
    chainId,
    owner,
    periods,
  }: ChangeStalenessPeriodsArgs) {
    const batch = await this.#batchContext(chainId);

    const entries = Object.entries(periods) as [Address, number][];
    const txs = entries.map(([address, period]) =>
      batch.store.setStalenessPeriodTx(address, period),
    );

    return this.#envelope({
      batch,
      author: owner,
      name: "pricefeed-staleness-changes",
      txs,
      touchedFeeds: entries.map(([address]) => address),
    });
  }

  /**
   * The batch that forbids feeds on the assets they were allowed for.
   **/
  public async forbidFeeds({ chainId, owner, tokens }: ForbidFeedsArgs) {
    const batch = await this.#batchContext(chainId);

    const txs = Object.entries(tokens).flatMap(([token, feeds]) =>
      feeds.map(feed =>
        createRawTx(batch.store.address, {
          abi: batch.store.abi,
          functionName: "forbidPriceFeed",
          args: [token as Address, feed],
        }),
      ),
    );

    return this.#envelope({
      batch,
      author: owner,
      name: "forbid-feeds",
      txs,
      // Forbidding does not read a price, so nothing has to be fresh.
      touchedFeeds: [],
    });
  }

  /**
   * The batch that pulls every drifted LP feed's lower bound back under its
   * exchange rate. Unlike the others this takes no input: the whole store is
   * scanned and only the feeds that drifted produce a transaction, so this
   * one is slow.
   **/
  public async updateBounds({ chainId, owner }: InstanceTxsArgs) {
    const batch = await this.#batchContext(chainId);

    const pfCompressor = await this.#priceFeedCompressor(batch.client);
    const known = await batch.store.getKnownPriceFeeds();
    const feeds = await getFeedsToUpdate(batch.client, pfCompressor, known);

    const configureTxs: RawTx[] = [];
    for (const feed of feeds) {
      configureTxs.push(...(await updateBounds(batch.client, feed)));
    }

    const txs = [
      batch.store.configurePriceFeeds(
        configureTxs.map(tx => ({ target: tx.to, callData: tx.callData })),
      ),
    ];

    return this.#envelope({
      batch,
      author: owner,
      name: "update-bounds",
      txs,
      // The limiter does not read a price either.
      touchedFeeds: [],
    });
  }

  /**
   * The contracts every batch of one chain is built against.
   *
   * Nothing here checks that the instance is activated: that is a backend
   * read, and an instance without a deployed InstanceManager fails on the
   * owner lookup below anyway.
   **/
  async #batchContext(chainId: number): Promise<BatchContext> {
    const client = this.#chains.client(chainId);
    const instanceManager = new InstanceManagerContract(Addresses.INSTANCE_MANAGER,
      new ChainContractsRegister(client),
    );

    return {
      chainId,
      client,
      store: new PriceFeedStoreContract(Addresses.PRICE_FEED_STORE, client),
      instanceManager,
      instanceOwner: await instanceManager.getOwner(),
    };
  }

  /** The common shape every batch is returned in. */
  async #envelope(args: {
    batch: BatchContext;
    author: Address;
    name: string;
    txs: RawTx[];
    /** The feeds whose price the batch reads, and so must be fresh for. */
    touchedFeeds: Address[];
  }): Promise<InstanceTxs> {
    const { batch, author, name, txs, touchedFeeds } = args;
    const { chainId, client, instanceManager, instanceOwner } = batch;

    const wrapped = txs.map(tx => instanceManager.wrapConfigureLocal(tx));
    const safeBatch = getSafeBatch({
      chainId,
      safeAddress: instanceOwner,
      name,
      txs: wrapped.map(tx => convertRawTxToSafeMultisigTx(tx)),
    });

    const [block, updatableFeeds] = await Promise.all([
      client.getBlock(),
      this.#updatableFeeds(touchedFeeds, client),
    ]);

    return {
      chainId,
      author,
      instanceManager: instanceManager.address,
      batches: [safeBatch.transactions],
      createdAtBlock: Number(block.number),
      updatableFeeds: [updatableFeeds],
    };
  }

  /** Which of the touched feeds the executor has to push a price update for. */
  async #updatableFeeds(
    touchedFeeds: Address[],
    client: PublicClient<Transport, Chain>,
  ): Promise<Address[]> {
    if (touchedFeeds.length === 0) {
      return [];
    }
    const sdk = await this.#sdk(client);
    const contracts = await getUpdatablePriceFeeds({
      sdk,
      client,
      pfCompressor: this.#compressorFrom(sdk),
      priceFeeds: touchedFeeds,
    });
    return contracts.map(contract => contract.address);
  }

  async #priceFeedCompressor(
    client: PublicClient<Transport, Chain>,
  ): Promise<Address> {
    return this.#compressorFrom(await this.#sdk(client));
  }

  #compressorFrom(sdk: OnchainSDK): Address {
    const [compressor] = sdk.addressProvider.mustGetLatest(
      AP_PRICE_FEED_COMPRESSOR,
      VERSION_RANGE_310,
    );
    return compressor;
  }

  async #sdk(client: PublicClient<Transport, Chain>): Promise<OnchainSDK> {
    const chainId = client.chain?.id ?? (await client.getChainId());
    const sdk = new OnchainSDK(getNetworkType(chainId), {
      client: client as PublicClient<Transport, GearboxChain>,
    });
    await sdk.attach({ marketConfigurators: [] });
    return sdk;
  }

  /** Every asset each feed is currently allowed on, keyed by lowercase feed. */
  async #feedToAssets(
    store: PriceFeedStoreContract,
  ): Promise<Map<string, Address[]>> {
    const byFeed = new Map<string, Address[]>();
    for (const { token, priceFeeds } of await store.getTokenPriceFeedsMap()) {
      for (const feed of priceFeeds) {
        const key = lower(feed);
        const assets = byFeed.get(key);
        if (assets) {
          assets.push(token.toLowerCase() as Address);
        } else {
          byFeed.set(key, [token.toLowerCase() as Address]);
        }
      }
    }
    return byFeed;
  }
}
