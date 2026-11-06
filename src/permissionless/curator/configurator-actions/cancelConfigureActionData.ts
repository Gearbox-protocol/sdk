import type { Hex } from "viem";
import { z } from "zod/v4";
import { actionError } from "../actions/actionDiagnostics.js";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import { hexSchema } from "../validationSchemas.js";
import {
  resolveTreasurySplitter,
  type TreasurySplitterResolution,
  treasurySplitter,
} from "./configuratorActionHelpers.js";
import {
  type ConfiguratorScopedDefinition,
  defineConfiguratorAction,
} from "./defineConfiguratorAction.js";

interface CancelConfigureParams {
  callData: Hex;
}

export type CancelConfigureAction = BaseMarketAction<
  "TREASURY::cancelConfigure",
  CancelConfigureParams
>;

export const cancelConfigureActionData: ConfiguratorScopedDefinition<
  CancelConfigureAction,
  TreasurySplitterResolution
> = defineConfiguratorAction<CancelConfigureAction, TreasurySplitterResolution>(
  {
    type: "TREASURY::cancelConfigure",
    description: `Cancel a configure action in the treasury splitter.`,
    schema: z.object({
      callData: hexSchema,
    }),
    resolve: resolveTreasurySplitter,
    check: ({ state, params }) =>
      state.treasury.activeProposals.some(
        proposal => proposal.callData === params.callData,
      )
        ? []
        : [
            actionError(
              "PROPOSAL_NOT_FOUND",
              "The treasury splitter has no active proposal with this call data",
              ["params", "callData"],
            ),
          ],
    apply: ({ state, params }) => ({
      ...state,
      treasury: {
        ...state.treasury,
        activeProposals: state.treasury.activeProposals.filter(
          proposal => proposal.callData !== params.callData,
        ),
      },
    }),
    encode: ({ ctx, params, resolved }) =>
      treasurySplitter(ctx, resolved).cancelConfigureTx(params.callData),
    key: params => params.callData.toLowerCase(),
  },
);
