import type { Address } from "viem";
import { z } from "zod/v4";
import { convertPercent } from "../../utils/format.js";
import { addressSchema, percentageSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { byToken, requiresAsset } from "./utils/actionKeys.js";
import { assetNotFound, findAsset, noOp } from "./utils/checkHelpers.js";
import { configurePool } from "./utils/configureCalls.js";
import { updateMarketAsset } from "./utils/updateMarketAsset.js";

export interface SetTokenQuotaIncreaseFeeParams {
  token: Address;
  fee: number; // This is a percentage
}

export type SetTokenQuotaIncreaseFeeAction = BaseMarketAction<
  "POOL::setTokenQuotaIncreaseFee",
  SetTokenQuotaIncreaseFeeParams
>;

export const setTokenQuotaIncreaseFeeActionData: MarketScopedDefinition<SetTokenQuotaIncreaseFeeAction> =
  defineMarketAction<SetTokenQuotaIncreaseFeeAction>({
    type: "POOL::setTokenQuotaIncreaseFee",
    gas: () => 70_000, // got 65,571
    description: `Set quota increase fee for a token. The function is used to set fee for a particular token that is paid when
    user increases quota of a credit manager.`,
    schema: z.object({
      token: addressSchema,
      fee: percentageSchema,
    }),
    check: ({ state, params }) => {
      const asset = findAsset(state, params.token);
      if (!asset) return [assetNotFound(params.token)];
      return convertPercent(asset.quotaIncreaseFee) ===
        convertPercent(params.fee)
        ? [
            noOp(`Quota increase fee is already ${params.fee}%`, [
              "params",
              "fee",
            ]),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateMarketAsset({
        state,
        token: params.token,
        update: asset => ({ ...asset, quotaIncreaseFee: params.fee }),
      }),
    requires: requiresAsset,
    key: byToken,
    encode: ({ ctx, state, params }) =>
      configurePool(ctx, state, {
        functionName: "setTokenQuotaIncreaseFee",
        args: [params.token, convertPercent(params.fee)],
      }),
  });
