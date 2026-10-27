import type { Address } from "viem";
import { z } from "zod/v4";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { byToken, requiresAsset } from "./utils/actionKeys.js";
import {
  assetNotFound,
  findAsset,
  isUnderlying,
  noOp,
} from "./utils/checkHelpers.js";
import { configurePriceOracle } from "./utils/configureCalls.js";
import {
  type PriceFeedResolution,
  priceFeedDiagnostics,
  resolvePriceFeed,
} from "./utils/priceFeedChecks.js";
import { updateMarketAsset } from "./utils/updateMarketAsset.js";

export interface SetReservePriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export type SetReservePriceFeedAction = BaseMarketAction<
  "ORACLE::setReservePriceFeed",
  SetReservePriceFeedParams
>;

export const setReservePriceFeedActionData: MarketScopedDefinition<
  SetReservePriceFeedAction,
  PriceFeedResolution
> = defineMarketAction<SetReservePriceFeedAction, PriceFeedResolution>({
  type: "ORACLE::setReservePriceFeed",
  // @dev depends on the price feed tree; got 132,594
  gas: () => 150_000,
  touchedFeeds: ({ params }) => [params.priceFeed],
  description: `Set reserve price feed for a token. Reserve price feed is used to calculate price of a token during total
collateral computation. The final price for such computation is a minimum between main price feed and reserve price feed.`,
  schema: z.object({
    token: addressSchema,
    priceFeed: addressSchema,
  }),
  resolve: ({ ctx, params }) =>
    resolvePriceFeed(ctx, params.token, params.priceFeed, "reserve"),
  check: ({ state, params, resolved }) => {
    const asset = findAsset(state, params.token);
    if (!asset && !isUnderlying(state, params.token))
      return [assetNotFound(params.token)];
    const current = isUnderlying(state, params.token)
      ? state.underlyingReservePriceFeed
      : asset?.reservePriceFeed;
    return current && isSameAddress(current, params.priceFeed)
      ? [
          noOp("The token already uses this reserve price feed", [
            "params",
            "priceFeed",
          ]),
        ]
      : priceFeedDiagnostics(resolved);
  },
  apply: ({ state, params }) =>
    isUnderlying(state, params.token)
      ? {
          ...state,
          underlyingReservePriceFeed: lowerAddress(params.priceFeed),
        }
      : updateMarketAsset({
          state,
          token: params.token,
          update: asset => ({
            ...asset,
            reservePriceFeed: lowerAddress(params.priceFeed),
          }),
        }),
  requires: requiresAsset,
  key: byToken,
  merge: { position: "last", barriers: ["ORACLE::setPriceFeed"] },
  encode: ({ ctx, state, params }) =>
    configurePriceOracle(ctx, state, {
      functionName: "setReservePriceFeed",
      args: [params.token, params.priceFeed],
    }),
});
