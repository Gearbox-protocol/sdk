import { type Hex, isHex } from "viem";
import { z } from "zod";
import { TreasurySplitterContract } from "../../../index.js";
import type { BaseMarketAction } from "../actions/types.js";
import type { ConfiguratorState } from "../configurator-state/types.js";
import type { ConfiguratorActionData } from "./types.js";

interface CancelConfigureParams {
  callData: Hex;
}

export type CancelConfigureAction = BaseMarketAction<
  "TREASURY::cancelConfigure",
  CancelConfigureParams
>;

export const cancelConfigureActionData: ConfiguratorActionData<CancelConfigureAction> =
  {
    type: "TREASURY::cancelConfigure",
    description: `Cancel a configure action in the treasury splitter.`,
    schema: z.object({
      callData: z.string().refine(data => isHex(data), {
        message: "Invalid hex string",
      }),
    }),
    stateTransition: (args: {
      state: ConfiguratorState;
      params: CancelConfigureParams;
    }): ConfiguratorState => {
      const { state, params } = args;

      if (state.treasury.activeProposals.length === 0) {
        throw new Error("No active proposals to cancel");
      }

      if (
        !state.treasury.activeProposals.some(
          p => p.callData === params.callData,
        )
      ) {
        throw new Error("Proposal not found");
      }

      return {
        ...state,
        treasury: {
          ...state.treasury,
          activeProposals: state.treasury.activeProposals.filter(
            p => p.callData !== params.callData,
          ),
        },
      };
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;

      // Get treasury address from the market configurator
      const { treasury } = await mc.admins();

      const treasurySplitter = new TreasurySplitterContract(
        treasury,
        mc.client,
      );

      const tx = treasurySplitter.cancelConfigureTx(params.callData);

      return { tx: { tx, action } };
    },
    replace: (a: CancelConfigureParams, b: CancelConfigureParams) => {
      return a.callData === b.callData;
    },
  };
