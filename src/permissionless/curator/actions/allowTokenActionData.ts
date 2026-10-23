import type { Address } from "viem";
import { z } from "zod/v4";
import { addressSchema } from "../validationSchemas.js";
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
  noOp,
  underlyingNotAllowed,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCollateralToken } from "./utils/creditManagerStateUpdates.js";

export interface AllowTokenParams {
  creditManager: CreditManagerTarget;
  token: Address;
}

export type AllowTokenAction = BaseMarketAction<
  "CREDIT::allowToken",
  AllowTokenParams
>;

export const allowTokenActionData: MarketScopedDefinition<AllowTokenAction> =
  defineMarketAction<AllowTokenAction>({
    type: "CREDIT::allowToken",
    gas: () => 80_000, // got 77,414
    description: "Allow a token to be used as collateral, if it was forbidden.",
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      token: addressSchema,
    }),
    check: ({ state, params }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      if (isUnderlying(state, params.token)) return [underlyingNotAllowed()];
      const collateral = findCollateral(cm, params.token);
      if (!collateral) return [collateralNotFound(params.token)];
      return collateral.isForbidden
        ? []
        : [noOp(`Token ${params.token} is not forbidden`)];
    },
    apply: ({ state, params }) =>
      updateCollateralToken({
        state,
        creditManager: params.creditManager,
        token: params.token,
        update: token => ({ ...token, isForbidden: false }),
      }),
    merge: { position: "last" },
    requires: requiresCollateral,
    key: byCreditManagerAndToken,
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "allowToken",
        args: [params.token],
      }),
  });
