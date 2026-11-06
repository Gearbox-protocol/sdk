import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { rateKeeperPlugins } from "../plugins/rate-keepers/rateKeeperPlugins.js";
import type { MarketAsset } from "../state/market/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import { actionError } from "./actionDiagnostics.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { byToken, resource } from "./utils/actionKeys.js";
import {
  findAsset,
  isUnderlying,
  underlyingNotAllowed,
} from "./utils/checkHelpers.js";
import {
  type PriceFeedResolution,
  priceFeedDiagnostics,
  resolvePriceFeed,
} from "./utils/priceFeedChecks.js";

export interface AddAssetParams {
  token: Address;
  priceFeed: Address;
}

export type AddAssetAction = BaseMarketAction<
  "MARKET::addAsset",
  AddAssetParams
>;

export const addAssetActionData: MarketScopedDefinition<
  AddAssetAction,
  PriceFeedResolution
> = defineMarketAction<AddAssetAction, PriceFeedResolution>({
  type: "MARKET::addAsset",
  // @dev depends on the price feed tree; got 411,732, 380,720 & 491,321
  gas: () => 500_000,
  touchedFeeds: ({ params }) => [params.priceFeed],
  description: `Add a new asset to the market. Further this asset could be used as collateral in credit managers.`,
  schema: z.object({
    token: addressSchema,
    priceFeed: addressSchema,
  }),
  resolve: ({ ctx, params }) =>
    resolvePriceFeed(ctx, params.token, params.priceFeed),
  check: ({ state, params, resolved }) => {
    if (isUnderlying(state, params.token)) return [underlyingNotAllowed()];
    return findAsset(state, params.token)
      ? [
          actionError(
            "ASSET_EXISTS",
            `Token ${params.token} is already a quoted asset`,
            ["params", "token"],
          ),
        ]
      : priceFeedDiagnostics(resolved);
  },
  apply: ({ state, params }) => {
    const tokenAddress = lowerAddress(params.token);

    const newAsset: MarketAsset = {
      address: tokenAddress,
      mainPriceFeed: lowerAddress(params.priceFeed),
      reservePriceFeed: zeroAddress,
      quotaLimit: 0,
      quotaIncreaseFee: 0,
    };

    // A new asset is quoted, so the rate keeper starts tracking a rate for it.
    return rateKeeperPlugins[state.rateKeeper.type].onNewAsset(
      { ...state, assets: { ...state.assets, [tokenAddress]: newAsset } },
      tokenAddress,
    );
  },
  encode: ({ ctx, state, params }) =>
    ctx.marketConfigurator.addAsset(state.address, params),
  provides: params => [resource.asset(params.token)],
  key: byToken,
});
