import { type Address, zeroAddress } from "viem";
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

export interface SetPriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export type SetPriceFeedAction = BaseMarketAction<
  "ORACLE::setPriceFeed",
  SetPriceFeedParams
>;

export const setPriceFeedActionData: MarketScopedDefinition<
  SetPriceFeedAction,
  PriceFeedResolution
> = defineMarketAction<SetPriceFeedAction, PriceFeedResolution>({
  type: "ORACLE::setPriceFeed",
  // @dev depends on the price feed tree; got 126,049
  gas: () => 150_000,
  touchedFeeds: ({ params }) => [params.priceFeed],
  description: `Set price feed for a token. Price feed is used to calculate price of a token during total collateral computation.
It's also used to calculate price of a token during liquidation.`,
  schema: z.object({
    token: addressSchema,
    priceFeed: addressSchema,
  }),
  resolve: ({ ctx, params }) =>
    resolvePriceFeed(ctx, params.token, params.priceFeed),
  check: ({ state, params, resolved }) => {
    const current = isUnderlying(state, params.token)
      ? state.underlyingPriceFeed
      : findAsset(state, params.token)?.mainPriceFeed;
    if (current === undefined) return [assetNotFound(params.token)];
    return isSameAddress(current, params.priceFeed)
      ? [
          noOp("The token already uses this price feed", [
            "params",
            "priceFeed",
          ]),
        ]
      : priceFeedDiagnostics(resolved);
  },
  apply: ({ state, params }) => {
    const priceFeed = lowerAddress(params.priceFeed);

    // The underlying is not a quoted asset; its feed lives on the market.
    if (isUnderlying(state, params.token)) {
      return {
        ...state,
        underlyingPriceFeed: priceFeed,
        underlyingReservePriceFeed:
          state.underlyingReservePriceFeed &&
          isSameAddress(state.underlyingReservePriceFeed, priceFeed)
            ? zeroAddress
            : state.underlyingReservePriceFeed,
      };
    }

    return updateMarketAsset({
      state,
      token: params.token,
      update: asset => ({
        ...asset,
        mainPriceFeed: priceFeed,
        reservePriceFeed: isSameAddress(asset.reservePriceFeed, priceFeed)
          ? zeroAddress
          : asset.reservePriceFeed,
      }),
    });
  },
  encode: ({ ctx, state, params }) =>
    configurePriceOracle(ctx, state, {
      functionName: "setPriceFeed",
      args: [params.token, params.priceFeed],
    }),
  requires: requiresAsset,
  key: byToken,
  merge: { position: "last", barriers: ["ORACLE::setReservePriceFeed"] },
});
