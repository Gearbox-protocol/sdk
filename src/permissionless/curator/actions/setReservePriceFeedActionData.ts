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
import { assetNotFound, findAsset, noOp } from "./utils/checkHelpers.js";
import { configurePriceOracle } from "./utils/configureCalls.js";
import { updateMarketAsset } from "./utils/updateMarketAsset.js";

export interface SetReservePriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export type SetReservePriceFeedAction = BaseMarketAction<
  "ORACLE::setReservePriceFeed",
  SetReservePriceFeedParams
>;

export const setReservePriceFeedActionData: MarketScopedDefinition<SetReservePriceFeedAction> =
  defineMarketAction<SetReservePriceFeedAction>({
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
    check: ({ state, params }) => {
      const asset = findAsset(state, params.token);
      if (!asset) return [assetNotFound(params.token)];
      return isSameAddress(asset.reservePriceFeed, params.priceFeed)
        ? [
            noOp("The token already uses this reserve price feed", [
              "params",
              "priceFeed",
            ]),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateMarketAsset({
        state,
        token: params.token,
        update: asset => ({
          ...asset,
          reservePriceFeed: lowerAddress(params.priceFeed),
        }),
      }),
    requires: requiresAsset,
    key: byToken,
    encode: ({ ctx, state, params }) =>
      configurePriceOracle(ctx, state, {
        functionName: "setReservePriceFeed",
        args: [params.token, params.priceFeed],
      }),
  });
