import { type Address, parseAbi } from "viem";
import { z } from "zod";
import { createCallData } from "../../../../index.js";
import type { MarketActionData } from "../../../core/actions/types.js";
import { addressSchema, numberSchema } from "../../../core/validation.js";
import { updateRateKeeperState } from "../logic.js";
import type { GaugeRateKeeperState } from "./logic.js";

export type ChangeQuotaMinRateAction = {
  type: "RATE_KEEPER::GAUGE::changeQuotaMinRate";
  params: {
    token: Address;
    minRate: number;
  };
};

export const changeQuotaMinRateActionData: MarketActionData<ChangeQuotaMinRateAction> =
  {
    type: "RATE_KEEPER::GAUGE::changeQuotaMinRate",
    description: `Change quota min rate. The function is used to set min quota rate for a particular token, Additional
    interest rate = minRate * wieghted_votes_for_min + maxRate * weighted_votes_for_max.`,
    schema: z.object({
      token: addressSchema,
      minRate: numberSchema,
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
              minRate: params.minRate,
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
          parseAbi(["function changeQuotaMinRate(address,uint16)"]),
          {
            functionName: "changeQuotaMinRate",
            args: [params.token, params.minRate],
          },
        ),
      );
      return { tx: { tx, action } };
    },
    replace: (a, b) => {
      // Two changeQuotaMinRate actions for the same token replace each other
      return a.token.toLowerCase() === b.token.toLowerCase();
    },
  };
