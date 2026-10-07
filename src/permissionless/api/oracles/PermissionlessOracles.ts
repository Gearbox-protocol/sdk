import { AbstractPermissionlessNamespace } from "../AbstractPermissionlessNamespace.js";
import type { GearboxPermissionlessOptions } from "../types.js";
import { priceFeedStoreSchema, pricesSchema } from "./schemas.js";
import type {
  AddAssetArgs,
  ConnectPriceFeedArgs,
  PermissionlessOraclesArgs,
  PermissionlessPriceFeedStore,
  PermissionlessPrices,
  RegisterDeployedPriceFeedArgs,
  RegisterExternalPriceFeedArgs,
} from "./types.js";

/**
 * Everything the price feeds of one chain are: the PriceFeedStore as the
 * caller may see it, the prices behind it, and the rows that put a feed there
 * — an asset to price, a feed deployed or vouched for, a feed attached to an
 * asset.
 *
 * Every mutating route answers with the whole {@link PermissionlessPriceFeedStore}
 * again, so a caller never needs a follow-up read to render the result.
 *
 * ```ts
 * const store = await permissionless.oracles.store({ chainId: 1 });
 * const { prices } = await permissionless.oracles.prices({ chainId: 1 });
 * ```
 *
 * The owner of every route is the address in the caller's access token. The
 * `owner` an argument carries is only honoured for service calls with the API
 * key, which have no identity of their own.
 **/
export class PermissionlessOracles extends AbstractPermissionlessNamespace {
  constructor(options: GearboxPermissionlessOptions) {
    super("PermissionlessOracles", options);
  }

  /**
   * The store with the assets and feeds the caller may see. Answers
   * anonymously with just the store, so an interface can render it before
   * anyone signs in.
   **/
  public async store({
    chainId,
    owner,
  }: PermissionlessOraclesArgs): Promise<PermissionlessPriceFeedStore> {
    return this.get({
      path: `/pfs/${chainId}`,
      query: { owner },
      schema: priceFeedStoreSchema,
    });
  }

  /**
   * A price per feed, and a market cap per feed and asset. The feeds the store
   * does not carry are read off the chain by the backend, so a caller's own
   * feeds are priced too.
   **/
  public async prices({
    chainId,
    owner,
  }: PermissionlessOraclesArgs): Promise<PermissionlessPrices> {
    return this.get({
      path: `/pfs/${chainId}/prices`,
      query: { owner },
      schema: pricesSchema,
    });
  }

  /**
   * Adds an asset to price. The asset itself is read off the chain, so only
   * its address is named here.
   **/
  public async addAsset({
    chainId,
    asset,
    owner,
  }: AddAssetArgs): Promise<PermissionlessPriceFeedStore> {
    return this.post({
      path: `/pfs/${chainId}/asset`,
      body: { asset, owner },
      schema: priceFeedStoreSchema,
    });
  }

  /**
   * Attaches a feed to an asset. Nothing is sent on chain: the connection is
   * held here until it goes into a batch the instance owner executes.
   **/
  public async connect({
    chainId,
    asset,
    priceFeed,
    owner,
  }: ConnectPriceFeedArgs): Promise<PermissionlessPriceFeedStore> {
    return this.post({
      path: `/pfs/${chainId}/connect`,
      body: { asset, pricefeed: priceFeed, owner },
      schema: priceFeedStoreSchema,
    });
  }

  /**
   * Detaches a feed from an asset, undoing a {@link connect} that was never
   * uploaded.
   **/
  public async disconnect({
    chainId,
    asset,
    priceFeed,
    owner,
  }: ConnectPriceFeedArgs): Promise<PermissionlessPriceFeedStore> {
    return this.post({
      path: `/pfs/${chainId}/disconnect`,
      body: { asset, pricefeed: priceFeed, owner },
      schema: priceFeedStoreSchema,
    });
  }

  /**
   * Records a feed that was just deployed, see
   * {@link PermissionlessDeploy.priceFeed}. The address is taken off the
   * `DeployContract` event of the transaction named, which is why the hash is
   * what a caller reports rather than the address it produced.
   **/
  public async registerDeployed({
    chainId,
    name,
    transactionHash,
    stalenessPeriod,
    owner,
  }: RegisterDeployedPriceFeedArgs): Promise<PermissionlessPriceFeedStore> {
    return this.post({
      path: `/pfs/${chainId}/deploy`,
      body: { name, transactionHash, stalenessPeriod, owner },
      schema: priceFeedStoreSchema,
    });
  }

  /**
   * Records a feed that was not deployed through the BytecodeRepository, and
   * is therefore vouched for by a signature instead of by its bytecode.
   **/
  public async registerExternal({
    chainId,
    name,
    priceFeed,
    stalenessPeriod,
    signature,
    owner,
  }: RegisterExternalPriceFeedArgs): Promise<PermissionlessPriceFeedStore> {
    return this.post({
      path: `/pfs/${chainId}/external`,
      body: { name, priceFeed, stalenessPeriod, signature, owner },
      schema: priceFeedStoreSchema,
    });
  }
}
