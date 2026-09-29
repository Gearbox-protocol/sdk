import { type Address, encodeFunctionData } from "viem";
import { z } from "zod";
import { ITreasurySplitterAbi } from "../../../../abi/310/iTreasurySplitter.js";
import { TreasurySplitterContract } from "../../../index.js";
import type { BaseMarketAction } from "../actions/types.js";
import type { ConfiguratorState } from "../configurator-state/types.js";
import { addressSchema, percentageSchema } from "../validation.js";
import type { ConfiguratorActionData } from "./types.js";

interface SetDefaultSplitParams {
  receivers: Address[];
  proportions: number[];
}

export type SetDefaultSplitAction = BaseMarketAction<
  "TREASURY::setDefaultSplit",
  SetDefaultSplitParams
>;

const PERCENTAGE_SCALE = 100;

export const setDefaultSplitActionData: ConfiguratorActionData<SetDefaultSplitAction> =
  {
    type: "TREASURY::setDefaultSplit",
    description: `Set the default split for the treasury splitter, defining how funds are distributed among receivers.`,
    schema: z
      .object({
        receivers: z
          .array(addressSchema)
          .min(1, "At least one receiver required"),
        proportions: z
          .array(percentageSchema)
          .min(1, "At least one proportion required"),
      })
      .refine(data => data.receivers.length === data.proportions.length, {
        message: "Receivers and proportions arrays must have the same length",
      })
      .refine(
        data => {
          const sum = data.proportions.reduce((a, b) => a + b, 0);
          return sum === 100;
        },
        {
          message: "Sum of proportions must be 100%",
        },
      ),
    stateTransition: (args: {
      state: ConfiguratorState;
      params: SetDefaultSplitParams;
    }): ConfiguratorState => {
      const { state, params } = args;

      // Create new immutable state - DO NOT mutate the original state
      return {
        ...state,
        treasury: {
          ...state.treasury,
          activeProposals: [
            ...state.treasury.activeProposals,
            {
              data: {
                functionName: "setDefaultSplit",
                recievers: params.receivers,
                proportions: params.proportions,
              },
              callData: encodeFunctionData({
                abi: ITreasurySplitterAbi,
                functionName: "setDefaultSplit",
                args: [
                  params.receivers,
                  params.proportions.map(p => Math.round(p * PERCENTAGE_SCALE)),
                ],
              }),
              conirmedByTreasuryProxy: false,
              confirmedByAdmin: true,
            },
          ],
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

      const tx = treasurySplitter.setDefaultSplitTx(
        params.receivers,
        params.proportions.map(p => Math.round(p * PERCENTAGE_SCALE)),
      );

      return { tx: { tx, action } };
    },
    replace: (a: SetDefaultSplitParams, b: SetDefaultSplitParams) => {
      // Always replace setDefaultSplit actions - only keep the latest one
      // Check if both are setDefaultSplit actions (which they are by type)
      return !!(a && b);
    },
    replaceKeep: "last" as const,
  };
