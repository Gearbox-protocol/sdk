/**
 * An adapter plugin defined outside the package, registered per SDK instance
 * with `CuratorSession.create({ plugins })`, is allowed, configured, checked, merged,
 * encoded, read and diffed exactly like a built-in one.
 **/
import {
  type Address,
  encodeFunctionData,
  stringToHex,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import type { MarketSuite } from "../../../../onchain/market/MarketSuite.js";
import { GipActionError } from "../../actions/actionDiagnostics.js";
import type { BaseMarketAction } from "../../actions/actionTypes.js";
import type { AllowAdapterAction } from "../../actions/allowAdapterActionData.js";
import { createAction } from "../../actions/defineMarketAction.js";
import { GipRegistry } from "../../GipRegistry.js";
import { GipScopeError } from "../../session/actionScope.js";
import { diffMarketStates } from "../../state/market/marketStateComparison.js";
import type { MarketState } from "../../state/market/types.js";
import { CM, createTestSdk, marketState } from "../../testing/sdkHarness.js";
import type { AdapterActionContext } from "./adapterMarketActionsData.js";
// The plugin below is built from the kit's functions alone.
import { adapterPluginKit } from "./adapterPluginKit.js";
import type { AdapterStateBase } from "./defineAdapterPlugin.js";

const {
  adapterActionSchema,
  adapterBatch,
  adapterDeployParams,
  addressSchema,
  configureAdapter,
  defineAdapterPlugin,
  defineMarketAction,
  deployState,
  lowerAddresses,
  plainDeployParamsSchema,
  sdkState,
  schema: { address, adapterStateSchema, boolean, identity, list, object },
} = adapterPluginKit;

const AUTHOR: Address = "0x000000000000000000000000000000000000dEaD";
const ETA = 1_717_200_000 + 7 * 24 * 60 * 60;

const ROUTER: Address = "0x00000000000000000000000000000000000000aa";
const DEPLOYED_ADAPTER: Address = "0x00000000000000000000000000000000000000ad";
const POOL_A: Address = "0x00000000000000000000000000000000000000a1";
const POOL_B: Address = "0x00000000000000000000000000000000000000b2";

const testRouterAbi = [
  {
    type: "function",
    name: "setPoolStatusBatch",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "pools",
        type: "tuple[]",
        components: [
          { name: "pool", type: "address" },
          { name: "allowed", type: "bool" },
        ],
      },
    ],
    outputs: [],
  },
] as const;

interface TestRouterPool {
  pool: Address;
  allowed: boolean;
}

interface TestRouterDeployParams {
  type: "TEST_ROUTER";
  version: number;
  target: Address;
}

type TestRouterState = AdapterStateBase & { pools: TestRouterPool[] };

type SetPoolsAction = BaseMarketAction<
  "ADAPTER::TEST_ROUTER::setPools",
  AdapterActionContext & { pools: TestRouterPool[] }
>;

const poolsList = list<TestRouterPool>(
  object({ pool: identity(address), allowed: boolean }),
  item => item.pool.toLowerCase(),
  item => item.allowed,
);

const setPoolsActionData = defineMarketAction<SetPoolsAction>({
  type: "ADAPTER::TEST_ROUTER::setPools",
  name: "TestRouter::setPools",
  description: "Sets which pools the test router may swap through.",
  gas: ({ params }) => 50_000 + params.pools.length * 30_000,
  schema: adapterActionSchema([310], {
    pools: z.array(z.object({ pool: addressSchema, allowed: z.boolean() })),
  }),
  encode: ({ ctx, params }) =>
    configureAdapter(ctx, params, testRouterAbi, {
      functionName: "setPoolStatusBatch",
      args: [params.pools],
    }),
  ...adapterBatch({
    type: "TEST_ROUTER",
    field: "pools",
    list: poolsList,
    toState: pool => lowerAddresses(pool, ["pool"]),
  }),
});

