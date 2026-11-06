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
import { noOp, targetCollateral } from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCollateralToken } from "./utils/creditManagerStateUpdates.js";

export interface ForbidTokenParams {
  creditManager: CreditManagerTarget;
  token: Address;
}

export type ForbidTokenAction = BaseMarketAction<
  "CREDIT::forbidToken",
  ForbidTokenParams
>;

export const forbidTokenActionData: MarketScopedDefinition<ForbidTokenAction> =
  defineMarketAction<ForbidTokenAction>({
    type: "CREDIT::forbidToken",
    gas: () => 110_000, // got 101,699
    description: `Forbid a token to be used as collateral. The reason to use the function is to prevent Gearbox protocol from
interacting with a particular protocol, if protocol is got hacked or has other risk diagnostics.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      token: addressSchema,
    }),
    check: ({ state, params }) => {
      const { collateral, diagnostics } = targetCollateral(state, params);
      if (diagnostics) return diagnostics;
      return collateral.isForbidden
        ? [noOp(`Token ${params.token} is already forbidden`)]
        : [];
    },
    apply: ({ state, params }) =>
      updateCollateralToken({
        state,
        creditManager: params.creditManager,
        token: params.token,
        update: token => ({ ...token, isForbidden: true }),
      }),
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "forbidToken",
        args: [params.token],
      }),
    merge: { position: "last" },
    requires: requiresCollateral,
    key: byCreditManagerAndToken,
  });
