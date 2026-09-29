import { parseAbi } from "viem";
import { z } from "zod";
import { createCallData } from "../../../../../index.js";
import type { MarketActionData } from "../../../../core/actions/types.js";
import { updateLossPolicyState } from "../../logic.js";
import type { AliasLossPolicyState } from "../logic.js";

export type SetChecksEnabledMarketAction = {
  type: "LOSS_POLICY::ALIAS::setChecksEnabled";
  params: {
    enabled: boolean;
  };
};

export const setChecksEnabledActionData: MarketActionData<SetChecksEnabledMarketAction> =
  {
    type: "LOSS_POLICY::ALIAS::setChecksEnabled",
    description: `Enables or disables loss policy checks.`,
    schema: z.object({
      enabled: z.boolean(),
    }),
    stateTransition: ({ state, params }) => {
      if (!state.lossPolicy) {
        throw new Error("Loss policy not configured");
      }
      if (state.lossPolicy.type !== "ALIAS") {
        throw new Error("Invalid loss policy type");
      }

      return updateLossPolicyState({
        state,
        update: (state: AliasLossPolicyState) => ({
          ...state,
          enabled: params.enabled,
        }),
      });
    },
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureLossPolicy(
        state.address,
        createCallData(parseAbi(["function setChecksEnabled(bool)"]), {
          functionName: "setChecksEnabled",
          args: [params.enabled],
        }),
      );
      return { tx: { tx, action } };
    },
    replace: () => {
      return true;
    },
  };
