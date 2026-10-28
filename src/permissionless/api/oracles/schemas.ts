import { z } from "zod/v4";
import { addressRecord, addressSchema } from "../schemas.js";

/**
 * Runtime schemas for {@link ./types.js}.
 *
 * The objects are loose: the backend reads most of these rows straight off the
 * chain through the SDK's own bindings, which attach fields the hand-written
 * types do not declare, and dropping them would make this client lossier than
 * the payload it decodes.
 **/

/** {@link PriceFeed}, as the backend serves it. */
export const priceFeedSchema = z.looseObject({
  address: addressSchema,
  contractType: z.string(),
  version: z.number(),
  deployedBy: addressSchema,
  stalenessPeriod: z.number(),
  name: z.string(),
});

/** {@link PermissionlessAsset} */
export const assetSchema = z.looseObject({
  address: addressSchema,
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  owner: addressSchema,
  priceFeeds: z.array(priceFeedSchema),
});

/** {@link PermissionlessPriceFeedStore} */
export const priceFeedStoreSchema = z.looseObject({
  chainId: z.number(),
  name: z.string(),
  isPublic: z.boolean(),
  isActivated: z.boolean(),
  explorerUrl: z.string(),
  assets: z.array(assetSchema),
  priceFeeds: z.array(priceFeedSchema),
});

/** {@link PermissionlessPrices} */
export const pricesSchema = z.looseObject({
  prices: addressRecord(z.string().nullable()),
  marketCaps: addressRecord(addressRecord(z.string().nullable())),
  time: z.number(),
});

/** {@link PermissionlessPriceFeedAsset} */
export const priceFeedAssetSchema = z.looseObject({
  address: addressSchema,
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
});

/** {@link PermissionlessPriceFeedMarket} */
export const priceFeedMarketSchema = z.looseObject({
  market: addressSchema,
  marketConfigurator: addressSchema,
  curatorName: z.string().nullable(),
  marketName: z.string().nullable(),
  token: addressSchema,
  tokenSymbol: z.string().nullable(),
  underlyingSymbol: z.string().nullable(),
  reserve: z.boolean(),
  isUnderlying: z.boolean(),
  quotaLimit: z.number().nullable(),
  quotaUsed: z.number().nullable(),
  marketStalenessPeriod: z.number().nullable(),
});

/** {@link PermissionlessPriceFeedDetails} */
export const priceFeedDetailsSchema = z.looseObject({
  chainId: z.number(),
  priceFeed: priceFeedSchema,
  assets: z.array(priceFeedAssetSchema),
  markets: z.array(priceFeedMarketSchema),
});

/** {@link PermissionlessPriceFeedMarketCaps} */
export const priceFeedMarketCapsSchema = z.looseObject({
  marketCaps: addressRecord(z.string().nullable()),
  time: z.number(),
});

/** {@link PermissionlessAssetMarketFeed} */
export const assetMarketFeedSchema = z.looseObject({
  address: addressSchema,
  name: z.string().nullable(),
  inStore: z.boolean(),
});

/** {@link PermissionlessAssetMarket} */
export const assetMarketSchema = z.looseObject({
  market: addressSchema,
  marketConfigurator: addressSchema,
  curatorName: z.string().nullable(),
  marketName: z.string().nullable(),
  underlyingToken: addressSchema,
  underlyingSymbol: z.string().nullable(),
  isUnderlying: z.boolean(),
  isShutdown: z.boolean(),
  mainFeed: assetMarketFeedSchema.nullable(),
  reserveFeed: assetMarketFeedSchema.nullable(),
  quotaLimit: z.number().nullable(),
  quotaUsed: z.number().nullable(),
});

/** {@link PermissionlessAssetDetails} */
export const assetDetailsSchema = z.looseObject({
  chainId: z.number(),
  asset: priceFeedAssetSchema,
  priceFeeds: z.array(priceFeedSchema),
  markets: z.array(assetMarketSchema),
  quotaLimitUsd: z.number().nullable(),
  quotaUsedUsd: z.number().nullable(),
});

/** {@link PermissionlessAssetPrices} */
export const assetPricesSchema = z.looseObject({
  prices: addressRecord(z.string().nullable()),
  marketCaps: addressRecord(z.string().nullable()),
  time: z.number(),
});

/** {@link PermissionlessAssetSummary} */
export const assetSummarySchema = z.looseObject({
  chainId: z.number(),
  address: addressSchema,
  symbol: z.string(),
  underlyingMarketCount: z.number(),
  quotaLimitUsd: z.number().nullable(),
  quotaUsedUsd: z.number().nullable(),
});

/** The list of {@link PermissionlessAssetSummary}, already ordered. */
export const assetSummariesSchema = z.array(assetSummarySchema);
