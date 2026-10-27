# Curator: GIP builder

Builds, previews and simulates GIPs (Gearbox Improvement Proposals) for one
MarketConfigurator.

Code: [`src/permissionless/curator`](../../src/permissionless/curator). Public
surface: `@gearbox-protocol/sdk/permissionless` — `permissionless.curator.open`
(see [`api/curator`](../../src/permissionless/api/curator)) and everything
below, exported from the same barrel.

Two APIs live here:

- **`CuratorSession`** — the stateful, scoped API described below. Prefer it.
- **`MarketExecutor`, `ConfigurationExecutor`** and the rest of the
  stateless layer (state readers, diffs, bundles, editing) — for callers that
  persist actions themselves and replay them.

## Scopes

A session is scoped to **one chain, one MarketConfigurator and one source
block**. Within it:

| Scope | Builder | Applies to |
| --- | --- | --- |
| market | `session.market(...)`, `session.newMarket(...)` | exactly **one** market (pool) of the configurator, including the periphery contracts it deploys (`BCR::deployContract`) and registers |
| configurator | `session.configurator(...)` | entities **every** market of the configurator shares: admins, governor, the treasury splitter's configuration and balances (`TREASURY_SPLITTER::distribute`) |

Scope is enforced twice: the builders' parameter types reject the wrong action at
compile time, and `addAction` re-checks the type at runtime, so JSON input cannot
slip past either.

```ts
market.addAction({ type: "CONFIGURATOR::addAdmin", params: { admin } });
//                ^ type error, and a GipScopeError at runtime

// Untrusted input: `addAction` already validates and normalizes, but parsing
// first gives you the error before any intent is recorded.
import { parseMarketScopedAction } from "@gearbox-protocol/sdk/permissionless";
market.addAction(parseMarketScopedAction(JSON.parse(body)));
```

`addAction` runs the action's Zod schema, so a typed call and a JSON payload
produce identical, normalized parameters (percentages rounded, defaults
applied) and invalid parameters are rejected on the spot.

Bundle payloads are also parsed and normalized when they satisfy their
schemas. For compatibility with legacy catalog entries, an older parameter that
does not satisfy a newer schema is applied **as authored** and reported on
`preview.bundles[i].paramWarnings` and in `preview.incompleteChecks` rather than
silently skipped or rejected.

Builder methods (`addAction`, `addActions`, `applyBundle`) are **synchronous and
chainable** — they only record intent. `preview()`, `build()` and `simulate()` are
asynchronous and do the work.

