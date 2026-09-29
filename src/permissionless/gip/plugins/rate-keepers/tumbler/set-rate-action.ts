import { type Address, parseAbi } from "viem";
import { z } from "zod";
import { convertPercent, createCallData } from "../../../../index.js";
import type { MarketActionData } from "../../../core/actions/types.js";
import { addressSchema, numberSchema } from "../../../core/validation.js";
import { updateRateKeeperState } from "../logic.js";
import type { TumblerRateKeeperState } from "./logic.js";

export type SetRateAction = {
  type: "RATE_KEEPER::TUMBLER::setRate";
  params: {
    token: Address;
    rate: number;
  };
};

export const setRateActionData: MarketActionData<SetRateAction> = {
  type: "RATE_KEEPER::TUMBLER::setRate",
  description: `Set rate for a token. The function is used to set rate for a particular token`,
  schema: z.object({
    token: addressSchema,
    rate: numberSchema,
  }),
  stateTransition: ({ state, params }) => {
    return updateRateKeeperState({
      state,
      update: (state: TumblerRateKeeperState) => ({
        ...state,
        rates: {
          ...state.rates,
          [params.token.toLowerCase()]: params.rate,
        },
      }),
    });
  },
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    // TODO: check how rate is set on UI
    const rate = params.rate;
    const tx = mc.configureRateKeeper(
      state.address,
      createCallData(parseAbi(["function setRate(address,uint16)"]), {
        functionName: "setRate",
        args: [params.token, rate],
      }),
    );
    return { tx: { tx, action } };
  },
  replace: (a, b) => {
    // Two setRate actions for the same token replace each other
    return a.token.toLowerCase() === b.token.toLowerCase();
  },
};
