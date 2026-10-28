/**
 * The action definitions and adapter plugins a GIP is built with.
 *
 * `GipRegistry.builtin` holds everything the package ships. An SDK instance
 * (and any executor given one) uses a registry extended with adapter plugins
 * defined elsewhere: `CuratorSession.create({ …, plugins: [myAdapter] })`. Every
 * lookup of an action type or adapter type goes through the registry, so an
 * external plugin's adapter can be allowed, configured, read, checked and
 * diffed like a built-in one.
 **/
import type { z } from "zod/v4";
import type { MarketActionDefinition } from "./actions/defineMarketAction.js";
import { marketActionDefinitions } from "./actions/marketActionDefinitions.js";
import type {
  GipMarketAction,
  MarketActionType,
  RegisteredMarketActionDefinition,
} from "./actions/types.js";
import { configuratorActionDefinitions } from "./configurator-actions/configuratorActionDefinitions.js";
import type { ConfiguratorActionDefinition } from "./configurator-actions/defineConfiguratorAction.js";
import type { ConfiguratorActions } from "./configurator-actions/types.js";
import { adapterDeployParamsSchemaOf } from "./plugins/adapters/adapterDeployParamsSchema.js";
import { builtinAdapterPlugins } from "./plugins/adapters/builtinAdapterPlugins.js";
import type {
  AdapterDeployParamsBase,
  AdapterPluginDefinition,
} from "./plugins/adapters/defineAdapterPlugin.js";
import type { SchemaNode } from "./state/diff/schemaNodes.js";
import { buildMarketStateSchema } from "./state/market/marketStateComparison.js";

function byType<T extends { type: string }>(
  items: Iterable<T>,
  kind: string,
): Map<string, T> {
  const map = new Map<string, T>();
  for (const item of items) {
    if (map.has(item.type)) {
      throw new Error(`${kind} ${item.type} is registered twice`);
    }
    map.set(item.type, item);
  }
  return map;
}

export class GipRegistry {
  static #builtin: GipRegistry | undefined;

  /** Everything the package ships. **/
  static get builtin(): GipRegistry {
    GipRegistry.#builtin ??= new GipRegistry(
      builtinAdapterPlugins,
      marketActionDefinitions,
    );
    return GipRegistry.#builtin;
  }

  readonly #adapters: Map<string, AdapterPluginDefinition>;
  readonly #marketActions: Map<string, MarketActionDefinition>;
  readonly #configuratorActions: Map<string, ConfiguratorActionDefinition>;
  #adapterDeployParamsSchema?: z.ZodType<AdapterDeployParamsBase>;
  #marketStateSchema?: SchemaNode;

  private constructor(
    adapters: Iterable<AdapterPluginDefinition>,
    marketActions: Iterable<MarketActionDefinition>,
  ) {
    this.#adapters = byType(adapters, "Adapter plugin");
    this.#marketActions = byType(marketActions, "Market action");
    this.#configuratorActions = byType(
      configuratorActionDefinitions,
      "Configurator action",
    );
  }

  /**
   * A registry with `plugins` and their actions added. Adapter and action
   * types must be new: a built-in one cannot be replaced.
   **/
  extend(plugins: readonly AdapterPluginDefinition[]): GipRegistry {
    if (plugins.length === 0) return this;
    return new GipRegistry(
      [...this.#adapters.values(), ...plugins],
      [
        ...this.#marketActions.values(),
        ...plugins.flatMap(plugin => Object.values(plugin.actions)),
      ],
    );
  }

  /** Every adapter plugin, built-in ones first. **/
  get adapterPlugins(): AdapterPluginDefinition[] {
    return [...this.#adapters.values()];
  }

  /** Every market action definition, built-in ones first. **/
  get marketActions(): MarketActionDefinition[] {
    return [...this.#marketActions.values()];
  }

  /** Every configurator action definition. **/
  get configuratorActions(): ConfiguratorActionDefinition[] {
    return [...this.#configuratorActions.values()];
  }

  adapter(type: string): AdapterPluginDefinition | undefined {
    return this.#adapters.get(type);
  }

  requireAdapter(type: string): AdapterPluginDefinition {
    const plugin = this.#adapters.get(type);
    if (!plugin) throw new Error(`Adapter type ${type} is not registered`);
    return plugin;
  }

  marketAction<T extends MarketActionType>(
    type: T,
  ):
    | Extract<RegisteredMarketActionDefinition, { readonly type: T }>
    | undefined;
  marketAction(type: string): MarketActionDefinition | undefined;
  marketAction(type: string): MarketActionDefinition | undefined {
    return this.#marketActions.get(type);
  }

  requireMarketAction(type: string): MarketActionDefinition<GipMarketAction> {
    const definition = this.#marketActions.get(type);
    if (!definition) throw new Error(`Market action type ${type} not found`);
    return definition as MarketActionDefinition<GipMarketAction>;
  }

  configuratorAction(type: string): ConfiguratorActionDefinition | undefined {
    return this.#configuratorActions.get(type);
  }

  requireConfiguratorAction(
    type: string,
  ): ConfiguratorActionDefinition<ConfiguratorActions> {
    const definition = this.#configuratorActions.get(type);
    if (!definition) {
      throw new Error(`Configurator action type ${type} not found`);
    }
    return definition as ConfiguratorActionDefinition<ConfiguratorActions>;
  }

  /** Deploy params schema of every registered adapter, dispatching on `type`. **/
  get adapterDeployParamsSchema(): z.ZodType<AdapterDeployParamsBase> {
    this.#adapterDeployParamsSchema ??= adapterDeployParamsSchemaOf(
      this.#adapters.values(),
    );
    return this.#adapterDeployParamsSchema;
  }

  /** Schema of `MarketState` describing every registered adapter. **/
  get marketStateSchema(): SchemaNode {
    this.#marketStateSchema ??= buildMarketStateSchema(this.#adapters.values());
    return this.#marketStateSchema;
  }

  /** The schema `definition`'s params are validated with in this registry. **/
  paramsSchema(
    definition: MarketActionDefinition | ConfiguratorActionDefinition,
  ): z.ZodType {
    return "paramsSchema" in definition && definition.paramsSchema
      ? definition.paramsSchema(this)
      : definition.schema;
  }
}
