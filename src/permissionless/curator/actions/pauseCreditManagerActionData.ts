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

export interface PauseCreditManagerParams {
  creditManager: CreditManagerTarget;
}

export type PauseCreditManagerAction = BaseMarketAction<
  "CREDIT::pause",
  PauseCreditManagerParams
>;

export const pauseCreditManagerActionData: MarketScopedDefinition<PauseCreditManagerAction> =
  defineMarketAction<PauseCreditManagerAction>({
    type: "CREDIT::pause",
    gas: () => 75_000, // got 70,932
    description:
      "Pause a credit manager. It gets a credit manager address as parameter.",
    schema: z.object({
      creditManager: creditManagerTargetSchema,
    }),
    check: ({ state, params }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      return cm.paused ? [noOp("The credit manager is already paused")] : [];
    },
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({ ...cm, paused: true }),
      }),
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "pause",
        args: [],
      }),
    requires: requiresCreditManager,
    key: byCreditManager,
    merge: {
      position: "last",
      barriers: ["CREDIT::upgradeCreditFacade", "CREDIT::unpause"],
    },
  });
