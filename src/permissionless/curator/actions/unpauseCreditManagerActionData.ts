import { z } from "zod/v4";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  type CreditManagerTarget,
  creditManagerTargetSchema,
} from "./creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { byCreditManager, requiresCreditManager } from "./utils/actionKeys.js";
import {
  creditManagerNotFound,
  findCreditManager,
  noOp,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";

export interface UnpauseCreditManagerParams {
  creditManager: CreditManagerTarget;
}

export type UnpauseCreditManagerAction = BaseMarketAction<
  "CREDIT::unpause",
  UnpauseCreditManagerParams
>;

export const unpauseCreditManagerActionData: MarketScopedDefinition<UnpauseCreditManagerAction> =
  defineMarketAction<UnpauseCreditManagerAction>({
    type: "CREDIT::unpause",
    gas: () => 75_000, // got 70,985
    description: `Unpause a credit manager. The function is used to unpause a particular credit manager.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
    }),
    check: ({ state, params }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      return cm.paused ? [] : [noOp("The credit manager is not paused")];
    },
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({ ...cm, paused: false }),
      }),
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "unpause",
        args: [],
      }),
    requires: requiresCreditManager,
    key: byCreditManager,
  });
