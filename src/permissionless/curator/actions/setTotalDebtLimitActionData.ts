import { z } from "zod/v4";
import { nonNegativeNumberSchema } from "../validationSchemas.js";
import type { BaseMarketAction } from "./actionTypes.js";
import { convertUnderlyingAmount } from "./builderContext.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import { single } from "./utils/actionKeys.js";
import { noOp } from "./utils/checkHelpers.js";
import { configurePool } from "./utils/configureCalls.js";

export interface SetTotalDebtLimitParams {
  limit: number;
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
      limit: nonNegativeNumberSchema,
    }),
    check: ({ state, params }) =>
      state.totalDebtLimit === params.limit
        ? [
            noOp(`Total debt limit is already ${params.limit}`, [
              "params",
              "limit",
            ]),
          ]
        : [],
    apply: ({ state, params }) => ({
      ...state,
      totalDebtLimit: params.limit,
    }),
    key: single,
    encode: ({ ctx, state, params }) =>
      configurePool(ctx, state, {
        functionName: "setTotalDebtLimit",
        args: [convertUnderlyingAmount(ctx, state, params.limit)],
      }),
  });
