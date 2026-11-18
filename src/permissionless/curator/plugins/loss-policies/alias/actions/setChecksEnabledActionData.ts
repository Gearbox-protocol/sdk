import { z } from "zod/v4";
import { iAliasedLossPolicyV310Abi } from "../../../../../../abi/310/generated.js";
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
import { updateAliasLossPolicy } from "../updateAliasLossPolicy.js";

export type SetChecksEnabledMarketAction = {
  type: "LOSS_POLICY::ALIAS::setChecksEnabled";
  params: {
    enabled: boolean;
  };
};

export const setChecksEnabledActionData: MarketScopedDefinition<SetChecksEnabledMarketAction> =
  defineMarketAction<SetChecksEnabledMarketAction>({
    type: "LOSS_POLICY::ALIAS::setChecksEnabled",
    gas: () => 200_000, // not measured
    description: `Enables or disables loss policy checks.`,
    schema: z.object({
      enabled: z.boolean(),
    }),
    check: ({ state, params }) => {
      if (state.lossPolicy.type !== "ALIAS") {
        return [lossPolicyMismatch("ALIAS", state.lossPolicy.type)];
      }
      return state.lossPolicy.enabled === params.enabled
        ? [
            noOp(
              `Loss policy checks are already ${params.enabled ? "enabled" : "disabled"}`,
              ["params", "enabled"],
            ),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateAliasLossPolicy(state, lossPolicy => ({
        ...lossPolicy,
        enabled: params.enabled,
      })),
    encode: ({ ctx, state, params }) =>
      configureLossPolicy(ctx, state, iAliasedLossPolicyV310Abi, {
        functionName: "setChecksEnabled",
        args: [params.enabled],
      }),
    key: single,
  });
