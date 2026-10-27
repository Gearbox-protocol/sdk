import type { Address } from "viem";
import { z } from "zod/v4";
import { convertPercent } from "../../utils/format.js";
import { MIN_RAMP_DURATION, UINT40_MAX } from "../constants.js";
import { effectiveLiquidationThreshold } from "../state/market/effectiveLiquidationThreshold.js";
import {
  addressSchema,
  percentageSchema,
  uintSchema,
} from "../validationSchemas.js";
import {
  actionError,
  actionWarning,
  incompleteCheck,
} from "./actionDiagnostics.js";
import type { BaseMarketAction } from "./actionTypes.js";
import {
  type CreditManagerTarget,
  creditManagerTargetSchema,
} from "./creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "./defineMarketAction.js";
import {
  byCreditManagerAndToken,
  requiresCollateral,
} from "./utils/actionKeys.js";
import {
  collateralNotFound,
  creditManagerNotFound,
  findCollateral,
  findCreditManager,
  isUnderlying,
  liquidationThresholdDiagnostics,
  underlyingNotAllowed,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCollateralToken } from "./utils/creditManagerStateUpdates.js";

export type RampLiquidationThresholdContext = {
  creditManager: CreditManagerTarget;
  token: Address;
};

export interface RampLiquidationThresholdParams
  extends RampLiquidationThresholdContext {
  liquidationThresholdFinal: number;
  rampStart: number;
  rampDuration: number;
}

export type RampLiquidationThresholdAction = BaseMarketAction<
  "CREDIT::rampLiquidationThreshold",
  RampLiquidationThresholdParams
>;

export const rampLiquidationThresholdActionData: MarketScopedDefinition<RampLiquidationThresholdAction> =
  defineMarketAction<RampLiquidationThresholdAction>({
    type: "CREDIT::rampLiquidationThreshold",
    gas: () => 90_000, // got 81,110
    description: `Ramp liquidation threshold for a collateral token. The function is used to change liquidation threshold f
or a particular collateral token during the time.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      token: addressSchema,
      liquidationThresholdFinal: percentageSchema,
      rampStart: uintSchema(40),
      rampDuration: uintSchema(24),
    }),
    check: ({ state, params, env }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      if (isUnderlying(state, params.token)) return [underlyingNotAllowed()];
      if (!findCollateral(cm, params.token)) {
        return [collateralNotFound(params.token)];
      }
      const diagnostics = liquidationThresholdDiagnostics(
        state,
        cm,
        params.liquidationThresholdFinal,
        ["params", "liquidationThresholdFinal"],
      );
      if (
        effectiveLiquidationThreshold(
          findCollateral(cm, params.token)!,
          env.timestamp,
        ) === undefined
      )
        diagnostics.push(
          incompleteCheck(
            "rampInitialLT",
            "The supplied active ramp has no initial liquidation threshold",
          ),
        );
      if (params.rampDuration < MIN_RAMP_DURATION) {
        diagnostics.push(
          actionError(
            "RAMP_TOO_SHORT",
            "A liquidation threshold ramp must last at least two days",
            ["params", "rampDuration"],
          ),
        );
      }
      const rampStart = Math.max(params.rampStart, env.timestamp);
      if (params.rampStart < env.timestamp) {
        diagnostics.push(
          actionWarning(
            "RAMP_START_CLAMPED",
            "rampStart is in the past; the credit configurator starts the ramp at execution time instead",
            ["params", "rampStart"],
          ),
        );
      }
      if (rampStart + params.rampDuration > UINT40_MAX) {
        diagnostics.push(
          actionError(
            "RAMP_END_OVERFLOW",
            "The ramp would end after the largest uint40 timestamp",
            ["params", "rampDuration"],
          ),
        );
      }
      return diagnostics;
    },
    apply: ({ state, params, env }) =>
      updateCollateralToken({
        state,
        creditManager: params.creditManager,
        token: params.token,
        update: token => ({
          ...token,
          liquidationThresholdInitial: effectiveLiquidationThreshold(
            token,
            env.timestamp,
          ),
          liquidationThresholdFinal: params.liquidationThresholdFinal,
          rampStart: Math.max(params.rampStart, env.timestamp),
          rampDuration: params.rampDuration,
        }),
      }),
    encode: ({ ctx, params }) => {
      return configureCreditManager(ctx, params.creditManager, {
        functionName: "rampLiquidationThreshold",
        args: [
          params.token,
          convertPercent(params.liquidationThresholdFinal),
          params.rampStart,
          params.rampDuration,
        ],
      });
    },
    requires: requiresCollateral,
    key: byCreditManagerAndToken,
  });
