import type { Address } from "viem";
import { z } from "zod/v4";
import { iGaugeV310Abi } from "../../../../../abi/310/generated.js";
import { actionError } from "../../../actions/actionDiagnostics.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { byToken, requiresAsset } from "../../../actions/utils/actionKeys.js";
import {
  noOp,
  rateKeeperMismatch,
  tokenNotQuoted,
} from "../../../actions/utils/checkHelpers.js";
import { configureRateKeeper } from "../../../actions/utils/configureCalls.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema, uintSchema } from "../../../validationSchemas.js";
import { updateQuotaRate } from "./updateQuotaRate.js";

export type ChangeQuotaMinRateAction = {
  type: "RATE_KEEPER::GAUGE::changeQuotaMinRate";
  params: {
    token: Address;
    minRate: number;
  };
};

export const changeQuotaMinRateActionData: MarketScopedDefinition<ChangeQuotaMinRateAction> =
  defineMarketAction<ChangeQuotaMinRateAction>({
    type: "RATE_KEEPER::GAUGE::changeQuotaMinRate",
    gas: () => 75_000, // got 72,565
    description: `Change quota min rate. The function is used to set min quota rate for a particular token, Additional
    interest rate = minRate * wieghted_votes_for_min + maxRate * weighted_votes_for_max.`,
    schema: z.object({
      token: addressSchema,
      minRate: uintSchema(16).min(1, "Rate must be positive"),
    }),
    check: ({ state, params }) => {
      if (state.rateKeeper.type !== "GAUGE") {
        return [rateKeeperMismatch("GAUGE", state.rateKeeper.type)];
      }
      const rates = state.rateKeeper.rates[lowerAddress(params.token)];
      if (!rates) return [tokenNotQuoted(params.token)];
      if (rates.minRate === params.minRate) {
        return [
          noOp(`The minimal rate is already ${params.minRate}`, [
            "params",
            "minRate",
          ]),
        ];
      }
      return params.minRate > rates.maxRate
        ? [
            actionError(
              "MIN_RATE_ABOVE_MAX",
              `The minimal rate must not exceed the maximal rate ${rates.maxRate}`,
              ["params", "minRate"],
            ),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateQuotaRate(state, params.token, { minRate: params.minRate }),
    encode: ({ ctx, state, params }) =>
      configureRateKeeper(ctx, state, iGaugeV310Abi, {
        functionName: "changeQuotaMinRate",
        args: [params.token, params.minRate],
      }),
    // Two changeQuotaMinRate actions for the same token replace each other
    requires: requiresAsset,
    key: byToken,
  });
