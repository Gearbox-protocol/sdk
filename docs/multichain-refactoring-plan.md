# Refactoring Plan: OnchainSDK + MultichainSDK

## Overview

Current `GearboxSDK` becomes `OnchainSDK` (single-chain only). Static `attach`/`hydrate` factory methods are removed — instances are created via constructor, then `attach()` or `hydrate()` is called on the instance. A new `MultichainSDK` is added as a thin wrapper around a collection of `OnchainSDK` instances.

This is a clean semver-major break. No backward-compat aliases.

## Phase 1: Errors & Foundation

### 1.1 Create SDK error classes

New file `src/sdk/core/errors.ts`. All errors extend viem's `BaseError`:

- `SdkNotAttachedError` — accessing state before `attach`/`hydrate`
- `SdkAlreadyAttachedError` — calling `attach()` twice
- `SdkStateVersionMismatchError` — hydration version mismatch
- `SdkChainMismatchError` — client chainId doesn't match `NetworkType`
- `SdkDuplicateChainError` — same `NetworkType` passed twice to `MultichainSDK`
- `SdkMissingChainStateError` — hydration state missing a configured chain
- `SdkSyncFailedError` — `syncState` failure (wraps per-chain errors)

Replace `ERR_NOT_ATTACHED`, inline `new Error(...)` calls, and `PluginStateVersionError` with these.

## Phase 2: OnchainSDK (rename + restructure)

### 2.1 Rename `GearboxSDK` → `OnchainSDK`

- Rename class, file (`OnchainSDK.ts`), and all internal references (`SDKConstruct`, `BasePlugin`, `IGearboxSDKPlugin`, etc.)
- Update barrel exports in `src/sdk/index.ts`

### 2.2 Redesign constructor (public)

```typescript
constructor(network: NetworkType, clientOptions: ClientOptions, options?: OnchainSDKOptions<Plugins>)
```

Where:

```typescript
interface OnchainSDKOptions<Plugins extends PluginsMap> {
  logger?: ILogger;
  strictContractTypes?: boolean;
  gasLimit?: bigint | null;
  plugins?: Plugins;
}
```

Constructor logic (all synchronous):

1. Resolve `GearboxChain` from `network` via `getChain(network)`
2. If `client` variant — validate `client.chain.id === gearboxChain.id`, throw `SdkChainMismatchError` if not
3. If `rpcURLs`/`transport` variant — create client pinned to `{ networkType, chainId: gearboxChain.id }`
4. Call `super(client, logger)` (inherits `ChainContractsRegister`)
5. Set `plugins`, call `plugin.sdk = this` for each
6. Set `gasLimit`, `strictContractTypes`

`detectNetwork` is removed from the hot path (kept in `src/sdk/chain/` utils).

### 2.3 Instance `attach()` method

```typescript
public async attach(options?: AttachOptions): Promise<void>
```

```typescript
interface AttachOptions {
  addressProvider?: Address;
  marketConfigurators?: Address[];
  blockNumber?: bigint | number;
  ignoreUpdateablePrices?: boolean;
  ignoreMarkets?: Address[];
  redstone?: RedstoneOptions;
  pyth?: PythOptions;
}
```

- Throws `SdkAlreadyAttachedError` if already attached
- Body is the current `#attach` logic (get block, create address provider, load markets, attach plugins)
- Returns `void` (not `this`)

### 2.4 Instance `hydrate()` method

```typescript
public hydrate(state: GearboxState<Plugins>, options?: HydrateOptions): void
```

```typescript
interface HydrateOptions {
  ignoreMarkets?: Address[];
  redstone?: RedstoneOptions;
  pyth?: PythOptions;
}
```

- Throws `SdkAlreadyAttachedError` if already attached
- Throws `SdkStateVersionMismatchError` if `state.version !== STATE_VERSION`
- Validates `state.network === this.networkType`, throws `SdkChainMismatchError` if not
- Body is the current `#hydrate` logic

### 2.5 Remove `reattach()` and `rehydrate()`

Drop both methods entirely.

### 2.6 Keep everything else on OnchainSDK

`syncState`, `state`, `stateHuman`, `routerFor`, `currentBlock`, `timestamp`, `addressProvider`, `marketRegister`, `priceFeeds`, `gear`, hooks (`addHook`/`removeHook`) — all stay. Property accessors throw `SdkNotAttachedError` instead of generic `ERR_NOT_ATTACHED`.

### 2.7 State types

