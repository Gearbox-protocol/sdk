import { z } from "zod";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { numberSchema } from "../validation.js";
import { convertTokenAmount } from "./context.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface SetTotalDebtLimitParams {
  limit: number;
}

export type SetTotalDebtLimitAction = BaseMarketAction<
  "POOL::setTotalDebtLimit",
  SetTotalDebtLimitParams
>;

export const setTotalDebtLimitActionData: MarketActionData<SetTotalDebtLimitAction> =
  {
    type: "POOL::setTotalDebtLimit",
    description: `Set total debt limit. The function is used to set max possible debt for a particular market.`,
    schema: z.object({
      limit: numberSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: SetTotalDebtLimitParams;
    }): MarketState => {
      const { state, params } = args;

      return {
        ...state,
        totalDebtLimit: params.limit,
      };
    },
    replace: () => {
      return true;
    },

    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const limit = convertTokenAmount({
        tokens: ctx.tokens,
        token: state.underlyingAsset,
        amount: params.limit,
      });
      const tx = mc.configurePool(
        state.address,
        createCallData(iPoolConfigureActionsAbi, {
          functionName: "setTotalDebtLimit",
          args: [limit],
        }),
      );

      return { tx: { tx, action } };
    },
  };
