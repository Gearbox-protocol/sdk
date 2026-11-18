import type { Address } from "viem";
import { z } from "zod/v4";
import { isSameAddress } from "../utils/addressUtils.js";
import { addressSchema } from "../validationSchemas.js";
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
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";

export interface ForbidAdapterParams {
  creditManager: CreditManagerTarget;
  adapter: Address;
}

export type ForbidAdapterAction = BaseMarketAction<
  "CREDIT::forbidAdapter",
  ForbidAdapterParams
>;

export const forbidAdapterActionData: MarketScopedDefinition<ForbidAdapterAction> =
  defineMarketAction<ForbidAdapterAction>({
    type: "CREDIT::forbidAdapter",
    gas: () => 130_000, // got 120,726, 104,027, 120,798 & 103,955
    description: `Forbid an adapter to be used by the credit manager. The reason to use the function is to prevent Gearbox protocol from interacting
with a particular protocol, if protocol is got hacked or has other risk diagnostics.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      adapter: addressSchema,
    }),
    check: ({ state, params }) => {
      const cm = findCreditManager(state, params.creditManager);
      if (!cm) return [creditManagerNotFound(params.creditManager)];
      // Adapters are keyed by target, the action names the adapter contract.
      return Object.values(cm.adapters).some(adapter =>
        isSameAddress(adapter.adapter, params.adapter),
      )
        ? []
        : [
            actionError(
              "ADAPTER_NOT_FOUND",
              `Adapter ${params.adapter} is not allowed in the credit manager`,
              ["params", "adapter"],
            ),
          ];
    },
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => {
          const adapters = Object.fromEntries(
            Object.entries(cm.adapters).filter(
              ([, adapter]) => !isSameAddress(adapter.adapter, params.adapter),
            ),
          ) as typeof cm.adapters;
          return { ...cm, adapters };
        },
      }),
    requires: requiresCreditManager,
    key: params => `${byCreditManager(params)}:${params.adapter.toLowerCase()}`,
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, {
        functionName: "forbidAdapter",
        args: [params.adapter],
      }),
  });
