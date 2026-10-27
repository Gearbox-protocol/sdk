import { z } from "zod/v4";
import { lowerAddress } from "../utils/addressUtils.js";
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
import { configurePool } from "./utils/configureCalls.js";
import {
  amountDiagnostics,
  convertLimit,
  debtLimitSchema,
  MAX_UINT128,
  projectedDebtLimit,
} from "./utils/rawAmounts.js";

export interface SetCreditManagerDebtLimitParams {
  creditManager: CreditManagerTarget;
  limit: number | string;
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
      limit: debtLimitSchema,
    }),
    check: ({ state, params, env }) => {
      if (!findCreditManager(state, params.creditManager)) {
        return [creditManagerNotFound(params.creditManager)];
      }
      const bounds = amountDiagnostics(env, state, params.limit, MAX_UINT128);
      if (bounds.length) return bounds;
      const address = lowerAddress(params.creditManager);
      const limit = projectedDebtLimit(env, state, params.limit);
      return (state.creditManagerDebtLimit[address] ?? 0) === limit
        ? [noOp(`Debt limit is already ${params.limit}`, ["params", "limit"])]
        : [];
    },
    apply: ({ state, params, env }) => {
      const address = lowerAddress(params.creditManager);
      const limit = projectedDebtLimit(env, state, params.limit);
      return {
        ...state,
        creditManagerDebtLimit: {
          ...state.creditManagerDebtLimit,
          [address]: limit,
        },
      };
    },
    requires: requiresCreditManager,
    key: byCreditManager,
    encode: ({ ctx, state, params }) =>
      configurePool(ctx, state, {
        functionName: "setCreditManagerDebtLimit",
        args: [params.creditManager, convertLimit(ctx, state, params.limit)],
      }),
  });
