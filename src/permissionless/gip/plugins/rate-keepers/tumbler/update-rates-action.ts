import { parseAbi } from "viem";
import { z } from "zod";
import { createCallData } from "../../../../index.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import { updateRateKeeperState } from "../logic.js";
import type { TumblerRateKeeperState } from "./logic.js";

export type UpdateRatesAction = BaseMarketAction<
  "RATE_KEEPER::TUMBLER::updateRates",
  Record<never, never>
>;

export const updateRatesActionData: MarketActionData<UpdateRatesAction> = {
  type: "RATE_KEEPER::TUMBLER::updateRates",
  description: `Update token rates. The function is used to update quota rates`,
  schema: z.object({}),
  stateTransition: ({ state }) => {
    return updateRateKeeperState({
      state,
      update: (state: TumblerRateKeeperState) => state,
    });
  },
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const tx = mc.configureRateKeeper(
      state.address,
      createCallData(parseAbi(["function updateRates()"]), {
        functionName: "updateRates",
      }),
    );
    return { tx: { tx, action } };
  },
  replaceKeep: "last",
  replace: () => true,
};