const testRouterPlugin = defineAdapterPlugin<
  TestRouterDeployParams,
  TestRouterState
>()({
  type: "TEST_ROUTER",
  name: "Test router",
  description: "An adapter the package does not ship",
  isEditable: true,
  allowGas: 1_500_000,
  deployParamsSchema: plainDeployParamsSchema("TEST_ROUTER"),
  stateSchema: adapterStateSchema<TestRouterState>({ pools: poolsList }),
  actions: { setPools: setPoolsActionData },
  getDefaultParams: () => ({
    type: "TEST_ROUTER",
    version: 310,
    target: ROUTER,
  }),
  getDeployParams: args => adapterDeployParams(args),
  getDeployState: params => ({
    ...deployState("TEST_ROUTER", params),
    pools: [],
  }),
  getStateFromSDK: adapter => ({
    ...sdkState("TEST_ROUTER", adapter),
    // The stubbed on-chain adapter lists its pools; no SDK contract type does.
    pools: (adapter as unknown as { pools: Address[] }).pools.map(pool => ({
      pool,
      allowed: true,
    })),
  }),
});

const allowTestRouter: AllowAdapterAction = {
  type: "CREDIT::allowAdapter",
  params: {
    creditManager: CM,
    adapter: { type: "TEST_ROUTER", version: 310, target: ROUTER },
  },
};

const setPools = (pools: TestRouterPool[]): SetPoolsAction =>
  createAction(testRouterPlugin.actions.setPools, {
    creditManager: CM,
    version: 310,
    target: ROUTER,
    pools,
  });

/** The test router's state in `state`, typed as its plugin describes it. **/
function routerState(
  state: MarketState | undefined,
): TestRouterState | undefined {
  return state?.creditManagers[CM].adapters[ROUTER] as
    | TestRouterState
    | undefined;
}

/** A market whose credit manager already has the test router allowed. **/
function stateWithRouter(pools: TestRouterPool[]): MarketState {
  const state = marketState();
  const cm = state.creditManagers[CM];
  const router: TestRouterState = {
    type: "TEST_ROUTER",
    version: 310,
    target: ROUTER,
    adapter: DEPLOYED_ADAPTER,
    isForbidden: false,
    pools,
  };
  cm.adapters = { [ROUTER]: router };
  return state;
}

/**
 * Adds a deployed test router to the stubbed on-chain credit manager, and
 * returns the suite it was added to.
 **/
function deployRouterOnChain(
  marketSuite: MarketSuite | undefined,
): MarketSuite {
  if (!marketSuite) throw new Error("The test SDK serves no market suite");
  // The stub's adapters are a plain `Map`, not the SDK's `AddressMap`.
  const adapters = marketSuite.creditManagers[0].creditManager
    .adapters as unknown as Map<Address, unknown>;
  adapters.set(DEPLOYED_ADAPTER, {
    contractType: "ADAPTER::TEST_ROUTER",
    version: 310,
    address: DEPLOYED_ADAPTER,
    targetContract: ROUTER,
    pools: [POOL_A],
  });
  return marketSuite;
}

