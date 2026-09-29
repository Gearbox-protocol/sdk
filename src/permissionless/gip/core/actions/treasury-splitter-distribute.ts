import type { Address } from "viem";
import { z } from "zod";
import { TreasurySplitterContract } from "../../../index.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export type DistributeAction = BaseMarketAction<
  "TREASURY_SPLITTER::distribute",
  {
    token: Address;
  }
>;

export const distributeActionData: MarketActionData<DistributeAction> = {
  type: "TREASURY_SPLITTER::distribute",
  description: `Distribute asset from treasury`,
  schema: z.object({
    token: addressSchema,
  }),
  stateTransition: ({ state, params }) => ({
    ...state,
    treasury: {
      ...state.treasury,
      balances: {
        ...state.treasury.balances,
        [params.token.toLowerCase() as Address]: 0,
      },
    },
  }),
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const treasurySplitter = new TreasurySplitterContract(
      state.treasury.address,
      mc.client,
    );
    const tx = treasurySplitter.distribute(params.token);
    return { tx: { tx, action } };
  },
  replace: (a, b) => {
    return a.token.toLowerCase() === b.token.toLowerCase();
  },
};
