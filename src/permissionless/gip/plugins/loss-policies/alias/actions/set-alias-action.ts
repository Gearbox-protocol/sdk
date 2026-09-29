import { type Address, parseAbi } from "viem";
import { z } from "zod";
import { createCallData } from "../../../../../index.js";
import type { MarketActionData } from "../../../../core/actions/types.js";
import { addressSchema } from "../../../../core/validation.js";
import { updateLossPolicyState } from "../../logic.js";
import type { AliasLossPolicyState } from "../logic.js";

export type SetAliasMarketAction = {
  type: "LOSS_POLICY::ALIAS::setAlias";
  params: {
    token: Address;
    alias: Address;
  };
};

export const setAliasActionData: MarketActionData<SetAliasMarketAction> = {
  type: "LOSS_POLICY::ALIAS::setAlias",
  description: `Set alias for a token. The function is used to set alias for a particular token.`,
  schema: z.object({
    token: addressSchema,
    alias: addressSchema,
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
        aliases: {
          ...state.aliases,
          [params.token.toLowerCase()]: params.alias.toLowerCase(),
        },
      }),
    });
  },
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.configureLossPolicy(
      state.address,
      createCallData(
        parseAbi(["function setAliasPriceFeed(address,address)"]),
        {
          functionName: "setAliasPriceFeed",
          args: [params.token, params.alias],
        },
      ),
    );
    return { tx: { tx, action } };
  },
  replace: (a, b) => {
    // Two setAlias actions for the same token replace each other
    return a.token.toLowerCase() === b.token.toLowerCase();
  },
};
