import { z } from "zod";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export type PausePoolAction = BaseMarketAction<
  "POOL::pause",
  Record<string, never>
>;

export const pausePoolActionData: MarketActionData<PausePoolAction> = {
  type: "POOL::pause",
  description: `Pause a pool. The function is used to pause a particular market.`,
  schema: z.object({}),
  stateTransition: (args: { state: MarketState }): MarketState => {
    const { state } = args;

    return {
      ...state,
      paused: true,
    };
  },

  replace: () => true,
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const tx = mc.configurePool(
      state.address,
      createCallData(iPoolConfigureActionsAbi, {
        functionName: "pause",
        args: [],
      }),
    );
    return { tx: { tx, action } };
  },
};
