/**
 * Compile-time scope enforcement.
 *
 * Nothing here runs: `tsc --noEmit` failing (or a `@ts-expect-error` that
 * stops erroring) is the assertion.
 **/
import type { Address, Chain, PublicClient, Transport } from "viem";
import { describe, it } from "vitest";
import type { BaseMarketAction } from "../actions/actionTypes.js";
import {
  createAction,
  type MarketScopedDefinition,
} from "../actions/defineMarketAction.js";
import type { AdapterActionContext } from "../plugins/adapters/adapterMarketActionsData.js";
import { adapterPluginKit } from "../plugins/adapters/adapterPluginKit.js";
import type {
  AdapterPluginDefinition,
  AdapterStateBase,
} from "../plugins/adapters/defineAdapterPlugin.js";
import type {
  ConfiguratorScopedAction,
  MarketScopedAction,
} from "./actionScope.js";
import type { ConfiguratorBuilder } from "./ConfiguratorBuilder.js";
import type { CuratorSessionArgs } from "./CuratorSession.js";
import type { MarketBuilder, MarketBundleOptions } from "./MarketBuilder.js";
import type {
  BundleApplication,
  ConfiguratorGipPlan,
  GipPlan,
  GipSourceSnapshot,
  IncompleteCheck,
  MarketGipPlan,
} from "./types.js";

declare const market: MarketBuilder;
declare const configurator: ConfiguratorBuilder;
declare const someAddress: Address;

const marketAction = {
  type: "POOL::setTotalDebtLimit",
  params: { limit: 1 },
} as const;
const configuratorAction = {
  type: "CONFIGURATOR::setEmergencyAdmin",
  params: { emergencyAdmin: someAddress },
} as const;
const distributeAction = {
  type: "TREASURY_SPLITTER::distribute",
  params: { token: someAddress },
} as const;
const deployAction = {
  type: "BCR::deployContract",
  params: {
    contractType: "ZAPPER::ERC4626_UNDERLYING",
    version: 310,
    constructorParams: "0x" as const,
    salt: `0x${"00".repeat(32)}` as const,
    expectedAddress: someAddress,
  },
} as const;

type SetPoolsAction = BaseMarketAction<
  "ADAPTER::TEST_ROUTER::setPools",
  AdapterActionContext & { pools: Address[] }
>;
declare const setPoolsDefinition: MarketScopedDefinition<SetPoolsAction>;

type TestRouterDeployParams = {
  type: "TEST_ROUTER";
  version: 310;
  target: Address;
};
type TestRouterState = AdapterStateBase & { type: "TEST_ROUTER" };
declare const testRouterBody: Omit<
  AdapterPluginDefinition<TestRouterDeployParams, TestRouterState>,
  "actions"
>;
const testRouterPlugin = adapterPluginKit.defineAdapterPlugin<
  TestRouterDeployParams,
  TestRouterState
>()({ ...testRouterBody, actions: { setPools: setPoolsDefinition } });

declare const bundle: Parameters<MarketBuilder["applyBundle"]>[0];
declare const plan: GipPlan;
declare const source: GipSourceSnapshot;
declare const client: PublicClient<Transport, Chain>;

