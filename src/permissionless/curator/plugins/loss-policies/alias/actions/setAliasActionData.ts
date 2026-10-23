import type { Address } from "viem";
import { z } from "zod/v4";
import { iAliasedLossPolicyV310Abi } from "../../../../../../abi/310/generated.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../../actions/defineMarketAction.js";
import {
  byToken,
  requiresAsset,
} from "../../../../actions/utils/actionKeys.js";
import {
  lossPolicyMismatch,
  noOp,
} from "../../../../actions/utils/checkHelpers.js";
import { configureLossPolicy } from "../../../../actions/utils/configureCalls.js";
import { isSameAddress, lowerAddress } from "../../../../utils/addressUtils.js";
import { addressSchema } from "../../../../validationSchemas.js";
import { updateAliasLossPolicy } from "../updateAliasLossPolicy.js";

export type SetAliasMarketAction = {
  type: "LOSS_POLICY::ALIAS::setAlias";
  params: {
    token: Address;
    alias: Address;
  };
};

export const setAliasActionData: MarketScopedDefinition<SetAliasMarketAction> =
  defineMarketAction<SetAliasMarketAction>({
    type: "LOSS_POLICY::ALIAS::setAlias",
    gas: () => 200_000, // got 196,334
    touchedFeeds: ({ params }) => [params.alias],
    description: `Set alias for a token. The function is used to set alias for a particular token.`,
    schema: z.object({
      token: addressSchema,
      alias: addressSchema,
    }),
    check: ({ state, params }) => {
      if (state.lossPolicy.type !== "ALIAS") {
        return [lossPolicyMismatch("ALIAS", state.lossPolicy.type)];
      }
      const current = state.lossPolicy.aliases[lowerAddress(params.token)];
      return current && isSameAddress(current, params.alias)
        ? [noOp("The token already has this alias", ["params", "alias"])]
        : [];
    },
    apply: ({ state, params }) =>
      updateAliasLossPolicy(state, lossPolicy => ({
        ...lossPolicy,
        aliases: {
          ...lossPolicy.aliases,
          [params.token.toLowerCase()]: params.alias.toLowerCase(),
        },
      })),
    encode: ({ ctx, state, params }) =>
      configureLossPolicy(ctx, state, iAliasedLossPolicyV310Abi, {
        functionName: "setAliasPriceFeed",
        args: [params.token, params.alias],
      }),
    // Two setAlias actions for the same token replace each other
    requires: requiresAsset,
    key: byToken,
  });
