import type { Address, Hex } from "viem";
import type { PriceFeed } from "../../core/index.js";

/**
 * Where a feed stands for the asset it prices:
 *
 * - `private` — known to the backend only, not yet in the PriceFeedStore;
 * - `inStore` — allowed for the asset on chain;
 * - `pendingForbidden` — still allowed, with a removal prepared;
 * - `forbidden` — no longer allowed for the asset.
 **/
export type PermissionlessPriceFeedStatus =
  | "private"
  | "inStore"
  | "pendingForbidden"
  | "forbidden";

/**
 * One asset of a chain, with the feeds attached to it. The key is spelled
 * `pricefeed` because that is what the backend answers with.
 **/
export interface PermissionlessAsset {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
  isInStore: boolean;
  owner: Address;
  priceFeeds: Array<{
    pricefeed: PriceFeed;
    status: PermissionlessPriceFeedStatus;
  }>;
}

/**
 * The PriceFeedStore of one chain as a caller may see it: what the store
 * carries, plus the assets, feeds and connections that caller has added
 * without uploading them yet.
 **/
export interface PermissionlessPriceFeedStore {
  chainId: number;
  name: string;
  isPublic: boolean;
  isActivated: boolean;
  explorerUrl: string;
  assets: PermissionlessAsset[];
  priceFeeds: PriceFeed[];
}

/**
 * A price per feed, and a market cap per feed and the asset it prices.
 * `null` is a price the backend could not read, not a zero.
 **/
export interface PermissionlessPrices {
  prices: Record<Address, string | null>;
  marketCaps: Record<Address, Record<Address, string | null>>;
  time: number;
}

/**
 * What every route of {@link PermissionlessOracles} names, see
 * {@link PermissionlessOracles}.
 **/
export interface PermissionlessOraclesArgs {
  chainId: number;
  /**
   * Whose rows to read or write. Only honoured for service calls with the API
   * key: a signed-in caller is identified by their access token, and naming
   * another address is rejected rather than quietly scoped to themselves.
   **/
  owner?: Address;
}

/** Args of {@link PermissionlessOracles.addAsset}. */
export interface AddAssetArgs extends PermissionlessOraclesArgs {
  asset: Address;
}

/**
 * Args of {@link PermissionlessOracles.connect} and
 * {@link PermissionlessOracles.disconnect}.
 **/
export interface ConnectPriceFeedArgs extends PermissionlessOraclesArgs {
  asset: Address;
  priceFeed: Address;
}

/** Args of {@link PermissionlessOracles.registerDeployed}. */
export interface RegisterDeployedPriceFeedArgs
  extends PermissionlessOraclesArgs {
  /** Name the feed is registered under, which the store reports as its own. */
  name: string;
  /** The `BytecodeRepository.deploy` transaction the feed came out of. */
  transactionHash: Hex;
  stalenessPeriod: number;
}

/** Args of {@link PermissionlessOracles.registerExternal}. */
export interface RegisterExternalPriceFeedArgs
  extends PermissionlessOraclesArgs {
  name: string;
  priceFeed: Address;
  stalenessPeriod: number;
  /**
   * The owner's signature over
   * `PriceFeedStoreContract.computeEIP712ExternalPriceFeedDigest`, which is
   * what vouches for a feed nobody deployed through the repository.
   **/
  signature: Hex;
}
