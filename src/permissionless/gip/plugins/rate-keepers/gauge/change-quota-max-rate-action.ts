import { type Address, parseAbi } from "viem";
import { z } from "zod";
import { createCallData } from "../../../../index.js";
import type { MarketActionData } from "../../../core/actions/types.js";
import { addressSchema, numberSchema } from "../../../core/validation.js";
import { updateRateKeeperState } from "../logic.js";
import type { GaugeRateKeeperState } from "./logic.js";

export type ChangeQuotaMaxRateAction = {
  type: "RATE_KEEPER::GAUGE::changeQuotaMaxRate";
  params: {
    token: Address;
    maxRate: number;
  };
};

export const changeQuotaMaxRateActionData: MarketActionData<ChangeQuotaMaxRateAction> =
  {
    type: "RATE_KEEPER::GAUGE::changeQuotaMaxRate",
    description: `Change quota max rate. The function is used to set max quota rate for a particular token, Additional
    interest rate = minRate * wieghted_votes_for_min + maxRate * weighted_votes_for_max.`,
    schema: z.object({
      token: addressSchema,
      maxRate: numberSchema,
    }),
    stateTransition: ({ state, params }) => {
      return updateRateKeeperState({
        state,
        update: (state: GaugeRateKeeperState) => ({
          ...state,
          rates: {
            ...state.rates,
            [params.token.toLowerCase()]: {
              ...state.rates[params.token.toLowerCase() as Address],
              maxRate: params.maxRate,
            },
          },
        }),
      });
    },
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureRateKeeper(
        state.address,
        createCallData(
          parseAbi(["function changeQuotaMaxRate(address,uint16)"]),
          {
            functionName: "changeQuotaMaxRate",
            args: [params.token, params.maxRate],
          },
        ),
      );
      return { tx: { tx, action } };
    },
    replace: (a, b) => {
      // Two changeQuotaMaxRate actions for the same token replace each other
      return a.token.toLowerCase() === b.token.toLowerCase();
    },
  };
