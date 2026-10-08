import type { Address } from "viem";
import { AbstractOffchainNamespace } from "../../../offchain/AbstractOffchainNamespace.js";
import { getPrices } from "../../utils/price-update/get-prices.js";
import type { ChainsNamespace } from "../chains/ChainsNamespace.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import { priceFeedStoreSchema, pricesSchema } from "./schemas.js";
import type {
  GetPricesArgs,
  PermissionlessPriceFeedStore,
  PermissionlessPrices,
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
   * A price per feed, and a market cap per feed and asset. The feeds the
   * indexer has not seen are read off the chain by the backend, so the store
   * is priced whole.
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
