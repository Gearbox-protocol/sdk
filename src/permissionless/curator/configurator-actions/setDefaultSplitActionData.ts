import { type Address, encodeFunctionData, type Hex } from "viem";
import { z } from "zod/v4";
import { ITreasurySplitterAbi } from "../../../abi/310/iTreasurySplitter.js";
import { convertPercent } from "../../utils/format.js";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { single } from "../actions/utils/actionKeys.js";
import { noOp } from "../actions/utils/checkHelpers.js";
import { PERCENTAGE_SCALE } from "../state/configurator/getConfiguratorState.js";
import { isSameAddress } from "../utils/addressUtils.js";
import { addressSchema, percentageSchema } from "../validationSchemas.js";
import {
  resolveTreasurySplitter,
  type TreasurySplitterResolution,
  treasurySplitter,
} from "./configuratorActionHelpers.js";
import {
  type ConfiguratorScopedDefinition,
  defineConfiguratorAction,
} from "./defineConfiguratorAction.js";

interface SetDefaultSplitParams {
  receivers: Address[];
  proportions: number[];
}

export type SetDefaultSplitAction = BaseMarketAction<
  "TREASURY::setDefaultSplit",
  SetDefaultSplitParams
>;

/** Percentages as the splitter stores them. **/
const scaleProportions = (proportions: number[]): number[] =>
  proportions.map(proportion => Math.round(proportion * PERCENTAGE_SCALE));

/** The splitter call a `setDefaultSplit` proposal is identified by. **/
const setDefaultSplitCallData = (params: SetDefaultSplitParams): Hex =>
  encodeFunctionData({
    abi: ITreasurySplitterAbi,
    functionName: "setDefaultSplit",
    args: [params.receivers, scaleProportions(params.proportions)],
  });

export const setDefaultSplitActionData: ConfiguratorScopedDefinition<
  SetDefaultSplitAction,
  TreasurySplitterResolution
> = defineConfiguratorAction<SetDefaultSplitAction, TreasurySplitterResolution>(
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
      .refine(data => data.proportions.reduce((a, b) => a + b, 0) === 100, {
        message: "Sum of proportions must be 100%",
      }),
    // @dev the splitter is a two-admin contract: the GIP only *proposes* the
    // split, which stays pending until the treasury proxy confirms it
    resolve: resolveTreasurySplitter,
    check: ({ state, params }) => {
      const { defaultSplit, activeProposals } = state.treasury;
      const sameSplit =
        defaultSplit.recievers.length === params.receivers.length &&
        defaultSplit.recievers.every(
          (receiver, i) =>
            isSameAddress(receiver, params.receivers[i]) &&
            convertPercent(defaultSplit.proportions[i]) ===
              convertPercent(params.proportions[i]),
        );
      if (sameSplit) return [noOp("This is already the default split")];
      const callData = setDefaultSplitCallData(params);
      return activeProposals.some(
        proposal => proposal.callData === callData && proposal.confirmedByAdmin,
      )
        ? [noOp("This split is already proposed")]
        : [];
    },
    apply: ({ state, params }) => ({
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
            callData: setDefaultSplitCallData(params),
            conirmedByTreasuryProxy: false,
            confirmedByAdmin: true,
          },
        ],
      },
    }),
    encode: ({ ctx, params, resolved }) =>
      treasurySplitter(ctx, resolved).setDefaultSplitTx(
        params.receivers,
        scaleProportions(params.proportions),
      ),
    // Only the latest default split matters.
    key: single,
    merge: { position: "last" },
  },
);