`GearboxState<Plugins>` keeps its name (it's a serialization format, not tied to the class name). Unchanged structurally.

## Phase 3: MultichainSDK

### 3.1 New file `src/sdk/MultichainSDK.ts`

```typescript
export class MultichainSDK<const Plugins extends PluginsMap = {}>
```

### 3.2 Constructor

```typescript
interface ChainConfig {
  // ClientOptions (rpcURLs | transport | client)
  // Per-chain overrides
  logger?: ILogger;
  strictContractTypes?: boolean;
  gasLimit?: bigint | null;
}

interface MultichainSDKOptions<Plugins extends PluginsMap> {
  chains: Partial<Record<NetworkType, ChainConfig & ClientOptions>>;
  plugins?: { [K in keyof Plugins]: () => Plugins[K] };  // factories
  // Shared defaults
  logger?: ILogger;
  strictContractTypes?: boolean;
  gasLimit?: bigint | null;
}
```

Constructor logic:

1. Validate no duplicate networks (`Partial<Record<NetworkType, ...>>` prevents this at type level; runtime check for safety → `SdkDuplicateChainError`)
2. For each chain config, call plugin factories, then instantiate `new OnchainSDK(network, clientOptions, { ...chainConfig, plugins })`
3. Store in `Map<NetworkType, OnchainSDK<Plugins>>`

### 3.3 `attach()`

```typescript
public async attach(
  options?: Partial<Record<NetworkType, AttachOptions>>
): Promise<void>
```

- Calls `onchainSdk.attach(chainOpts)` for all chains in parallel via `Promise.all`
- Per-chain options are optional; defaults apply if omitted
- Easy to refactor to sequential (swap `Promise.all` → `for...of`)

### 3.4 `hydrate()`

```typescript
public hydrate(
  state: MultichainState<Plugins>,
  options?: Partial<Record<NetworkType, HydrateOptions>>
): void
```

```typescript
interface MultichainState<Plugins extends PluginsMap = {}> {
  version: number;
  chains: GearboxState<Plugins>[];
}
```

- Validates `state.version`
- For each configured chain, finds matching `GearboxState` by `network` field
- Throws `SdkMissingChainStateError` if a configured chain has no state entry
- Silently ignores extra chains in state not configured in the constructor
- Calls `onchainSdk.hydrate(chainState, chainOpts)` for each

### 3.5 `chain()` accessor

```typescript
public chain(network: NetworkType): OnchainSDK<Plugins>
```

Throws if network not configured. Primary escape hatch for chain-specific operations (`routerFor`, `currentBlock`, `marketRegister`, etc.).

### 3.6 `chains` getter

```typescript
public get chains(): ReadonlyMap<NetworkType, OnchainSDK<Plugins>>
```

### 3.7 `syncState()`

```typescript
interface MultichainSyncStateOptions {
  ignoreUpdateablePrices?: boolean;
}

public async syncState(opts?: MultichainSyncStateOptions): Promise<void>
```

- For each chain: fetch latest block, then call `onchainSdk.syncState({ blockNumber, timestamp, ignoreUpdateablePrices })`
- All chains in parallel
- If any chain fails, throw `SdkSyncFailedError` wrapping per-chain errors

### 3.8 `state` getter

```typescript
public get state(): MultichainState<Plugins> {
  return {
    version: STATE_VERSION,
    chains: [...this.#chains.values()].map(sdk => sdk.state),
  };
}
```

### 3.9 `stateHuman()`

```typescript
interface MultichainStateHuman {
  version: number;
  chains: GearboxStateHuman[];
}

public stateHuman(raw?: boolean): MultichainStateHuman
```

### 3.10 No hooks on MultichainSDK

Per-chain hooks remain on `OnchainSDK`, accessible via `multiSdk.chain("Mainnet").addHook(...)`.

### 3.11 Shared `PriceUpdatesCache`

Oracle data from Redstone/Pyth is chain-agnostic — the same payload for a given data feed works on any network. `MultichainSDK` creates shared `PriceUpdatesCache` instances and injects them into each chain's updaters to avoid redundant fetches.

`PriceUpdatesCache` itself is unchanged. `RedstoneOptions` and `PythOptions` each gain an optional `cache` field:

```typescript
// in RedstoneOptions / PythOptions zod schemas — not validated by zod, just a plain TS field
cache?: PriceUpdatesCache;
```

Updater constructors use the injected cache or fall back to creating their own:

```typescript
// in PythUpdater / RedstoneUpdater constructor
this.#cache = opts.cache ?? new PriceUpdatesCache({ ttl: ..., historical: ... });
```

`MultichainSDK` wiring (in `attach()` / `hydrate()`):

```typescript
// MultichainSDK creates shared caches once
#redstoneCache?: PriceUpdatesCache;
#pythCache?: PriceUpdatesCache;

public async attach(options?: MultichainAttachOptions): Promise<void> {
  // Create shared caches from the top-level redstone/pyth options
  if (options?.redstone) {
    this.#redstoneCache = new PriceUpdatesCache({
      ttl: options.redstone.cacheTTL ?? 225_000,
      historical: !!options.redstone.historicTimestamp,
    });
  }
  if (options?.pyth) {
    this.#pythCache = new PriceUpdatesCache({
      ttl: options.pyth.cacheTTL ?? 225_000,
      historical: !!options.pyth.historicTimestamp,
    });
  }
  // Each chain gets the shared cache injected
  await Promise.all(
    [...this.#chains.entries()].map(([network, sdk]) =>
      sdk.attach({
        ...perChainOpts[network],
        redstone: { ...options?.redstone, cache: this.#redstoneCache },
        pyth: { ...options?.pyth, cache: this.#pythCache },
      }),
    ),
  );
}
```

Single-chain `OnchainSDK` is unaffected — when no cache is injected, updaters create their own internally as before.

## Phase 4: Plugin System Updates

### 4.1 Update `IGearboxSDKPlugin` interface

Rename `sdk` field type from `GearboxSDK<any>` to `OnchainSDK<any>`. Same for `IGearboxSDKPluginConstructor`.

### 4.2 Update `BasePlugin`

- `#sdk` type → `OnchainSDK<any>`
- Setter throws `SdkAlreadyAttachedError` instead of generic error
- Getter throws `SdkNotAttachedError` instead of generic error

### 4.3 Plugin factory type

```typescript
type PluginFactory<P extends IGearboxSDKPlugin> = () => P;

type PluginFactoriesMap<Plugins extends PluginsMap> = {
  [K in keyof Plugins]: PluginFactory<Plugins[K]>;
};
```

Used only by `MultichainSDK`. `OnchainSDK` keeps accepting instances directly.

## Phase 5: Type Updates & Internal Plumbing

### 5.1 `SDKConstruct`

`sdk` field type `GearboxSDK<Plugins>` → `OnchainSDK<Plugins>`. Same for all internal classes (`MarketRegister`, `PriceFeedRegister`, `AbstractRouterContract`, `createRouter`, `createAddressProvider`, `createCreditAccountService`, etc.).

### 5.2 Update `SDKOptions` zod schema

In `src/sdk/options.ts` — remove `blockNumber`, `addressProvider`, `marketConfigurators` from constructor options (these move to `AttachOptions`). Split into `OnchainSDKOptions` schema and `AttachOptions` schema.

### 5.3 State types

Add `MultichainState` and `MultichainStateHuman` to `src/sdk/types/state.ts` and `state-human.ts`.

### 5.4 Barrel exports

`src/sdk/index.ts` exports `OnchainSDK`, `MultichainSDK`, new error classes, new option/state types.

## Phase 6: Update Consumers

### 6.1 Scripts

`scripts/example.ts`, `scripts/generate-e2e-fixtures.ts` — update from `GearboxSDK.attach(...)` to `new OnchainSDK(...); await sdk.attach(...)`.

### 6.2 E2E tests

Same pattern update.

### 6.3 `src/permissionless/`

Update SDK references.

### 6.4 `src/dev/`

Update SDK references.

## Migration Examples

### Before

```typescript
const sdk = await GearboxSDK.attach({
  rpcURLs: [RPC],
  timeout: 480_000,
  logger,
  plugins: {
    adapters: new AdaptersPlugin(),
    bots: new BotsPlugin(),
  },
});
```

### After (single chain)

```typescript
const sdk = new OnchainSDK(
  "Mainnet",
  { rpcURLs: [RPC], timeout: 480_000 },
  {
    logger,
    plugins: {
      adapters: new AdaptersPlugin(),
      bots: new BotsPlugin(),
    },
  },
);
await sdk.attach({ blockNumber: 24736900 });
```

### After (multichain)

```typescript
const sdk = new MultichainSDK({
  chains: {
    Mainnet: { rpcURLs: [MAINNET_RPC] },
    Arbitrum: { rpcURLs: [ARB_RPC] },
  },
  plugins: {
    adapters: () => new AdaptersPlugin(),
    bots: () => new BotsPlugin(),
  },
  logger,
});
await sdk.attach();

const mainnet = sdk.chain("Mainnet");
mainnet.marketRegister.findCreditManager(addr);
```