Recorded actions are combined the same way everywhere — in every builder, in
bundle merges and in `addMarketAction` / `addConfiguratorAction` for callers
that keep their own list (see [Adding actions](#adding-actions)): a later
action that configures the same thing as an earlier one merges into it.

### What every builder offers

The two builders share one lifecycle, so they behave the same way:

| Member | Meaning |
| --- | --- |
| `scope` | `"market"` or `"configurator"` |
| `source` | the session's source snapshot |
| `revision` | starts at `0` and grows by one per recorded action or bundle; a rejected action records nothing |
| `addAction(action)`, `addActions(actions)` | validate, normalize and record |
| `recordedActions()` | what was recorded, in order, frozen; the market builder lists bundle applications too |
| `preview({ eta? })` | resolved actions and projected state at ETA, defaulting to source time |
| `build({ author, eta })` | the plan, see [Plans](#plans) |
| `simulate(options?)` | see [Simulation](#simulation) |

The market builder adds `pool` and `applyBundle(...)`.

`preview()`, `build()` and `simulate()` work on the intent recorded **at the
moment they are called**: recording more while one of them is still running does
not leak into its result. One compilation is shared by all three per revision and ETA,
and a plan is cached per revision, author and eta, so repeated calls return the
same frozen object without repeating the RPC work. A failed compilation is not
cached, so fixing the cause and calling again works.

## Opening a session

Through `permissionless.curator.open`, select a chain with `chainId` or an
Anvil node with `fork`. For a chain, attach the permissionless client first:

```ts
import { GearboxPermissionless } from "@gearbox-protocol/sdk/permissionless";

const permissionless = new GearboxPermissionless({ baseUrl, transports });
await permissionless.attach();

const session = await permissionless.curator.open({
  chainId: 1,
  marketConfigurator: MC,
  blockNumber: 21_000_000n,     // optional; defaults to the head at creation time
});
```

Or without the backend, on a viem client of your own:

```ts
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { CuratorSession } from "@gearbox-protocol/sdk/permissionless";

const client = createPublicClient({ chain: mainnet, transport: http(RPC_URL) });

const session = await CuratorSession.create({
  client,                       // reused directly; no transport URL is read off it
  marketConfigurator: MC,
  blockNumber: 21_000_000n,
});

session.mode; // "chain"

session.source;
// { chainId: 1, marketConfigurator: "0x…", blockNumber: 21000000n,
//   blockHash: "0x…", blockTimestamp: 1717… }
```

Every initial read, projection dependency and transaction dependency resolves at
`session.source.blockNumber`, and `session.source.blockTimestamp` replaces
`Date.now()` where the state model depends on time.
The pinned proxy also supplies Gearbox's chain metadata to `OnchainSDK` while
delegating all actions to the caller's existing public client.
Supplemental market-state reads are explicitly routed through that pinned
client even when the market snapshot came from a caller-provided OnchainSDK.

Optional inputs, the same for `open` and `create` in both connection modes:

```ts
const session = await CuratorSession.create({
  client,
  marketConfigurator: MC,
  blockNumber,
  sdk: existingOnchainSdk,        // reuse an attached/hydrated OnchainSDK
  // sdkState: serializedGearboxState, // use this instead of sdk to hydrate a snapshot
  tokenDecimals: { [token]: 6 },  // explicit overrides; win over every other source
  gasLimit: 550_000_000n,
  plugins: [myAdapterPlugin],     // adapter plugins the SDK does not ship
});
```

### Anvil fork mode

Select the fork when opening the session. It owns a client for that URL and
uses it for all chain reads, address predictions, token metadata and plan
dependencies. Start Anvil with a fork of the target chain first; the SDK
connects to the running node and detects its chain id. The node must support
`anvil_nodeInfo`.

```ts
const permissionless = new GearboxPermissionless();
const session = await permissionless.curator.open({
  marketConfigurator: MC,
  fork: { rpcUrl: "http://127.0.0.1:8545", timeoutMs: 180_000 },
});

session.mode; // "fork"
session.fork; // frozen { rpcUrl, timeoutMs }
const market = session.market({ pool: POOL }).addAction(marketAction);
const result = await market.simulate(); // same creation-time Anvil node
```

Fork mode needs no `attach()` or backend connection. Pass either `chainId` or
`fork` to `open`; passing both, or neither, is rejected in TypeScript and at
runtime. `CuratorSession.create({ marketConfigurator: MC, fork: { rpcUrl } })`
also remains available; `create` accepts either `client` or `fork`.

Fork mode snapshots the node's current block and hash, including blocks mined
locally after forking. An explicit `blockNumber` must equal that current block.
If the node's block number or hash changes before simulation, create a fresh
session; simulation rejects the stale snapshot before mutating the node.
Snapshot isolation restores the node afterward, so repeated simulations can
reuse the session.

Supplying an attached `sdk` in fork mode copies its state into a fresh OnchainSDK
on the fork client. Its original connection is never reused. `sdkState` is also
copied before hydration. Caller-supplied snapshot provenance remains unverified;
fetched market and configurator state reports `stateProvenance: "fork-read"`.

## Market scope

### Fetched state

```ts
const market = session
  .market({ pool: POOL })
  .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 50_000_000 } })
  .addAction({
    type: "CREDIT::rampLiquidationThreshold",
    params: {
      creditManager: CM,
      token: WETH,
      liquidationThresholdFinal: 87,
      rampStart: session.source.blockTimestamp + 3_600,
      rampDuration: 7 * 24 * 60 * 60,
    },
  });

const preview = await market.preview();
preview.stateProvenance;  // "chain-read"
preview.before;           // state read at session.source.blockNumber
preview.after;            // projected state
preview.eta;              // assumed earliest execution time; defaults to source time
preview.resolvedActions;  // after bundle merges and credit-manager resolution
preview.diagnostics;      // getGipDiagnostics findings
preview.incompleteChecks; // checks that could NOT be completed, and why
```

### Supplied state

A supplied state is authoritative: it is used as-is and never replaced by an
on-chain read. Other reads (address predictions, deployment previews, diagnostic
checks) still happen — supplying state does not mean zero RPC.
`stateProvenance: "caller-supplied"` deliberately makes no claim that this state
belongs to `session.source.blockNumber` or `session.source.blockHash`; those
values only identify the chain reads performed by this session.

```ts
const preview = await session
  .market({ pool: POOL, initialState: storedMarketState })
  .addAction({ type: "POOL::pause", params: {} })
  .preview();

preview.stateProvenance; // "caller-supplied"
```

A state whose `address` is not the builder's pool, or a configurator state from
another configurator, is rejected.

### New market

```ts
const market = session.newMarket({
  minorVersion: 310,
  name: "Gearbox USDC",
  symbol: "dUSDC",
  underlying: USDC,
  underlyingPriceFeed: USDC_FEED,
  interestRateModel: { type: "LINEAR", params: { /* … */ } },
  rateKeeperParams: { type: "TUMBLER", epochSeconds: 604_800 },
  lossPolicyParams: { type: "ALIAS" },
});

const preview = await market.preview();
preview.stateProvenance;      // "new-market"
preview.before;               // undefined: there was no prior state
preview.pool;                 // the pool address the creation is predicted to deploy
preview.predictedDeployments; // [{ address: pool, actionType: "MARKET::createMarket", … }]
```

### Bundles

Bundle application exists **only** in the market scope. The SDK ships no
strategy catalog: a bundle is any `Bundle` whose actions are market-scoped,
from a catalog of your own or built by hand.

```ts
const market = session.market({ pool: POOL }).applyBundle(bundle);

const preview = await market.preview();
preview.bundles;
// [{ bundleName, targetCreditManager, targetResolution, added: [...], replaced: [...] }]
```

Pass the same overrides as a strategy form directly to `applyBundle`:

```ts
const market = session.market({ pool: POOL }).applyBundle(bundle, {
  deployCreditSuiteParams: {
    name: "My strategy",
    salt: "my-strategy-01", // use a fresh salt to deploy another strategy
    feeInterest: 10,
    feeLiquidation: 1,
    feeLiquidationPremium: 4,
    minDebt: 100_000,
    maxDebt: 1_000_000,
  },
  targetAssetParams: { liquidationThreshold: 87 },
});

const preview = await market.preview();
const result = await market.simulate(); // session created with fork: { rpcUrl }
```

Deployment overrides are partial: omitted values come from the bundle's action.
They are validated and normalized before the new credit-manager address is
predicted. Regular liquidation fee overrides also set their expired equivalents
unless explicit expired fees are supplied. The original bundle and the options
are copied, so later caller edits do not change the recorded intent.

`maxEnabledTokens` always comes from `bundle.enabledTokens` and is not a
customization option. This also applies when no overrides are passed.

`targetAssetParams` changes every collateral token with a positive liquidation
threshold in the bundle, including receipt tokens. When the bundle deploys a
credit suite, this also adds token limits and a credit-manager pool debt limit
using its effective `maxDebt`, then updates Tumbler rates. Existing token
limits are preserved when they are larger. An LT-only override on a bundle that
targets an existing manager leaves its borrowing limit unchanged. Optional
`targetAssetParams.token` accepts the selected-token metadata from the form.

`customizeBundle(bundle, options)` remains available as a standalone helper and
applies the same overrides; pass its result to `applyBundle` without repeating
the customization options.

A bundle names the credit manager it configures with a placeholder,
`BUNDLE_TARGET` (`suite:$bundle`); catalog JSON may spell it as the zero
address, which `applyBundle` translates. The placeholder is bound when the
bundle is applied:

- to the credit suite the bundle itself deploys (`MARKET::createCreditSuite`):
  that suite gets the id `bundle:<name>` (`bundle:<name>:<salt>` with a salt) and
  the bundle's actions refer to it as `suite:bundle:<name>` — see
  [Credit suite references](#credit-suite-references). Applying the same bundle
  again merges into the same suite;
- otherwise to the market's single credit manager after earlier recorded
  actions, including any suites those actions deploy (by reference when the
  suite has an id).

More than one candidate, or none, raises `GipTargetResolutionError` instead of
guessing. To configure existing managers in a market with several, specify
their `creditManager` addresses in the bundle actions. Bundles without
placeholders use those addresses as authored. A bundle merge can replace
actions recorded earlier, so the projection is replayed from the initial state
after every merge; the replay is pure, because every action's chain reads are
memoized by the session.

### Credit suite references

An action can name a credit suite the same GIP deploys before its address is
known: give the `MARKET::createCreditSuite` an `id` and use `suite:<id>` as the
`creditManager` of later actions.

```ts
session.market({ pool: POOL })
  .addAction({ type: "MARKET::createCreditSuite", params: { id: "wbtc", name: "WBTC strategy", … } })
  .addAction({
    type: "CREDIT::addCollateralToken",
    params: { creditManager: "suite:wbtc", token: WBTC, liquidationThreshold: 80 },
  });
```

References are resolved to the suite's predicted address when the actions run:
`preview.resolvedActions` and every payload name addresses. Because the
reference does not depend on the suite's params, editing them — which changes
the predicted address — leaves the actions that configure it attached. A
reference to a suite no earlier action deploys is an `UNKNOWN_CREDIT_SUITE`
error. `retargetCreditManager`, `copyCmActions` and `copyCmActionsForMarket`
move or copy actions between targets of either kind.

### Adding actions

`addMarketAction(actions, action)` (and `addConfiguratorAction`) is how every
caller adds to an action list:

1. An action of the same type and `key` as an earlier one merges into it, as its
   definition's `merge` policy says: it takes the earlier action's place, or
   moves to the end (`position: "last"`, e.g. adapter configuration, which must
   follow `CREDIT::allowAdapter`); `combine` decides the merged params, the later
   action's by default. Adapter batches combine item by item, so a second batch
   for the same adapter adds to the first instead of dropping it.
2. Any other action goes to the end — unless an action already in the list
   `requires` something it `provides`. Then it goes right before the first such
   action: a Degen NFT registration lands before the credit suite that uses it,
   a Bytecode Repository deployment before the registration of what it deploys,
   an asset before the collateral that uses it.

Outside a session, pass the registry holding the actions' definitions when the
list may contain actions of an external adapter plugin:
`addMarketAction(actions, action, session.registry)`.

### External adapter plugins

An adapter the SDK does not ship is added by defining its plugin — with the
same `defineAdapterPlugin` the built-in adapters use (see
[Adding an adapter](#adding-an-adapter)) — and handing it to the session.
Everything a plugin is made of is one object,
[`adapterPluginKit`](../../src/permissionless/curator/plugins/adapters/adapterPluginKit.ts):

```ts
import {
  adapterPluginKit,
  createAction,
  CuratorSession,
} from "@gearbox-protocol/sdk/permissionless";

// One object, so generic names (`list`, `address`…) stay out of the barrel.
const {
  adapterBatch,
  adapterDeployParams,
  addressSchema,
  configureAdapter,
  creditManagerTargetSchema,
  defineAdapterPlugin,
  defineMarketAction,
  deployState,
  plainDeployParamsSchema,
  sdkState,
  schema: { adapterStateSchema },
} = adapterPluginKit;

const setPoolsActionData = defineMarketAction<SetPoolsAction>({
  type: "ADAPTER::MY_ROUTER::setPools",   // must be ADAPTER::<plugin type>::<function>
  description: "Sets which pools the router may swap through",
  gas: ({ params }) => 50_000 + params.pools.length * 30_000,
  schema: z.object({
    creditManager: creditManagerTargetSchema,
    version: z.literal(310),
    target: addressSchema,
    pools: z.array(z.object({ pool: addressSchema, allowed: z.boolean() })),
  }),
  encode: ({ ctx, params }) =>
    configureAdapter(ctx, params, myRouterAbi, {
      functionName: "setPoolStatusBatch",
      args: [params.pools],
    }),
  // key, merge, placement, check (NO_OP) and apply, like the built-in batches
  ...adapterBatch({ type: "MY_ROUTER", field: "pools", list: myPoolsList, toState }),
});

export const myRouterPlugin = defineAdapterPlugin<MyRouterDeployParams, MyRouterState>()({
  type: "MY_ROUTER",
  name: "My router",
  description: "…",
  isEditable: true,
  allowGas: 1_500_000,
  deployParamsSchema: plainDeployParamsSchema<MyRouterDeployParams>("MY_ROUTER"),
  stateSchema: adapterStateSchema<MyRouterState>({ pools: myPoolsList }),
  getDefaultParams: () => ({ type: "MY_ROUTER", version: 310, target: ROUTER }),
  // the constructor is (creditManager, target) unless constructorAbi says otherwise
  getDeployParams: (args) => adapterDeployParams(args),
  getDeployState: (params) => ({ ...deployState("MY_ROUTER", params), pools: [] }),
  getStateFromSDK: (adapter) => ({ ...sdkState("MY_ROUTER", adapter), pools: readPools(adapter) }),
  actions: { setPools: setPoolsActionData },
});

const session = await CuratorSession.create({ client, marketConfigurator: MC, plugins: [myRouterPlugin] });

await session
  .market({ pool })
  .addAction({
    type: "CREDIT::allowAdapter",
    params: { creditManager, adapter: { type: "MY_ROUTER", version: 310, target: ROUTER } },
  })
  .addAction(
    createAction(myRouterPlugin.actions.setPools, {   // typed by the definition
      creditManager,
      version: 310,
      target: ROUTER,
      pools: [{ pool: POOL, allowed: true }],
    }),
  )
  .build({ author, eta });
```

- Plugins belong to one session: `session.registry` is the built-in registry
  extended with them, and nothing global changes. A plugin cannot replace a
  built-in adapter type or action type — `CuratorSession` throws.
- A registry lists what it knows — `adapterPlugins`, `marketActions`,
  `configuratorActions` — and looks one up by type (`marketAction(type)`,
  `requireMarketAction(type)`, …). `GipRegistry.builtin` is the SDK's own.
  To validate an untrusted action, use `parseMarketScopedAction(input,
  registry)` or `parseConfiguratorScopedAction(input, registry)`.
- Everything that looks an adapter or action type up goes through the
  registry: parsing and scope checks, `CREDIT::allowAdapter` (deploy params,
  deploy state, gas), merging and placement, `check`, encoding, the
  `outdatedAdapterVersion` diagnostic, reading markets and diffing simulations.
- To the compiler, `addAction` accepts a built-in action with its own params
  type, or any `ADAPTER::<type>::<function>` action (`ExternalAdapterAction`).
  Its plugin validates it at runtime; `createAction(definition, params)` checks
  the params at compile time too.
- A session without the plugin rejects its adapter (`Unknown adapter type`) and
  its actions (`GipScopeError` `UNKNOWN_ACTION_TYPE`). A market already using
  an adapter no plugin describes still reads: the adapter gets the state every
  adapter has (`type`, `version`, `target`, `adapter`, `isForbidden`), and
  fields of its own are reported by the diff as `unexpected-field` diagnostics.
- The executors take the registry too, `new MarketExecutor(ctx, { registry })`,
  as do `getMarketState(…, { registry })` and `diffMarketStates(…, { registry })`;
  each defaults to `GipRegistry.builtin`.

Adapter plugins can provide `resolveValidation({ client, params, marketConfigurator })`.
It reads source facts once and returns a pure `(state, creditManager) => false | string`
check. The builder reruns that check after preceding actions without rereading chain
metadata. `defineAdapterPlugin` also supplies the UI `validateParams` method from it,
so both paths share validation. `adapterPluginKit.resolveTargetTokens` covers the
common case of a target whose tokens must already be collateral.

## Configurator scope

```ts
const config = session
  .configurator()                                     // reads state at the source block
  .addAction({ type: "CONFIGURATOR::addAdmin", params: { admin, role: "PAUSABLE_ADMIN" } })
  .addAction({ type: "CONFIGURATOR::setEmergencyAdmin", params: { emergencyAdmin } });

const preview = await config.preview();   // before / after ConfiguratorState
const plan = await config.build({ author, eta });
const result = await config.simulate();   // session created with fork: { rpcUrl }

// Or with state you already have:
session.configurator({ initialState: storedConfiguratorState });
```

The projection is strict, like the market scope's (see [Action checks](#action-checks)):
adding an admin that already holds the role, removing one that does not,
re-setting the current emergency admin, re-proposing the current default split or
cancelling an unknown treasury proposal is an error in `preview.actionDiagnostics`,
and `build()` and `simulate()` reject.

## Treasury balances

`ConfiguratorState.treasury.balances` tracks what the treasury splitter holds of
every token the configurator's markets pay fees in: each pool token (fees are
minted as pool shares) and each underlying, enumerated through
`contractsRegister().getPools()`. Per token, in token units:

- `available` — what `TREASURY_SPLITTER::distribute` would send to the split's
  receivers: the balance above the insurance amount, or zero;
- `insuranceAmount` — what `distribute` keeps (`tokenInsuranceAmount`).

```ts
const preview = await session
  .configurator()
  .addAction({ type: "TREASURY_SPLITTER::distribute", params: { token: USDC } })
  .preview();

preview.after.treasury.balances[USDC].available; // 0
```

Distributing a token with nothing available is a `NO_OP` error; a token the
state does not track is distributed with a `TOKEN_NOT_TRACKED` warning, since
its amount cannot be projected.

## Periphery deployments

`BCR::deployContract` is a market action that deploys one of the market's
periphery contracts — a Degen NFT or a zapper — through the Bytecode Repository.
Its contract type names the domain (`ZAPPER::ERC4626_UNDERLYING` → `ZAPPER`);
other contract types are rejected.

Each `MarketState.periphery` entry has a `status`:

- `deployed` — added by `BCR::deployContract` at its expected address;
- `registered` — registered with the configurator. `MARKET::addPeripheryContract`
  turns a `deployed` entry into a `registered` one (keeping its type and
  version), or adds a `registered` entry for a contract deployed earlier.

```ts
session.market({ pool: POOL })
  .addAction({ type: "MARKET::addPeripheryContract", params: { peripheryContract: ZAPPER, domain: "ZAPPER", type: "ZAPPER::ERC4626_UNDERLYING" } })
  .addAction({ type: "BCR::deployContract", params: { contractType: "ZAPPER::ERC4626_UNDERLYING", version: 310, constructorParams, salt, expectedAddress: ZAPPER } });
// resolvedActions: deployContract first — the registration requires the contract
```

The deployment is checked against the chain: the CREATE2 address computed for
the TimeLock must equal `expectedAddress` (`EXPECTED_ADDRESS_MISMATCH`), and the
address must not hold code yet (`ALREADY_DEPLOYED`). A simulation verifies a
deployed-but-unregistered entry by the code at its address, since the chain
reader cannot discover unregistered contracts by itself.

## Action checks

Every action is checked against the state right before it — the state the
earlier actions of the same GIP leave behind — before it is applied. A check
answers one question: would this call revert on chain, or do nothing?

```ts
const preview = await market.preview();
preview.actionDiagnostics;
// [{ severity: "error", code: "LT_ABOVE_UNDERLYING", actionIndex: 3,
//    actionType: "CREDIT::addCollateralToken",
//    path: ["params", "liquidationThreshold"], message: "…" }]
preview.blockedAt; // 3
```

- An **error** stops the projection at that action, as the batch would revert
  there: `preview.after` is the state right before it, and `build()` and
  `simulate()` reject with a `GipActionError` (`code`, `actionIndex`,
  `actionType`, `path`, `diagnostics`).
- A **warning** is reported and the projection goes on, e.g.
  `RAMP_START_CLAMPED` for a ramp starting in the past, which the credit
  configurator moves to execution time.
- Redundant actions are errors (`NO_OP`): pausing a paused pool, forbidding a
  forbidden token, setting a limit, fee, feed or rate to its current value,
  registering a registered periphery contract.

The checks encode the contracts' own rules, for example: a liquidation
threshold may not exceed the underlying's; a ramp lasts at least two days;
`setFees` keeps fee + premium constant (`InconsistentLiquidationFeesException`);
an expiration date is in the future, only moves later and needs an expirable
facade; Tumbler and Gauge actions need that rate keeper and a quoted token; an
adapter action needs an allowed adapter of its kind; a Bytecode Repository
deployment must land on its expected address.

`MarketExecutor.executeBatch` and `ConfigurationExecutor.executeBatch` throw the
`GipActionError`; `execute` and `project` report it instead.

## Plans

```ts
const plan = await market.build({ author, eta });

plan.scope;               // "market" | "configurator" — plans are discriminated
plan.source;              // chain, configurator, source block and its timestamp
plan.eta;                 // earliest execution time, also used for projection
plan.before / plan.after; // market or configurator states
plan.resolvedActions;

plan.payloadCalls;        // the GIP's own calls — what the TimeLock will execute
plan.payloadCallHashes;   // TimeLock hash of each payload call at `eta`
plan.batches;             // payload calls grouped to fit a block's gas limit

plan.timelockTxs;         // startBatch + queueTransaction wrappers, per batch
plan.executeBatchSafeTxs; // convertQueueBatchToExecuteTx(queueBatch), per batch
plan.executeBatchTxs;     // GovernorContract.createExecuteBatchTx(...), per batch

plan.feedDependencies;    // { perBatch, updatablePerBatch, all }
plan.gas;                 // { model: "heuristic-action-table", isActualMeasurement: false, … }

plan.incompleteChecks;    // checks the preview could NOT complete, carried verbatim
plan.bundles;             // (market scope) bundle merges, including paramWarnings
plan.diagnostics;         // (market scope) getGipDiagnostics findings
```

`incompleteChecks` travels with the plan on purpose: a consumer that only sees
`build()` or `serializeGipPlan()` output must still be able to tell "checked,
nothing found" from "not checked" — supplied-snapshot caveats, bundle schema
warnings, failed diagnostic reads and the configurator `shutdown` placeholder
are all reported there.

Payload calls and governor wrappers are kept apart on purpose: the payload is
what executes, the wrappers are what a signer sends.

`plan.gas` comes from a per-action lookup table, **not** `eth_estimateGas`;
`isActualMeasurement` is always `false`. Run a simulation for real gas. The
configurator scope has no such table: its plan reports `gas.model ===
"unavailable"` with zero placeholders and is therefore emitted as a single batch
rather than split by estimated gas.

Plans are deeply frozen. Recording more intent and rebuilding returns a new plan
and leaves earlier ones untouched; nothing the builder does mutates the state or
bundle you passed in.

```ts
import { deserializeGipPlan, serializeGipPlan } from "@gearbox-protocol/sdk/permissionless";

const json = serializeGipPlan(plan);   // versioned envelope, bigint-safe
const restored = deserializeGipPlan(json);
```

Plans and serialization envelopes use version **2**. Version 1 plans must be rebuilt;
the deserializer rejects their older transition semantics. Legacy supplied market
states still load, but missing reserve, ramp-initial-LT and facade fields remain
unknown and are reported as skipped comparisons rather than assumed zero.

## Simulation

A simulation executes a scope's payload on the Anvil node the session was
created with and compares the resulting state with the projection. Each scope
simulates on its own, and neither `author` nor `eta` is required: the payload
calls are executed directly. Pass `simulate({ eta })` to use the same execution
time as a plan; omitting ETA uses the source block time.

Only a session created in [fork mode](#anvil-fork-mode) can simulate; a
chain-backed session rejects `simulate()` before doing any work.

```ts
const session = await permissionless.curator.open({
  marketConfigurator: MC,
  fork: { rpcUrl: "http://127.0.0.1:8545" },
});

const market = session.market({ pool: POOL }).addAction(marketAction);
const result = await market.simulate();
await session.configurator().addAction(configuratorAction).simulate();

result.verdict;       // "match" | "mismatch" | "incomplete" | "execution_failed"
result.markets;       // per market: expected, observed and their diff
result.configurator;  // the same for the configurator scope
result.receipts;      // [{ hash, status, blockNumber, blockTimestamp, gasUsed, revertReason? }]
result.setupChanges;  // every mutation made to the node
result.failures;      // structured execution / read / cleanup failures
```

`simulate()` takes a few options; the node itself is fixed when the session is
created and cannot be changed per call:

```ts
await market.simulate({
  isolation: "none",        // keep the executed state for inspection
  gas: 20_000_000n,         // gas limit of each payload transaction
  // addressProvider,       // when the fork is not on a known deployment
});
```

`receipts[i].gasUsed` is the node's own receipt value — this is the real gas
`plan.gas` deliberately does not claim to be.

The node's chain id, current block and hash are verified against
`session.source` before anything is executed. A bare Anvil node is accepted for
development, but cannot confirm an upstream fork source and reports a
successful comparison as `incomplete`.

Isolation is on by default: an `evm_snapshot` is taken before any setup and
reverted after the state comparison, so a shared node is left as it was found.
`evm_revert`'s own boolean answer is checked: a `false` (unknown or already
consumed snapshot) is reported as a `cleanup` failure and the node is **not**
claimed to be restored.
Runs that use the same normalized RPC URL are serialized within the process;
otherwise interleaved snapshots and reverts would not provide isolation.

The runner is also available on its own, for executing payload calls without a
session; `simulate()` imports it lazily:

```ts
import { simulateOnAnvil } from "@gearbox-protocol/sdk/permissionless";

const result = await simulateOnAnvil(
  { rpcUrl: "http://127.0.0.1:8545" },
  { chainId, marketConfigurator, sourceBlockNumber, sourceBlockHash, calls },
);
```

## Limitations

What a simulation does **not** do:

- **No governance validation.** It does not exercise the governor queue, the
  eta delay or queue/execute authorization. The TimeLock's code is disabled and
  `MarketConfigurator.admin()` is impersonated to send the payload calls. A
  payload call whose target *is* the TimeLock cannot run and is reported as
  such.
- **No price updates.** Only the payload calls are sent. A call that validates
  a pull-oracle price feed (e.g. `ORACLE::setReservePriceFeed`,
  `LOSS_POLICY::ALIAS::setAlias`) reverts with `StalePriceException` unless the
  prices were pushed on the node beforehand, as executors do in the same
  multicall as `executeBatch`.
- **No re-forking.** Creation captures the configured node's current state. A
  node that moved since then requires a fresh session.
- **No remote forks.** Simulation runs on the session's own Anvil node only.
  Creating or driving forks elsewhere — a remote testnet service, for
  instance — is the application's job.
- **`incompleteChecks` is not decoration.** A check whose read failed is named
  there, so "no diagnostics" is distinguishable from "not checked".
- **Configurator shutdown is not read** by the configurator state reader.
  Fetched configurator previews report this in `incompleteChecks` instead of
  presenting the hardcoded `false` as verified chain state.

Other limitations:

- **Amounts and storage bounds.** Human amounts remain supported. Pool quota
  and pool/manager debt limits also accept decimal strings, such as
  `limit: "0.000001"`, for exact boundaries. Debt limits accept `"Unlimited"`.
  Amount conversion rejects excess fractional units instead of rounding. Checks
  convert amounts to bigint units for the quota int96 bound, debt uint128 bounds
  and max-debt-per-block multiplication. State retains the existing human-readable
  amount fields without duplicate raw amounts.
- **Execution time.** `preview({ eta })`, `build({ author, eta })` and
  `simulate({ eta })` use ETA for time-dependent transitions. Preview and simulation
  default to `session.source.blockTimestamp` when ETA is omitted. An ETA already
  in the past uses the source block time for projection and execution, while the
  original ETA remains in the plan and transaction hashes. Compilations are cached
  by revision and ETA; Anvil uses the same assumed execution time. Actual execution
  later than this assumption can shift expiration clamping and ramp starts.
  Chain metadata is read at the source block. Price validity, freshness and
  restrictions depending on current quota usage are left to Anvil simulation;
  price answers and quota usage are not stored in market state.
- **Expirable suites.** Creation deploys an expirable facade with date zero.
  Creation `expirationDate` inputs are rejected, including zero. Record a separate
  `CREDIT::setExpirationDate` action targeting `suite:<id>`. Dates closer than
  fourteen days are clamped using the assumed execution time. Facade upgrades reset
  pause state and preserve expiration only when both facades are expirable.
- **Contract preflight.** Feed metadata/allowances, collateral admission, periphery
  provenance/NFT registration and common adapter restrictions are checked against
  the state produced by preceding actions. Only source reads are cached. Missing
  reads appear in `incompleteChecks`; a single `executionState` entry records the
  remaining execution-time and integration restrictions. Simulate to verify the actual
  deployments and integration calls.
- **Pinned reads are best-effort.** `session.readClient` injects `blockNumber`
  into viem's read actions; code that bypasses them with raw `client.request`
  calls is not pinned.

## Layout (for contributors)

```
src/permissionless/curator/
  session/               CuratorSession, the market and configurator builders,
                         plans, scope parsing, serialization
  actions/               market action definitions and their helpers (actions/utils)
  configurator-actions/  configurator action definitions
  plugins/               adapter, rate keeper, loss policy and IRM plugins and their actions
  state/                 market and configurator state readers (market/, configurator/)
                         and the schema-driven diff (diff/)
  executor/              MarketExecutor, ConfigurationExecutor
  editing/               adding, merging and placing actions in a list
  bundles/               the Bundle type, applying and customizing bundles
  diagnostics/           getGipDiagnostics
  transactions/          batching, TimeLock wrappers, gas and feed footprints
  simulation/            the Anvil runner and the fork comparison
  testing/               test harness and fixtures (not built)
src/permissionless/api/curator/  the GearboxPermissionless.curator namespace
```

Each file is named after its main export; each directory's `index.ts` exports
the public part of that directory and of its subdirectories, and nothing from
outside it. Inside the curator, import from the module that declares a symbol,
not from a barrel.

### Shared helpers

Shared code lives next to what it serves; reach for these before writing
anything by hand:

| Need | Use |
| --- | --- |
| Normalize or compare addresses | `utils/addressUtils.ts` — `lowerAddress`, `isSameAddress`, `uniqueAddresses` |
| Encode an action's payload call | `actions/utils/configureCalls.ts` — `configurePool`, `configureCreditManager`, `configurePriceOracle`, `configureRateKeeper`, `configureLossPolicy`, `configureAdapter` |
| Memoize `resolve` results | `executor/ResolveCache.ts` — `ResolveCache`; pass one to `MarketExecutor`/`ConfigurationExecutor` (a session shares one) |
| Convert a human-scale amount | `actions/builderContext.ts` — `convertUnderlyingAmount`, `convertTokenAmount` |
| Convert a percentage | `convertPercent` from `src/permissionless/utils/format.ts` (rounds; never `Math.floor(x * 100)`) |
| Bound a numeric param | `validationSchemas.ts` — `uintSchema(bits)`, `nonNegativeNumberSchema`, `refineLiquidationFees` |
| Project an action onto `MarketState` | `updateCreditManagerState` / `updateCollateralToken`, `updateMarketAsset`, `updateAdapterState`, `updateRateKeeperState`, `updateLossPolicyState` |
| Say what an action configures and needs | `actions/utils/actionKeys.ts` — `single`, `byToken`, `byCreditManager`, `byCreditManagerAndToken`, `byAdapter`, `paramsKey`, `resource`, `requiresAsset`, `requiresCreditManager`, `requiresCollateral` |
| Name or move a credit manager target | `actions/creditManagerTargets.ts` — `creditManagerTargetSchema`, `creditSuiteRef`, `BUNDLE_TARGET`, `retargetCreditManager`, `isSameTarget` |
| Write a configurator action | `configurator-actions/configuratorActionHelpers.ts` — `updateAdminRole`, `resolveTreasurySplitter`, `treasurySplitter` |
| Write an adapter plugin | `plugins/adapters/adapterPluginHelpers.ts` — `deployState`, `sdkState`, `plainAdapter`, `adapterDeployParams`, `resolveTargetTokens`, `readAddress(es)` |
| Write an adapter action | `plugins/adapters/adapterActionHelpers.ts` — `adapterBatch`, `adapterActionKeys`, `adapterDiagnostics`, `updateActionAdapter` |
| Share one lazy async value | `session/SharedPromise.ts` — `SharedPromise` (a rejection is not cached) |
| Read an executed fork back | `simulation/forkReads.ts` — `attachForkSdk`, `readFailures` |
| Small shared pieces | `utils/errorMessage.ts`, `constants.ts` (`POOL_CREATION_DEPOSIT`), `state/market/isCreditManagerExpired.ts` |

### Adding an action

An action type is one definition: everything the builder knows about it — its
schema, scope, gas and price feed footprint, state transition and encoding —
lives there.

```ts
export const pauseCreditManagerActionData: MarketScopedDefinition<PauseCreditManagerAction> =
  defineMarketAction<PauseCreditManagerAction>({
    type: "CREDIT::pause",
    description: "…",
    schema: z.object({ creditManager: addressSchema }),
    gas: () => 75_000, // got 70,932
    apply: ({ state, params }) =>
      updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: (cm) => ({ ...cm, paused: true }),
      }),
    encode: ({ ctx, params }) =>
      configureCreditManager(ctx, params.creditManager, { functionName: "pause", args: [] }),
    key: byCreditManager,
    requires: requiresCreditManager,
  });
```

Executing an action has four steps:

1. `resolve` (optional) — the only asynchronous step: whatever the action needs
   from the chain, such as a predicted address or an address provider entry. It
   sees the market's identity (address, name, symbol, underlying, version), never
   its state, and its result is memoized per action type, market and params. A
   replay of the same actions — once per bundle merge, once for the final
   compilation — therefore reads nothing again. An action that resolves names
   the result type: `MarketScopedDefinition<A, R>` and `defineMarketAction<A, R>`.
2. `check` (optional) — whether the action can run on the state before it.
   A market-creation action uses `checkCreate` to validate its source facts.
3. `apply` — the state transition, pure and synchronous. An action that creates
   the market defines `create` instead, which builds the state from nothing.
4. `encode` — the payload call, pure and synchronous. `deployedContract` names
   the contract the call deploys, if any.

- `defineMarketAction` declares a market action type; the helper sets its
  `scope`.
- Annotate the constant with its definition type and pass the action type to the
  helper. The `MarketActions` union is derived from the registered definitions,
  so a definition whose type had to be inferred from its own body would be
  circular.
- `schema` must produce exactly the action's params type: a schema that drifts
  from the params interface does not compile.
- `gas` is required; note the measured value next to the estimate, or "not
  measured". `touchedFeeds` lists the price feeds the call reads, if any.
- `check` returns the action's `ActionDiagnostic`s against the state before it
  (see [Action checks](#action-checks)); build them with `actionError`,
  `actionWarning` and the helpers in `actions/utils/checkHelpers.ts`. `apply`
  may then assume its preconditions hold.
- `key` names what the action configures; `merge` (optional) says how a later
  action with the same key merges into it; `requires` / `provides` name the
  resources that decide where a new action is placed (see
  [Adding actions](#adding-actions)). `actions/utils/actionKeys.ts` has the
  usual ones.
- An action that carries `creditManager` types it as `CreditManagerTarget` and
  validates it with `creditManagerTargetSchema`. Every step after recording sees
  it resolved to an address.
- An adapter action that sets the status of a batch of items spreads
  `adapterBatch(...)`, which supplies `key`, `merge`, `requires`, `check` and
  `apply` from the adapter's state schema.

Then add it to `marketActionDefinitions` in `actions/marketActionDefinitions.ts`
(plugin actions go into their plugin's `…MarketActionsData` list instead). That
is the only registration: the `MarketActions` union, scope classification, gas
and feed estimates all follow from it. The registry sizes asserted in
`GipRegistry.test.ts` and `GipRegistry.test-d.ts` need updating.

Configurator actions follow the same shape with `defineConfiguratorAction` and
`ConfiguratorActionDefinition`, registered in
`configurator-actions/configuratorActionDefinitions.ts`.

### Adding an adapter

An adapter is one `defineAdapterPlugin` object: how `CREDIT::allowAdapter`
deploys it, what its state looks like, and the actions that configure it. One
with no state of its own is a handful of lines:

```ts
export const daiUsdsAdapterPlugin = defineAdapterPlugin<
  DaiUsdsAdapterDeployParams,
  DaiUsdsAdapterState
>()({
  type: "DAI_USDS_EXCHANGE",
  name: "DAI USDS Exchange",
  description: "Adapter for SKY Dai/USDS Exchange",
  getDefaultParams: () => ({ type: "DAI_USDS_EXCHANGE", version: 310, target: "0x…" }),
  isEditable: false,
  allowGas: 950_000, // gas of CREDIT::allowAdapter deploying it; got 915,913
  ...plainAdapter("DAI_USDS_EXCHANGE"),              // stateSchema, getDeployState, getStateFromSDK
  getDeployParams: (args) => adapterDeployParams(args), // extra constructor args go in a second argument
  deployParamsSchema: plainDeployParamsSchema<DaiUsdsAdapterDeployParams>("DAI_USDS_EXCHANGE"),
  resolveValidation: (args) =>
    resolveTargetTokens(args, () =>
      readAddresses(args.client, [
        getter(args.params.target, "dai"),
        getter(args.params.target, "usds"),
      ]),
    ),
  actions: {},
});
```

- `deployParamsSchema` validates the deploy params of `CREDIT::allowAdapter`;
  the deploy-params schema dispatches to it by `type`.
- `actions` holds the plugin's actions by name. Each is an ordinary
  `defineMarketAction` definition named `ADAPTER::<type>::<function>`;
  `defineAdapterPlugin` rejects any other name.
- An adapter that keeps a list (pools, pairs, vaults) exports the list node from
  its action file (`export const uniswapV3PoolsList = list(…)`), uses it in its
  `stateSchema`, and its batch action spreads
  `adapterBatch({ type, field, list, toState })`: one key identifies an item in
  merges, state updates and diffs.

Add the plugin to `builtinAdapterPlugins` in
`plugins/adapters/builtinAdapterPlugins.ts`. That is the only registration:
`AdapterType`, `AdapterDeployParams`, `AdapterState`, `adapterPlugins`, the
adapter actions and their union all follow from it. A plugin kept outside the
SDK has the same shape and is registered with `CuratorSession.create({ plugins })`
instead; see [External adapter plugins](#external-adapter-plugins).

### Adding a scope behaviour

`session/ScopedBuilder.ts` owns recording, revision caching, plan assembly and
simulation for every scope. A builder only implements `compile(intents, eta)` — what
the recorded intent resolves to — and `planFields(preview)` — which preview
fields its plan publishes, in plan order. `executionTimestamp(eta)` gives the clock
its transitions run at. Those hooks and `runtime` / `record` / `recorded` are
`protected`: they exist for the builders, not for SDK users.

### Rules

- **No runtime import cycles.** A plugin or action module never imports its
  registry (`builtinAdapterPlugins.ts`, `rateKeeperPlugins.ts`, …) at runtime.
  Shared runtime code goes into a leaf module (`updateAdapterState.ts`,
  `updateRateKeeperState.ts`, `adapterPluginHelpers.ts`).
  `importCycles.test.ts` fails the test run otherwise.
- **Calldata and projected state are pinned.** The tests use market states
  projected from every bundle of the app's strategy catalog
  (`testing/fixtures/market-states.json`) and its mF-ONE bundle
  (`testing/fixtures/mfone-bundle.json`); the catalog's own replay of every
  bundle against byte-identical calldata lives with the catalog.

### Checks

```sh
pnpm typecheck:ci  # tsc, including the tests and *.test-d.ts type tests
pnpm check         # biome
pnpm test:unit     # vitest unit project
pnpm test:e2e      # needs anvil and RPC_URL; see below
```

### Executed mainnet GIPs

[`src/e2e/tests/curator-executed-gips.test.ts`](../../src/e2e/tests/curator-executed-gips.test.ts)
assembles GIPs that were executed on mainnet, one module each in
[`src/e2e/curator/gips`](../../src/e2e/curator/gips): interest rate models and
price feeds, loss policy aliases across two markets, adapter swaps, a new
market with its credit suite, a whitelisted strategy with 35 calls
(`suite:<id>` references, Curve, Fluid, Uniswap V4 and Midas adapters), a
treasury distribution and a configurator GIP. For each, on a fork of the block
before its execution:

1. the prices the execution's multicall pushed before `executeBatch` are
   pushed first, at that block's timestamp — a call that validates a
   pull-oracle feed (`ORACLE::setReservePriceFeed`,
   `LOSS_POLICY::ALIAS::setAlias`) reverts on stale prices otherwise;
2. every built payload call must hash to the TimeLock hash that was executed,
   in the same order;
3. each scope's simulation must match its projection. Fields a projection
   cannot know before execution — the address an adapter is deployed at, the
   type and version of a registered Degen NFT — are accepted as `incomplete`
   when nothing else is missing.

Each GIP forks from its own fixture, `src/e2e/fixtures/Mainnet-<block>-rpc-cache.json`
(Git LFS), so `RPC_URL` only serves Anvil's startup reads. Recording one
needs an archive `RPC_URL` and the Foundry version pinned in `package.json`:

```sh
RPC_URL=<archive RPC> tsx dev/scripts/generate-curator-gip-fixtures.ts [id or name…]
```

The script runs each reproduction as its test does, except that it simulates
one scope per Anvil run with snapshot isolation off: Anvil drops what it
fetched after an `evm_snapshot` from its cache when it reverts, so an isolated
simulation would leave its reads out of the fixture. A GIP that does not
reproduce gets no fixture.

To add a GIP, write its module next to the others — `timelockTxHashes` and
`priceUpdates` come from the TimeLock's `ExecuteTransaction` logs and the
execution transactions — list it in `src/e2e/curator/executedGips.ts`, and
record its fixture.