describe("declaring an adapter plugin", () => {
  it("rejects an action not named after the plugin's adapter type", () => {
    expect(() =>
      defineAdapterPlugin()({
        ...testRouterPlugin,
        type: "OTHER_ROUTER",
      }),
    ).toThrow(/must be named ADAPTER::OTHER_ROUTER::<function>/);
  });

  it("cannot replace a built-in adapter type", async () => {
    await expect(
      createTestSdk({
        marketSuite: null,
        plugins: [
          { ...testRouterPlugin, type: "UNISWAP_V3_ROUTER", actions: {} },
        ],
      }),
    ).rejects.toThrow(/UNISWAP_V3_ROUTER is registered twice/);
  });

  it("registers per SDK instance and leaves the built-in registry alone", async () => {
    const { sdk } = await createTestSdk({
      marketSuite: null,
      plugins: [testRouterPlugin],
    });
    expect(sdk.registry.adapter("TEST_ROUTER")).toBe(testRouterPlugin);
    expect(sdk.registry.marketAction("ADAPTER::TEST_ROUTER::setPools")).toBe(
      setPoolsActionData,
    );
    expect(GipRegistry.builtin.adapter("TEST_ROUTER")).toBeUndefined();
    expect(
      GipRegistry.builtin.marketAction("ADAPTER::TEST_ROUTER::setPools"),
    ).toBeUndefined();
  });

  it("builds typed actions with createAction", () => {
    expect(setPools([{ pool: POOL_A, allowed: true }])).toEqual({
      type: "ADAPTER::TEST_ROUTER::setPools",
      params: {
        creditManager: CM,
        version: 310,
        target: ROUTER,
        pools: [{ pool: POOL_A, allowed: true }],
      },
    });
  });
});

describe("building a GIP with an external adapter", () => {
  it("rejects the adapter and its actions on an SDK without the plugin", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const market = sdk.market({ initialState: marketState() });
    expect(() => market.addAction(allowTestRouter)).toThrow(
      /Unknown adapter type .*TEST_ROUTER/,
    );
    let error: unknown;
    try {
      market.addAction(setPools([{ pool: POOL_A, allowed: true }]));
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(GipScopeError);
    expect((error as GipScopeError).code).toBe("UNKNOWN_ACTION_TYPE");
  });

  it("validates deploy params and action params with the plugin's schemas", async () => {
    const { sdk } = await createTestSdk({
      marketSuite: null,
      plugins: [testRouterPlugin],
    });
    const market = sdk.market({ initialState: marketState() });
    expect(() =>
      market.addAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: CM,
          adapter: { type: "TEST_ROUTER", version: 999, target: ROUTER },
        },
      }),
    ).toThrow();
    expect(() =>
      market.addAction({
        type: "ADAPTER::TEST_ROUTER::setPools",
        params: { creditManager: CM, version: 310, target: ROUTER, pools: 1 },
      }),
    ).toThrow();
  });

  it("allows, configures and encodes the adapter", async () => {
    const { sdk } = await createTestSdk({
      marketSuite: null,
      plugins: [testRouterPlugin],
    });
    const builder = sdk
      .market({ initialState: marketState() })
      .addAction(allowTestRouter)
      .addAction(setPools([{ pool: POOL_A, allowed: true }]));

    const preview = await builder.preview();
    expect(preview.actionDiagnostics).toEqual([]);
    expect(preview.after.creditManagers[CM].adapters[ROUTER]).toEqual({
      type: "TEST_ROUTER",
      version: 310,
      target: ROUTER,
      adapter: zeroAddress,
      isForbidden: false,
      pools: [{ pool: POOL_A, allowed: true }],
    });

    const plan = await builder.build({ author: AUTHOR, eta: ETA });
    expect(plan.payloadCalls).toHaveLength(2);
    const [allow, configure] = plan.payloadCalls.map(call =>
      call.callData.toLowerCase(),
    );
    // The adapter is deployed from the Bytecode Repository by its type.
    expect(allow).toContain(stringToHex("TEST_ROUTER", { size: 32 }).slice(2));
    // The plugin's own call is wrapped in `configureAdapterFor`.
    const inner = encodeFunctionData({
      abi: testRouterAbi,
      functionName: "setPoolStatusBatch",
      args: [[{ pool: POOL_A, allowed: true }]],
    });
    expect(configure).toContain(inner.slice(2).toLowerCase());
    expect(plan.gas.total).toBeGreaterThanOrEqual(1_500_000 + 80_000);
  });

  it("merges the plugin's actions by key, after the adapter they configure", async () => {
    const { sdk } = await createTestSdk({
      marketSuite: null,
      plugins: [testRouterPlugin],
    });
    const preview = await sdk
      .market({ initialState: marketState() })
      .addAction(setPools([{ pool: POOL_A, allowed: true }]))
      .addAction(allowTestRouter)
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 10 } })
      .addAction(setPools([{ pool: POOL_B, allowed: true }]))
      .preview();

    expect(preview.resolvedActions.map(({ type }) => type)).toEqual([
      "CREDIT::allowAdapter",
      "POOL::setTotalDebtLimit",
      "ADAPTER::TEST_ROUTER::setPools",
    ]);
    expect((preview.resolvedActions[2] as SetPoolsAction).params.pools).toEqual(
      [
        { pool: POOL_A, allowed: true },
        { pool: POOL_B, allowed: true },
      ],
    );
    expect(preview.actionDiagnostics).toEqual([]);
  });

  it("checks the plugin's actions against the state before them", async () => {
    const { sdk } = await createTestSdk({
      marketSuite: null,
      plugins: [testRouterPlugin],
    });
    const builder = sdk
      .market({
        initialState: stateWithRouter([{ pool: POOL_A, allowed: true }]),
      })
      .addAction(setPools([{ pool: POOL_A, allowed: true }]));

    const preview = await builder.preview();
    expect(preview.blockedAt).toBe(0);
    expect(preview.actionDiagnostics[0]).toMatchObject({
      code: "NO_OP",
      actionType: "ADAPTER::TEST_ROUTER::setPools",
    });
    await expect(builder.build({ author: AUTHOR, eta: ETA })).rejects.toThrow(
      GipActionError,
    );
  });
});

