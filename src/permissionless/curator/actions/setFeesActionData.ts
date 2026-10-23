import { z } from "zod/v4";
import type { CreditManagerFees } from "../../bindings/types.js";
import { convertPercent } from "../../utils/format.js";
import { TWO_WEEKS } from "../constants.js";
import { creditManagerFeesSchema } from "../state/market/types.js";
import type { ActionDiagnostic } from "./actionDiagnostics.js";
import { actionError } from "./actionDiagnostics.js";
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

export interface SetFeesParams {
  creditManager: CreditManagerTarget;
  params: CreditManagerFees;
}

export type SetFeesAction = BaseMarketAction<"CREDIT::setFees", SetFeesParams>;

export const setFeesActionData: MarketScopedDefinition<SetFeesAction> =
  defineMarketAction<SetFeesAction>({
    type: "CREDIT::setFees",
    gas: () => 90_000, // got 85,464
    description: `Set fees for a credit manager. The function set liquidation fees (paid for LPs) and liquidation premium (paid for liquidators).`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      params: creditManagerFeesSchema,
    }),
    check: ({ state, params, env }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      const fees = params.params;
      const sum = (fee: number, premium: number) =>
        convertPercent(fee) + convertPercent(premium);
      if (
        sum(fees.feeLiquidation, fees.feeLiquidationPremium) ===
          sum(cm.feeLiquidation, cm.feeLiquidationPremium) &&
        convertPercent(fees.feeLiquidation) ===
          convertPercent(cm.feeLiquidation) &&
        sum(fees.feeLiquidationExpired, fees.feeLiquidationPremiumExpired) ===
          sum(cm.feeLiquidationExpired, cm.feeLiquidationPremiumExpired) &&
        convertPercent(fees.feeLiquidationExpired) ===
          convertPercent(cm.feeLiquidationExpired)
      ) {
        return [noOp("The credit manager already has these fees")];
      }
      const diagnostics: ActionDiagnostic[] = [];
      // `InconsistentLiquidationFeesException`: the underlying's LT is derived
      // from the fees and must not change.
      if (
        sum(fees.feeLiquidation, fees.feeLiquidationPremium) !==
        sum(cm.feeLiquidation, cm.feeLiquidationPremium)
      ) {
        diagnostics.push(
          actionError(
            "FEES_SUM_CHANGED",
            "Liquidation fee plus premium must stay the same: the underlying's liquidation threshold depends on it",
            ["params", "params", "feeLiquidationPremium"],
          ),
        );
      }
      // `InconsistentExpiredLiquidationFeesException`, judged at the source
      // block: execution happens later, which only makes it stricter.
      if (
        sum(fees.feeLiquidationExpired, fees.feeLiquidationPremiumExpired) !==
          sum(cm.feeLiquidationExpired, cm.feeLiquidationPremiumExpired) &&
        cm.expirationDate !== 0 &&
        env.timestamp + TWO_WEEKS > cm.expirationDate
      ) {
        diagnostics.push(
          actionError(
            "EXPIRED_FEES_SUM_CHANGED",
            "Expired liquidation fee plus premium cannot change within two weeks of expiration",
            ["params", "params", "feeLiquidationPremiumExpired"],
          ),
        );
      }
      return diagnostics;
    },
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({ ...cm, ...params.params }),
      }),
    encode: ({ ctx, params }) => {
      const fees = params.params;
      return configureCreditManager(ctx, params.creditManager, {
        functionName: "setFees",
        args: [
          convertPercent(fees.feeLiquidation),
          convertPercent(fees.feeLiquidationPremium),
          convertPercent(fees.feeLiquidationExpired),
          convertPercent(fees.feeLiquidationPremiumExpired),
        ],
      });
    },
    requires: requiresCreditManager,
    key: byCreditManager,
  });
