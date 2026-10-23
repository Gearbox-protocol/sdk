import { z } from "zod/v4";
import { lowerAddress } from "../utils/addressUtils.js";
import { nonNegativeNumberSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import { convertUnderlyingAmount } from "./builderContext.js";
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
import { configurePool } from "./utils/configureCalls.js";

export interface SetCreditManagerDebtLimitParams {
  creditManager: CreditManagerTarget;
  limit: number;
}

export type SetCreditManagerDebtLimitAction = BaseMarketAction<
  "POOL::setCreditManagerDebtLimit",
  SetCreditManagerDebtLimitParams
>;

export const setCreditManagerDebtLimitActionData: MarketScopedDefinition<SetCreditManagerDebtLimitAction> =
  defineMarketAction<SetCreditManagerDebtLimitAction>({
    type: "POOL::setCreditManagerDebtLimit",
    gas: () => 90_000, // got 82,447
    description: `Set debt limit for a credit manager. The function is used to set max possible debt for a particular credit manager.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      limit: nonNegativeNumberSchema,
    }),
    check: ({ state, params }) => {
      if (!findCreditManager(state, params.creditManager)) {
        return [creditManagerNotFound(params.creditManager)];
      }
      const current =
        state.creditManagerDebtLimit[lowerAddress(params.creditManager)] ?? 0;
      return current === params.limit
        ? [noOp(`Debt limit is already ${params.limit}`, ["params", "limit"])]
        : [];
    },
    apply: ({ state, params }) => {
      const cmAddress = lowerAddress(params.creditManager);

      return {
        ...state,
        creditManagerDebtLimit: {
          ...state.creditManagerDebtLimit,
          [cmAddress]: params.limit,
        },
      };
    },
    requires: requiresCreditManager,
    key: byCreditManager,
    encode: ({ ctx, state, params }) =>
      configurePool(ctx, state, {
        functionName: "setCreditManagerDebtLimit",
        args: [
          params.creditManager,
          convertUnderlyingAmount(ctx, state, params.limit),
        ],
      }),
  });
