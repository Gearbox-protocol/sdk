import { z } from "zod/v4";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { single } from "./utils/actionKeys.js";
import { noOp } from "./utils/checkHelpers.js";
import { configurePool } from "./utils/configureCalls.js";

export type UnpausePoolAction = BaseMarketAction<
  "POOL::unpause",
  Record<string, never>
>;

export const unpausePoolActionData: MarketScopedDefinition<UnpausePoolAction> =
  defineMarketAction<UnpausePoolAction>({
    type: "POOL::unpause",
    gas: () => 65_000, // got 59,644
    description: `Unpause a pool. The function is used to unpause a particular market.`,
    schema: z.object({}),
    check: ({ state }) =>
      state.paused ? [] : [noOp("The pool is not paused")],
    apply: ({ state }) => ({ ...state, paused: false }),
    key: single,
    encode: ({ ctx, state }) =>
      configurePool(ctx, state, { functionName: "unpause", args: [] }),
  });
