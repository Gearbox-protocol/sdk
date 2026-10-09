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
