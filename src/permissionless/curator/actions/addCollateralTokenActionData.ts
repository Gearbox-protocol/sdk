import type { Address } from "viem";
import { z } from "zod/v4";
import { convertPercent } from "../../utils/format.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { addressSchema, percentageSchema } from "../validationSchemas.js";
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
import {
  byCreditManagerAndToken,
  requiresCreditManager,
  resource,
} from "./utils/actionKeys.js";
import {
  assetNotFound,
  creditManagerNotFound,
  findAsset,
  findCollateral,
  findCreditManager,
  isUnderlying,
  liquidationThresholdDiagnostics,
  underlyingNotAllowed,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";

export type AddCollateralTokenContext = {
  creditManager: CreditManagerTarget;
  token: Address;
};

export interface AddCollateralTokenParams extends AddCollateralTokenContext {
  liquidationThreshold: number;
}

export type AddCollateralTokenAction = BaseMarketAction<
  "CREDIT::addCollateralToken",
  AddCollateralTokenParams
>;

export const addCollateralTokenActionData: MarketScopedDefinition<AddCollateralTokenAction> =
  defineMarketAction<AddCollateralTokenAction>({
    type: "CREDIT::addCollateralToken",
    gas: () => 180_000, // got 176,131
    description:
      "Add a collateral token to the credit manager. It gets a liquidation threshold as parameter.",
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      token: addressSchema,
      liquidationThreshold: percentageSchema,
    }),
    check: ({ state, params }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      if (isUnderlying(state, params.token)) return [underlyingNotAllowed()];
      const asset = findAsset(state, params.token);
      if (!asset) return [assetNotFound(params.token)];
      if (findCollateral(cm, params.token)) {
        return [
          actionError(
            "COLLATERAL_EXISTS",
            `Token ${params.token} is already collateral of the credit manager`,
            ["params", "token"],
          ),
        ];
      }
      return liquidationThresholdDiagnostics(
        state,
        cm,
        params.liquidationThreshold,
        ["params", "liquidationThreshold"],
      );
    },
    apply: ({ state, params }) => {
      const tokenAddress = lowerAddress(params.token);
      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          collateralTokens: {
            ...cm.collateralTokens,
            [tokenAddress]: {
              liquidationThresholdFinal: params.liquidationThreshold,
              rampStart: 0,
              rampDuration: 0,
              isForbidden: false,
            },
          },
        }),
      });
    },
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "addCollateralToken",
        args: [params.token, convertPercent(params.liquidationThreshold)],
      }),
    requires: params => [
      ...requiresCreditManager(params),
      resource.asset(params.token),
    ],
    provides: params => [
      resource.collateral(params.creditManager, params.token),
    ],
    key: byCreditManagerAndToken,
  });
