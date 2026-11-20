import { z } from "zod/v4";
import { iAliasedLossPolicyV310Abi } from "../../../../../../abi/310/generated.js";
import { AccessMode } from "../../../../../bindings/types.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../../actions/defineMarketAction.js";
import { single } from "../../../../actions/utils/actionKeys.js";
import {
  lossPolicyMismatch,
  noOp,
} from "../../../../actions/utils/checkHelpers.js";
import { configureLossPolicy } from "../../../../actions/utils/configureCalls.js";
import { isAliasedLossPolicy } from "../aliasedLossPolicyPlugin.js";
import { updateAliasLossPolicy } from "../updateAliasLossPolicy.js";

export type SetAccessModeMarketAction = {
  type: "LOSS_POLICY::ALIAS::setAccessMode";
  params: {
    mode: AccessMode;
  };
};

export const setAccessModeActionData: MarketScopedDefinition<SetAccessModeMarketAction> =
  defineMarketAction<SetAccessModeMarketAction>({
    type: "LOSS_POLICY::ALIAS::setAccessMode",
    gas: () => 200_000, // not measured
    description: `Set loss policy access mode for liquidations.`,
    schema: z.object({
      mode: z.nativeEnum(AccessMode),
    }),
    check: ({ state, params }) => {
      if (!isAliasedLossPolicy(state.lossPolicy)) {
        return [
          lossPolicyMismatch(
            "ALIAS or MIDAS_ALIAS",
            // @dev a policy the SDK does not decode has no type
            String((state.lossPolicy as { type?: string }).type),
          ),
        ];
      }
      return state.lossPolicy.mode === params.mode
        ? [
            noOp("The loss policy already uses this access mode", [
              "params",
              "mode",
            ]),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateAliasLossPolicy(state, lossPolicy => ({
        ...lossPolicy,
        mode: params.mode,
      })),
    encode: ({ ctx, state, params }) =>
      configureLossPolicy(ctx, state, iAliasedLossPolicyV310Abi, {
        functionName: "setAccessMode",
        args: [params.mode],
      }),
    key: single,
  });
