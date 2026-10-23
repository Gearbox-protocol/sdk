/**
 * Schema of `MarketState` and the market state diff built on it.
 *
 * Plugins own the schema of their part of the state. This module only
 * assembles them and describes the market-level fields.
 **/

import type { GipRegistry } from "../../GipRegistry.js";
import { plainAdapterStateSchema } from "../../plugins/adapters/adapterStateSchema.js";
import { builtinAdapterPlugins } from "../../plugins/adapters/builtinAdapterPlugins.js";
import type { AdapterPluginDefinition } from "../../plugins/adapters/defineAdapterPlugin.js";
import { irmPlugins } from "../../plugins/irm/irmPlugins.js";
import { lossPolicyPlugins } from "../../plugins/loss-policies/lossPolicyPlugins.js";
import { rateKeeperPlugins } from "../../plugins/rate-keepers/rateKeeperPlugins.js";
import {
  type DiffOptions,
  diffStates,
  formatStateDiff,
  type StateDiff,
} from "../diff/diffStates.js";
import {
  absent,
  address,
  amount,
  boolean,
  identity,
  integer,
  limit,
  list,
  mapValues,
  object,
  observed,
  percent,
  record,
  type SchemaNode,
  scalar,
  string,
  union,
  unknownWhen,
} from "../diff/schemaNodes.js";
import type {
  CollateralToken,
  MarketAsset,
  MarketCreditManagerState,
  MarketState,
  PeripheryState,
  TreasuryState,
} from "./types.js";

const collateralToken = object<CollateralToken>({
  liquidationThresholdFinal: percent,
  rampStart: integer,
  rampDuration: integer,
  isForbidden: boolean,
});

const creditManager = (adapters: SchemaNode) =>
  object<MarketCreditManagerState>({
    address: identity(address),
    name: identity(string),
    // Depends on the clock, so it is derived and never compared.
    isExpired: observed(boolean),
    expirable: boolean,
    expirationDate: integer,
    feeInterest: percent,
    feeLiquidation: percent,
    feeLiquidationExpired: percent,
    feeLiquidationPremium: percent,
    feeLiquidationPremiumExpired: percent,
    maxEnabledTokens: integer,
    minDebt: amount,
    maxDebt: amount,
    maxDebtPerBlockMultiplier: integer,
    degenNFT: address,
    paused: boolean,
    collateralTokens: record(address, collateralToken),
    adapters,
  });

const asset = object<MarketAsset>({
  address: identity(address),
  quotaLimit: amount,
  quotaIncreaseFee: percent,
  mainPriceFeed: address,
  reservePriceFeed: address,
});

const periphery = list<PeripheryState>(
  object<PeripheryState>({
    address: identity(address),
    domain: identity(string),
    // Read from the deployed contract. Empty and zero before deployment.
    type: unknownWhen(identity(string), v => v === ""),
    version: unknownWhen(identity(integer), v => v === 0),
    // Entries persisted before deployments were tracked are registered.
    status: absent(scalar, "registered"),
  }),
  item => `${item.domain}:${item.address.toLowerCase()}`,
);

/**
 * Schema of `MarketState` for the given adapter plugins. An adapter of a type
 * none of them describes is compared by the fields every adapter has.
 **/
export function buildMarketStateSchema(
  adapterPlugins: Iterable<AdapterPluginDefinition>,
): SchemaNode {
  const adapterVariants = Object.fromEntries(
    [...adapterPlugins].map(plugin => [plugin.type, plugin.stateSchema]),
  );
  return object<MarketState>({
    minorVersion: identity(integer),
    address: identity(address),
    symbol: identity(string),
    name: identity(string),
    underlyingAsset: identity(address),
    underlyingPriceFeed: address,
    totalDebtLimit: limit,
    // The chain reader writes 0 for every credit manager, a transition writes nothing.
    creditManagerDebtLimit: record(address, amount, { value: 0 }),
    assets: record(address, asset),
    creditManagers: record(
      address,
      creditManager(
        record(
          address,
          union("type", adapterVariants, plainAdapterStateSchema),
        ),
      ),
    ),
    treasury: observed(
      object<TreasuryState>({
        address,
        type: string,
        balances: record(address, amount),
      }),
    ),
    rateKeeper: union(
      "type",
      mapValues(rateKeeperPlugins, plugin => plugin.stateSchema),
    ),
    lossPolicy: union(
      "type",
      mapValues(lossPolicyPlugins, plugin => plugin.stateSchema),
    ),
    interestRateModel: union(
      "type",
      mapValues(irmPlugins, plugin => plugin.stateSchema),
    ),
    paused: boolean,
    // States persisted before periphery was tracked have no such key.
    periphery: absent(periphery, []),
  });
}

/** Schema of `MarketState` for the built-in adapters. **/
export const marketStateSchema: SchemaNode = buildMarketStateSchema(
  builtinAdapterPlugins,
);

export function diffMarketStates(
  before: MarketState,
  after: MarketState,
  options: DiffOptions & {
    /** Registry whose adapter plugins describe the states; built-in by default. **/
    registry?: GipRegistry;
  } = {},
): StateDiff {
  const { registry, ...diffOptions } = options;
  return diffStates(
    registry?.marketStateSchema ?? marketStateSchema,
    before,
    after,
    diffOptions,
  );
}

export const formatMarketStateDiff = formatStateDiff;
