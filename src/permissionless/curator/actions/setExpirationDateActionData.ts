import { z } from "zod/v4";
import { TWO_WEEKS } from "../constants.js";
import { uintSchema } from "../validationSchemas.js";
import { actionError, actionWarning } from "./actionDiagnostics.js";
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

export interface SetExpirationDateParams {
  creditManager: CreditManagerTarget;
  expirationDate: number;
}

export type SetExpirationDateAction = BaseMarketAction<
  "CREDIT::setExpirationDate",
  SetExpirationDateParams
>;

export const setExpirationDateActionData: MarketScopedDefinition<SetExpirationDateAction> =
  defineMarketAction<SetExpirationDateAction>({
    type: "CREDIT::setExpirationDate",
    gas: () => 80_000, // got 77,599
    description: `Set expiration date for a credit manager. The function is used to set expiration date
for a particular credit manager. After expiration date is reached, all related credit accounts could be liquidated with
paying feeLiquidationExpired and feeLiquidationPremiumExpired.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      expirationDate: uintSchema(40),
    }),
    check: ({ state, params, env }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      const path = ["params", "expirationDate"];
      // `NotAllowedWhenNotExpirableException`
      if (!cm.expirable) {
        return [
          actionError("NOT_EXPIRABLE", "The credit facade is not expirable", [
            "params",
            "creditManager",
          ]),
        ];
      }
      if (params.expirationDate === cm.expirationDate) {
        return [noOp("The credit manager already expires at this date", path)];
      }
      // `IncorrectExpirationDateException`
      if (params.expirationDate < env.timestamp) {
        return [
          actionError(
            "EXPIRATION_IN_PAST",
            "The expiration date is in the past",
            path,
          ),
        ];
      }
      if (params.expirationDate < cm.expirationDate) {
        return [
          actionError(
            "EXPIRATION_DECREASED",
            "The expiration date can only be postponed",
            path,
          ),
        ];
      }
      return params.expirationDate < env.timestamp + TWO_WEEKS
        ? [
            actionWarning(
              "EXPIRATION_CLAMPED",
              "The credit configurator moves expiration dates closer than two weeks to two weeks from execution",
              path,
            ),
          ]
        : [];
    },
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({ ...cm, expirationDate: params.expirationDate }),
      }),
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "setExpirationDate",
        args: [params.expirationDate],
      }),
    requires: requiresCreditManager,
    key: byCreditManager,
  });