describe("compile-time scope enforcement", () => {
  it("accepts market-scoped actions in the market builder only", () => {
    // A market-scoped action is accepted by the market builder.
    market.addAction(marketAction);

    // @ts-expect-error configurator-scoped actions are not market-scoped
    market.addAction(configuratorAction);

    // @ts-expect-error treasury distribution is configurator-scoped
    market.addAction(distributeAction);

    // Periphery deployment is market-scoped.
    market.addAction(deployAction);
  });

  it("accepts configurator-scoped actions in the configurator builder only", () => {
    configurator.addAction(configuratorAction);
    configurator.addAction(distributeAction);

    // @ts-expect-error market-scoped actions are not configurator-scoped
    configurator.addAction(marketAction);

    // @ts-expect-error periphery deployment is market-scoped
    configurator.addAction(deployAction);
  });

  it("keeps the params type of built-in actions", () => {
    // @ts-expect-error a built-in action keeps its params type
    market.addAction({
      type: "POOL::setTotalDebtLimit",
      params: { limit: "1" },
    });

    market.addAction({
      type: "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
      // @ts-expect-error a built-in adapter action keeps its params type too
      params: { creditManager: someAddress, version: 310, target: someAddress },
    });

    // An action of an adapter plugin defined outside the package is any
    // `ADAPTER::…` action to the compiler; its plugin validates it at runtime.
    market.addAction({
      type: "ADAPTER::TEST_ROUTER::setPools",
      params: { creditManager: someAddress, version: 310, target: someAddress },
    });

    // @ts-expect-error only adapter plugins can add market actions
    market.addAction({ type: "POOL::somethingElse", params: {} });
  });

  it("types an external action by its definition with createAction", () => {
    // `createAction` types an external action by its definition.
    const setPools = createAction(setPoolsDefinition, {
      creditManager: someAddress,
      version: 310,
      target: someAddress,
      pools: [someAddress],
    });
    const setPoolsType: "ADAPTER::TEST_ROUTER::setPools" = setPools.type;
    void setPoolsType;
    market.addAction(setPools);
    createAction(setPoolsDefinition, {
      creditManager: someAddress,
      version: 310,
      target: someAddress,
      // @ts-expect-error createAction checks params against the definition
      pools: [1],
    });
  });

  it("keeps the types of a plugin's actions", () => {
    // A plugin's actions keep their own types.
    const fromPlugin = createAction(testRouterPlugin.actions.setPools, {
      creditManager: someAddress,
      version: 310,
      target: someAddress,
      pools: [],
    });
    const fromPluginType: SetPoolsAction = fromPlugin;
    void fromPluginType;
  });

  it("applies bundles in the market scope only", () => {
    // Bundles exist only in the market scope.
    market.applyBundle(bundle);

    // @ts-expect-error bundle targets are resolved automatically
    market.applyBundle(bundle, { targetCreditManager: someAddress });

    const strategyOptions: MarketBundleOptions = {
      deployCreditSuiteParams: {
        name: "Custom strategy",
        salt: "new-strategy",
        minDebt: 100_000,
        maxDebt: 1_000_000,
        feeInterest: 10,
        feeLiquidation: 1,
        feeLiquidationPremium: 4,
      },
      targetAssetParams: { token: someAddress, liquidationThreshold: 87 },
    };
    market.applyBundle(bundle, strategyOptions);

    // @ts-expect-error deployment fields keep their domain types
    market.applyBundle(bundle, { deployCreditSuiteParams: { maxDebt: "100" } });

    market.applyBundle(bundle, {
      // @ts-expect-error unknown deployment fields are rejected
      deployCreditSuiteParams: { unknownSetting: true },
    });

    market.applyBundle(bundle, {
      // @ts-expect-error maxEnabledTokens is derived from the bundle
      deployCreditSuiteParams: { maxEnabledTokens: 2 },
    });

    // @ts-expect-error the configurator builder has no applyBundle
    configurator.applyBundle(bundle);
  });

  it("discriminates plans by scope", () => {
    // Plans are discriminated by scope.
    if (plan.scope === "market") {
      const marketPlan: MarketGipPlan = plan;
      void marketPlan.after.address;
    } else {
      const configuratorPlan: ConfiguratorGipPlan = plan;
      void configuratorPlan.after.admin;
    }
  });

  it("makes the source snapshot readonly", () => {
    // The source snapshot is deep-frozen at runtime, so the type is readonly too.
    // @ts-expect-error GipSourceSnapshot.blockNumber is readonly
    source.blockNumber = 1n;
    // @ts-expect-error GipSourceSnapshot.marketConfigurator is readonly
    source.marketConfigurator = someAddress;
    // @ts-expect-error GipSourceSnapshot.blockTimestamp is readonly
    source.blockTimestamp = 0;
  });

  it("carries the preview's incomplete checks in a plan", () => {
    // A plan carries the preview's incomplete checks, so build()-only consumers can
    // tell an unchecked plan from a checked one.
    const planChecks: readonly IncompleteCheck[] = plan.incompleteChecks;
    void planChecks;
    if (plan.scope === "market") {
      const bundles: readonly BundleApplication[] = plan.bundles;
      const warnings: readonly string[] | undefined = bundles[0]?.paramWarnings;
      void warnings;
      void plan.diagnostics;
    }
  });

  it("keeps the scoped action unions disjoint", () => {
    // Scoped action unions are disjoint.
    type MarketIncludesConfigurator =
      ConfiguratorScopedAction extends MarketScopedAction ? true : false;
    const marketExcludesConfigurator: MarketIncludesConfigurator = false;
    void marketExcludesConfigurator;

    type ConfiguratorIncludesMarket =
      MarketScopedAction extends ConfiguratorScopedAction ? true : false;
    const configuratorExcludesMarket: ConfiguratorIncludesMarket = false;
    void configuratorExcludesMarket;
  });

  it("takes either a client or a fork connection", () => {
    const chainArgs: CuratorSessionArgs = {
      client,
      marketConfigurator: someAddress,
    };
    const forkArgs: CuratorSessionArgs = {
      fork: { rpcUrl: "http://127.0.0.1:8545" },
      marketConfigurator: someAddress,
    };
    void chainArgs;
    void forkArgs;
    const pluginArgs: CuratorSessionArgs = {
      client,
      marketConfigurator: someAddress,
      plugins: [testRouterPlugin],
    };
    void pluginArgs;
    // @ts-expect-error a creation-time fork owns its client; no second RPC path
    const mixedArgs: CuratorSessionArgs = {
      client,
      fork: { rpcUrl: "http://127.0.0.1:8545" },
      marketConfigurator: someAddress,
    };
    // @ts-expect-error choose a client or a fork connection
    const missingConnection: CuratorSessionArgs = {
      marketConfigurator: someAddress,
    };
    void mixedArgs;
    void missingConnection;
  });

  it("simulates on the session's own fork", () => {
    // Simulation runs on the SDK's own fork: no URL or backend argument.
    market.simulate();
    configurator.simulate();
    market.simulate({ isolation: "none", gas: 1_000_000n });

    // @ts-expect-error the node is chosen when the SDK is created
    market.simulate({ rpcUrl: "http://127.0.0.1:8545" });
  });
});
