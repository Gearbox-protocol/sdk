import { z } from "zod/v4";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { single } from "./utils/actionKeys.js";
import { noOp } from "./utils/checkHelpers.js";
import { configurePool } from "./utils/configureCalls.js";

export type PausePoolAction = BaseMarketAction<
  "POOL::pause",
  Record<string, never>
>;

export const pausePoolActionData: MarketScopedDefinition<PausePoolAction> =
  defineMarketAction<PausePoolAction>({
    type: "POOL::pause",
    gas: () => 65_000, // got 59,590
    description: `Pause a pool. The function is used to pause a particular market.`,
    schema: z.object({}),
    check: ({ state }) =>
      state.paused ? [noOp("The pool is already paused")] : [],
    apply: ({ state }) => ({ ...state, paused: true }),
    key: single,
    encode: ({ ctx, state }) =>
      configurePool(ctx, state, { functionName: "pause", args: [] }),
  });
