import { z } from "zod/v4";
import { adapterDeployParamsSchema } from "../plugins/adapters/adapterDeployParamsSchema.js";
import type { AdapterDeployParams } from "../plugins/adapters/builtinAdapterPlugins.js";
import type {
  AdapterDeployParamsBase,
  AdapterValidation,
} from "../plugins/adapters/defineAdapterPlugin.js";
import { isSameAddress } from "../utils/addressUtils.js";
import { actionError, incompleteCheck } from "./actionDiagnostics.js";
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
  type ChainRead,
  contractRejected,
  readBytecode,
  readChain,
} from "./utils/chainReads.js";
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

export interface AllowAdapterResolution {
  code: ChainRead<boolean>;
  validation?: ChainRead<AdapterValidation>;
}

export const allowAdapterActionData: MarketScopedDefinition<
  AllowAdapterAction,
  AllowAdapterResolution
> = defineMarketAction<AllowAdapterAction, AllowAdapterResolution>({
  type: "CREDIT::allowAdapter",
  gas: ({ params, env }) =>
    env.registry.requireAdapter(params.adapter.type).allowGas,
  description:
    "Allow an adapter to be used by the credit manager. Adapter allows Gearbox protocol to interact with particular protocol.",
  schema: allowAdapterSchema(adapterDeployParamsSchema),
  paramsSchema: registry =>
    allowAdapterSchema(registry.adapterDeployParamsSchema),
  resolve: async ({ ctx, params, registry }) => {
    const plugin = registry.adapter(params.adapter.type);
    const [code, validation] = await Promise.all([
      readBytecode(ctx, params.adapter.target),
      plugin?.resolveValidation
        ? readChain(() =>
            plugin.resolveValidation!({
              client: ctx.client,
              params: params.adapter,
              marketConfigurator: ctx.marketConfigurator.address,
            }),
          )
        : undefined,
    ]);
    return { code, validation };
  },
  check: ({ state, params, env, resolved }) => {
    const cm = findCreditManager(state, params.creditManager);
    if (!cm) return [creditManagerNotFound(params.creditManager)];
    if (!env.registry.adapter(params.adapter.type))
      return [
        actionError(
          "UNKNOWN_ADAPTER_TYPE",
          `No plugin is registered for adapter type ${params.adapter.type}`,
          ["params", "adapter", "type"],
        ),
      ];
    const diagnostics = [];
    if (
      isSameAddress(params.adapter.target, params.creditManager) ||
      (cm.creditFacade && isSameAddress(params.adapter.target, cm.creditFacade))
    )
      diagnostics.push(
        actionError(
          "FORBIDDEN_ADAPTER_TARGET",
          "An adapter cannot target its credit manager or facade",
        ),
      );
    if (!cm.creditFacade)
      diagnostics.push(
        incompleteCheck(
          "adapterFacadeTarget",
          "Current facade address is unknown",
        ),
      );
    const pending =
      resolved.code.value === false &&
      state.periphery?.some(
        entry =>
          isSameAddress(entry.address, params.adapter.target) &&
          entry.version > 0 &&
          entry.type.length > 0,
      );
    if (resolved.code.value === false && !pending)
      diagnostics.push(
        actionError(
          "ADAPTER_TARGET_NOT_CONTRACT",
          "An adapter's target must have bytecode",
        ),
      );
    if (resolved.code.value === undefined)
      diagnostics.push(
        incompleteCheck("adapterTargetCode", "Target bytecode is unavailable"),
      );
    if (pending)
      diagnostics.push(
        incompleteCheck(
          "adapterRequiredTokens",
          "Target is deployed by preceding actions; source metadata is unavailable",
        ),
      );
    else if (resolved.validation?.value) {
      const problem = resolved.validation.value(state, params.creditManager);
      if (problem)
        diagnostics.push(
          actionError("INVALID_ADAPTER_PARAMS", problem, ["params", "adapter"]),
        );
    } else if (resolved.validation)
      diagnostics.push(
        contractRejected(resolved.validation)
          ? actionError(
              "INVALID_ADAPTER_PARAMS",
              "Adapter target metadata was rejected by the contract",
            )
          : incompleteCheck(
              "adapterRequiredTokens",
              "Target metadata could not be read at the source block",
            ),
      );
    return diagnostics;
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
