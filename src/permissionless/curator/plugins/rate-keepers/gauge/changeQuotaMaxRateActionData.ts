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

export type ChangeQuotaMaxRateAction = {
  type: "RATE_KEEPER::GAUGE::changeQuotaMaxRate";
  params: {
    token: Address;
    maxRate: number;
  };
};

export const changeQuotaMaxRateActionData: MarketScopedDefinition<ChangeQuotaMaxRateAction> =
  defineMarketAction<ChangeQuotaMaxRateAction>({
    type: "RATE_KEEPER::GAUGE::changeQuotaMaxRate",
    gas: () => 75_000, // not measured; same as the min rate
    description: `Change quota max rate. The function is used to set max quota rate for a particular token, Additional
    interest rate = minRate * wieghted_votes_for_min + maxRate * weighted_votes_for_max.`,
    schema: z.object({
      token: addressSchema,
      maxRate: uintSchema(16).min(1, "Rate must be positive"),
    }),
    check: ({ state, params }) => {
      if (state.rateKeeper.type !== "GAUGE") {
        return [rateKeeperMismatch("GAUGE", state.rateKeeper.type)];
      }
      const rates = state.rateKeeper.rates[lowerAddress(params.token)];
      if (!rates) return [tokenNotQuoted(params.token)];
      if (rates.maxRate === params.maxRate) {
        return [
          noOp(`The maximal rate is already ${params.maxRate}`, [
            "params",
            "maxRate",
          ]),
        ];
      }
      return params.maxRate < rates.minRate
        ? [
            actionError(
              "MIN_RATE_ABOVE_MAX",
              `The maximal rate must not be below the minimal rate ${rates.minRate}`,
              ["params", "maxRate"],
            ),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateQuotaRate(state, params.token, { maxRate: params.maxRate }),
    encode: ({ ctx, state, params }) =>
      configureRateKeeper(ctx, state, iGaugeV310Abi, {
        functionName: "changeQuotaMaxRate",
        args: [params.token, params.maxRate],
      }),
    // Two changeQuotaMaxRate actions for the same token replace each other
    requires: requiresAsset,
    key: byToken,
  });
