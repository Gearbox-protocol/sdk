import { z } from "zod";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export type UnpausePoolAction = BaseMarketAction<
  "POOL::unpause",
  Record<string, never>
>;

export const unpausePoolActionData: MarketActionData<UnpausePoolAction> = {
  type: "POOL::unpause",
  description: `Unpause a pool. The function is used to unpause a particular market.`,
  schema: z.object({}),
  stateTransition: (args: { state: MarketState }): MarketState => {
    const { state } = args;

    return {
      ...state,
      paused: false,
    };
  },

  replace: () => true,
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const tx = mc.configurePool(
      state.address,
      createCallData(iPoolConfigureActionsAbi, {
        functionName: "unpause",
        args: [],
      }),
    );
    return { tx: { tx, action } };
  },
};
