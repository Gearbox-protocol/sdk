import { z } from "zod/v4";
import { assetTypeSchema } from "../../../model/primitives.schema.js";
import { chainSchema } from "../chains/schemas.js";
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

/**
 * {@link PermissionlessPriceFeedAsset}
 *
 * What identifies an asset, which is all a feed's own listing of one says.
 **/
export const priceFeedAssetSchema = z.looseObject({
  address: addressSchema,
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
});

/** {@link PermissionlessAsset} — identified as above, plus what prices it. */
export const assetSchema = priceFeedAssetSchema.extend({
  owner: addressSchema,
  priceFeeds: z.array(priceFeedSchema),
});

/**
 * {@link PermissionlessPriceFeedStore}
 *
 * A store is a chain's, and is described by the same five fields the chain
 * list answers with, so those are extended rather than restated.
 **/
export const priceFeedStoreSchema = chainSchema.extend({
  assets: z.array(assetSchema),
  priceFeeds: z.array(priceFeedSchema),
});

/** {@link PermissionlessPrices} */
export const pricesSchema = z.looseObject({
  prices: addressRecord(z.string().nullable()),
  marketCaps: addressRecord(addressRecord(z.string().nullable())),
  time: z.number(),
});

/**
 * What names a market, whichever side it is being listed from.
 *
 * A feed's markets and an asset's markets are different reads, but they
 * answer with the same market: who curates it, what it is denominated in and
 * how much of the quota is taken. Only what the read is about differs, which
 * is what each of the two below adds.
 **/
const marketSchema = z.looseObject({
  market: addressSchema,
  marketConfigurator: addressSchema,
  curatorName: z.string().nullable(),
  marketName: z.string().nullable(),
  underlyingSymbol: z.string().nullable(),
  isUnderlying: z.boolean(),
  quotaLimit: z.number().nullable(),
  quotaUsed: z.number().nullable(),
});

/** {@link PermissionlessPriceFeedMarket} — the market as the feed's slot in it. */
export const priceFeedMarketSchema = marketSchema.extend({
  token: addressSchema,
  tokenSymbol: z.string().nullable(),
  reserve: z.boolean(),
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

/** {@link PermissionlessAssetMarket} — the market as what prices the asset in it. */
export const assetMarketSchema = marketSchema.extend({
  underlyingToken: addressSchema,
  isShutdown: z.boolean(),
  mainFeed: assetMarketFeedSchema.nullable(),
  reserveFeed: assetMarketFeedSchema.nullable(),
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

/**
 * {@link PermissionlessAssetPrices}
 *
 * The same shape as {@link priceFeedMarketCapsSchema} plus the prices, but not
 * an extension of it: the caps there are keyed by asset and these are keyed by
 * feed, so what the two have in common is a coincidence of form.
 **/
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
  // Defaulted rather than merely nullable, so that a backend older than this
  // client is read as "nothing is known" instead of refused: the field says
  // what a curated table says about the asset, and a payload without it is
  // one that was built before the table was consulted.
  assetType: assetTypeSchema.nullable().default(null),
});

/** The list of {@link PermissionlessAssetSummary}, already ordered. */
export const assetSummariesSchema = z.array(assetSummarySchema);