describe("reading and diffing an external adapter", () => {
  it("reads an adapter no plugin describes with the state every adapter has", async () => {
    const { sdk, marketSuite } = await createTestSdk();
    const suite = deployRouterOnChain(marketSuite);
    const preview = await sdk
      .market({ pool: suite.pool.pool.address })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 10 } })
      .preview();
    expect(preview.before?.creditManagers[CM].adapters[ROUTER]).toEqual({
      type: "TEST_ROUTER",
      version: 310,
      target: ROUTER,
      adapter: DEPLOYED_ADAPTER,
      isForbidden: false,
    });
  });

  it("reads the adapter's own state with its plugin", async () => {
    const { sdk, marketSuite } = await createTestSdk({
      plugins: [testRouterPlugin],
    });
    const suite = deployRouterOnChain(marketSuite);
    const preview = await sdk
      .market({ pool: suite.pool.pool.address })
      .addAction(setPools([{ pool: POOL_B, allowed: true }]))
      .preview();
    expect(routerState(preview.before)?.pools).toEqual([
      { pool: POOL_A, allowed: true },
    ]);
    expect(routerState(preview.after)?.pools).toEqual([
      { pool: POOL_A, allowed: true },
      { pool: POOL_B, allowed: true },
    ]);
  });

  it("diffs the adapter's own state only with its plugin", () => {
    const expected = stateWithRouter([{ pool: POOL_A, allowed: true }]);
    const observed = stateWithRouter([{ pool: POOL_B, allowed: true }]);

    // Without the plugin the fields every adapter has are compared, and the
    // adapter's own fields are reported as unreadable rather than dropped.
    const unchecked = diffMarketStates(expected, observed);
    expect(unchecked.changes).toEqual([]);
    expect(
      unchecked.diagnostics.map(({ code, path }) => [code, path.at(-1)]),
    ).toEqual([
      ["unexpected-field", "pools"],
      ["unexpected-field", "pools"],
    ]);

    const registry = GipRegistry.builtin.extend([testRouterPlugin]);
    const diff = diffMarketStates(expected, observed, { registry });
    expect(diff.diagnostics).toEqual([]);
    expect(diff.changes.map(({ op, path }) => [op, path.slice(-2)])).toEqual([
      ["remove", ["pools", POOL_A]],
      ["add", ["pools", POOL_B]],
    ]);
  });
});
