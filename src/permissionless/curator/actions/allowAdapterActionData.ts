import { z } from "zod/v4";
import { adapterDeployParamsSchema } from "../plugins/adapters/adapterDeployParamsSchema.js";
import type { AdapterDeployParams } from "../plugins/adapters/builtinAdapterPlugins.js";
import type { AdapterDeployParamsBase } from "../plugins/adapters/defineAdapterPlugin.js";
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
  byCreditManager,
  requiresCreditManager,
  resource,
} from "./utils/actionKeys.js";
import {
  creditManagerNotFound,
  findCreditManager,
} from "./utils/checkHelpers.js";
import { configureCreditManager } from "./utils/configureCalls.js";
import { updateCreditManagerState } from "./utils/creditManagerStateUpdates.js";

export interface AllowAdapterParams {
  creditManager: CreditManagerTarget;
  /**
   * Deploy params of a built-in adapter, or of one whose plugin is registered
   * with the SDK; the plugin's `deployParamsSchema` validates them.
   **/
  adapter: AdapterDeployParams | AdapterDeployParamsBase;
}

const allowAdapterSchema = (
  adapter: z.ZodType<AdapterDeployParams | AdapterDeployParamsBase>,
) =>
  z.object({
    creditManager: creditManagerTargetSchema,
    adapter,
  });

export type AllowAdapterAction = BaseMarketAction<
  "CREDIT::allowAdapter",
  AllowAdapterParams
>;

export const allowAdapterActionData: MarketScopedDefinition<AllowAdapterAction> =
  defineMarketAction<AllowAdapterAction>({
    type: "CREDIT::allowAdapter",
    gas: ({ params, env }) =>
      env.registry.requireAdapter(params.adapter.type).allowGas,
    description:
      "Allow an adapter to be used by the credit manager. Adapter allows Gearbox protocol to interact with particular protocol.",
    schema: allowAdapterSchema(adapterDeployParamsSchema),
    paramsSchema: registry =>
      allowAdapterSchema(registry.adapterDeployParamsSchema),
    check: ({ state, params, env }) => {
      if (!findCreditManager(state, params.creditManager)) {
        return [creditManagerNotFound(params.creditManager)];
      }
      return env.registry.adapter(params.adapter.type)
        ? []
        : [
            actionError(
              "UNKNOWN_ADAPTER_TYPE",
              `No plugin is registered for adapter type ${params.adapter.type}`,
              ["params", "adapter", "type"],
            ),
          ];
    },
    apply: ({ state, params, env }) => {
      const adapterState = env.registry
        .requireAdapter(params.adapter.type)
        .getDeployState(params.adapter);

      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          adapters: {
            ...cm.adapters,
            [params.adapter.target.toLowerCase()]: adapterState,
          },
        }),
      });
    },
    requires: requiresCreditManager,
    provides: params => [
      resource.adapter(params.creditManager, params.adapter.target),
    ],
    key: params =>
      `${byCreditManager(params)}:${params.adapter.target.toLowerCase()}`,
    encode: ({ ctx, params, env }) => {
      const { creditManager, adapter } = params;
      const deployParams = env.registry
        .requireAdapter(adapter.type)
        .getDeployParams({
          creditManager,
          params: adapter,
        });

      return configureCreditManager(ctx, params.creditManager, {
        functionName: "allowAdapter",
        args: [deployParams],
      });
    },
  });
