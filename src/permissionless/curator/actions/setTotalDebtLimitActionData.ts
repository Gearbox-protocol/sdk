import { z } from "zod/v4";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { single } from "./utils/actionKeys.js";
import { noOp } from "./utils/checkHelpers.js";
import { configurePool } from "./utils/configureCalls.js";
import {
  amountDiagnostics,
  convertLimit,
  debtLimitSchema,
  MAX_UINT128,
  projectedDebtLimit,
} from "./utils/rawAmounts.js";

export interface SetTotalDebtLimitParams {
  limit: number | string;
}

export type SetTotalDebtLimitAction = BaseMarketAction<
  "POOL::setTotalDebtLimit",
  SetTotalDebtLimitParams
>;

export const setTotalDebtLimitActionData: MarketScopedDefinition<SetTotalDebtLimitAction> =
  defineMarketAction<SetTotalDebtLimitAction>({
    type: "POOL::setTotalDebtLimit",
    gas: () => 60_000, // got 58,403
    description: `Set total debt limit. The function is used to set max possible debt for a particular market.`,
    schema: z.object({
      limit: debtLimitSchema,
    }),
    check: ({ state, params, env }) => {
      const bounds = amountDiagnostics(env, state, params.limit, MAX_UINT128);
      if (bounds.length) return bounds;
      const limit = projectedDebtLimit(env, state, params.limit);
      return state.totalDebtLimit === limit
        ? [
            noOp(`Total debt limit is already ${params.limit}`, [
              "params",
              "limit",
            ]),
          ]
        : [];
    },
    apply: ({ state, params, env }) => ({
      ...state,
      totalDebtLimit: projectedDebtLimit(env, state, params.limit),
    }),
    key: single,
    encode: ({ ctx, state, params }) =>
      configurePool(ctx, state, {
        functionName: "setTotalDebtLimit",
        args: [convertLimit(ctx, state, params.limit)],
      }),
  });
