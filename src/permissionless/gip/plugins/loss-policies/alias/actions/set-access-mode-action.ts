import { parseAbi } from "viem";
import { z } from "zod";
import { AccessMode, createCallData } from "../../../../../index.js";
import type { MarketActionData } from "../../../../core/actions/types.js";
import { updateLossPolicyState } from "../../logic.js";
import type { AliasLossPolicyState } from "../logic.js";

export type SetAccessModeMarketAction = {
  type: "LOSS_POLICY::ALIAS::setAccessMode";
  params: {
    mode: AccessMode;
  };
};

export const setAccessModeActionData: MarketActionData<SetAccessModeMarketAction> =
  {
    type: "LOSS_POLICY::ALIAS::setAccessMode",
    description: `Set loss policy access mode for liquidations.`,
    schema: z.object({
      mode: z.nativeEnum(AccessMode),
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
          mode: params.mode,
        }),
      });
    },
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureLossPolicy(
        state.address,
        createCallData(parseAbi(["function setAccessMode(uint8)"]), {
          functionName: "setAccessMode",
          args: [params.mode],
        }),
      );
      return { tx: { tx, action } };
    },
    replace: () => {
      return true;
    },
  };
