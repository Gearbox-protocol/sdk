import { z } from "zod/v4";
import { uintSchema } from "../validationSchemas.js";
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

export interface SetMaxDebtPerBlockMultiplierParams {
  creditManager: CreditManagerTarget;
  maxDebtPerBlockMultiplier: number;
}

export type SetMaxDebtPerBlockMultiplierAction = BaseMarketAction<
  "CREDIT::setMaxDebtPerBlockMultiplier",
  SetMaxDebtPerBlockMultiplierParams
>;

export const setMaxDebtPerBlockMultiplierActionData: MarketScopedDefinition<SetMaxDebtPerBlockMultiplierAction> =
  defineMarketAction<SetMaxDebtPerBlockMultiplierAction>({
    type: "CREDIT::setMaxDebtPerBlockMultiplier",
    gas: () => 200_000, // not measured
    description: `Set max debt per block multiplier for a credit manager. The function is used to set max debt per block multiplier for a particular credit manager.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      maxDebtPerBlockMultiplier: uintSchema(8),
    }),
    check: ({ state, params }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      return cm.maxDebtPerBlockMultiplier === params.maxDebtPerBlockMultiplier
        ? [
            noOp("The credit manager already has this multiplier", [
              "params",
              "maxDebtPerBlockMultiplier",
            ]),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          maxDebtPerBlockMultiplier: params.maxDebtPerBlockMultiplier,
        }),
      }),
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "setMaxDebtPerBlockMultiplier",
        args: [params.maxDebtPerBlockMultiplier],
      }),
    merge: { position: "last" },
    requires: requiresCreditManager,
    key: byCreditManager,
  });
