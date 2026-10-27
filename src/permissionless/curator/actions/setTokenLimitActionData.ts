import type { Address } from "viem";
import { z } from "zod/v4";
import { lowerAddress } from "../utils/addressUtils.js";
import { addressSchema, tokenAmountSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import { convertUnderlyingAmount } from "./builderContext.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { byToken, requiresAsset } from "./utils/actionKeys.js";
import { assetNotFound, findAsset, noOp } from "./utils/checkHelpers.js";
import { configurePool } from "./utils/configureCalls.js";
import { amountDiagnostics, MAX_QUOTA } from "./utils/rawAmounts.js";
import { updateMarketAsset } from "./utils/updateMarketAsset.js";

export interface SetTokenLimitContext {
  token: Address;
}
export interface SetTokenLimitParams extends SetTokenLimitContext {
  limit: number | string;
}

export type SetTokenLimitAction = BaseMarketAction<
  "POOL::setTokenLimit",
  SetTokenLimitParams
>;

export const setTokenLimitActionData: MarketScopedDefinition<SetTokenLimitAction> =
  defineMarketAction<SetTokenLimitAction>({
    type: "POOL::setTokenLimit",
    gas: () => 120_000, // got 116,016
    touchedFeeds: ({ params, after }) => {
      const feed = after.assets[lowerAddress(params.token)]?.mainPriceFeed;
      return feed ? [feed] : [];
    },
    description: `Set token limit.
The function is used to set max possible amount of a particular token that could be used as collateral across whole market.`,
    schema: z.object({
      token: addressSchema,
      limit: tokenAmountSchema,
    }),
    check: ({ state, params, env }) => {
      const asset = findAsset(state, params.token);
      if (!asset) return [assetNotFound(params.token)];
      const bounds = amountDiagnostics(env, state, params.limit, MAX_QUOTA);
      if (bounds.length) return bounds;
      return asset.quotaLimit === Number(params.limit)
        ? [noOp(`Token limit is already ${params.limit}`, ["params", "limit"])]
        : [];
    },
    apply: ({ state, params }) =>
      updateMarketAsset({
        state,
        token: params.token,
        update: asset => ({
          ...asset,
          quotaLimit: Number(params.limit),
        }),
      }),
    requires: requiresAsset,
    key: byToken,
    // @dev quota limits are denominated in the underlying, not in the token
    encode: ({ ctx, state, params }) =>
      configurePool(ctx, state, {
        functionName: "setTokenLimit",
        args: [params.token, convertUnderlyingAmount(ctx, state, params.limit)],
      }),
  });
