---
name: gearbox-sdk-v13-to-v14
description: >-
  Migrate a TypeScript repo that consumes @gearbox-protocol/sdk from v13 to v14
  (covers both stable 14.x.x and 14.x.x-next.x pre-releases). Focuses on the
  GearboxSDK -> OnchainSDK rename, the new two-step attach/hydrate lifecycle,
  MultichainSDK, and the removal of reattach/rehydrate/hooks. Use when the
  user asks to upgrade @gearbox-protocol/sdk to v14, bump to ^14.0.0, or fix
  breakage after the v14 bump.
---

# Gearbox SDK v13 → v14 Migration

Migrate a consumer repo that depends on `@gearbox-protocol/sdk@^13.x` to
`@gearbox-protocol/sdk@^14.x`. This skill only covers the high-impact,
consumer-visible API changes: the rename, the new lifecycle, and the
removal of `reattach` / `rehydrate` / hooks. See the upstream
[`MIGRATION.md`](https://github.com/Gearbox-protocol/sdk/blob/master/MIGRATION.md)
for the authoritative reference.

## 1. Pre-flight

1. Confirm the consumer is on `@gearbox-protocol/sdk@^13.x`:
   - Check `package.json` `dependencies` / `devDependencies`.
   - Cross-check the lockfile (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`).
2. Capture a typecheck baseline so post-migration errors are easy to diff
   against. Use whatever script the repo has (`tsc --noEmit`, `pnpm typecheck`,
   `npm run typecheck`, etc.). Save the output.
3. Search the codebase for the symbols this migration touches:
   - `GearboxSDK`, `IGearboxSDKPlugin`, `IGearboxSDKPluginConstructor`
   - `.reattach(`, `.rehydrate(`, `.addHook(`, `.removeHook(`
   - `sdk.syncState(` inside `watchBlock` / `onBlock` callbacks

This gives you a complete picture of what needs changing before touching any
files.

## 2. Bump the dependency

Edit `package.json` to one of the following. Use whichever channel the user is
tracking.

- **Stable**: `"@gearbox-protocol/sdk": "^14.0.0"`
- **Prerelease (`next` channel)**: pin an exact tag, e.g. `"@gearbox-protocol/sdk": "14.1.0-next.1"`. Ask the user which tag they want if unclear — `^14.x.x-next.x` ranges don't behave the way you'd expect with semver.

Reinstall with the project's existing package manager (`npm install`, `yarn`,
or `pnpm install`). **Do not switch package managers** as part of this
migration.

## 3. Rename `GearboxSDK` → `OnchainSDK`

In every file that imports from `@gearbox-protocol/sdk`:

```diff
- import { GearboxSDK } from "@gearbox-protocol/sdk";
+ import { OnchainSDK } from "@gearbox-protocol/sdk";
```

Update every type reference:

- `GearboxSDK` → `OnchainSDK`
- `GearboxSDK<Plugins>` → `OnchainSDK<Plugins>`
- `IGearboxSDKPlugin` → `IOnchainSDKPlugin`
- `IGearboxSDKPluginConstructor` → `IOnchainSDKPluginConstructor`

Don't forget string-based comments / docstrings that reference the old name —
they are not compile errors but they are stale.

## 4. Refactor attach/hydrate call sites

The static, single-arg `GearboxSDK.attach({...})` / `GearboxSDK.hydrate(state, {...})`
are gone. Replace them with a two-step construct-then-attach/hydrate pattern.

### 4a. `attach`

**Before:**

```ts
const sdk = await GearboxSDK.attach({
  rpcURLs: [RPC_URL],
  timeout: 480_000,
  logger,
  blockNumber,
  plugins,
  redstone,
  pyth,
  ignoreMarkets,
  ignoreUpdateablePrices,
  strictContractTypes,
  gasLimit,
});
```

**After:**

```ts
const sdk = new OnchainSDK(
  "Mainnet", // <-- required NetworkType, e.g. "Mainnet" | "Arbitrum" | "Optimism" | ...
  { rpcURLs: [RPC_URL], timeout: 480_000 },               // ClientOptions
  { logger, plugins, strictContractTypes, gasLimit },     // OnchainSDKOptions
);
await sdk.attach({
  blockNumber,
  redstone,
  pyth,
  ignoreMarkets,
  ignoreUpdateablePrices,
  // also accepted here: addressProvider, marketConfigurators
});
```

Rules of thumb for splitting the old single options bag:

| Old field                                           | New location                                    |
| --------------------------------------------------- | ----------------------------------------------- |
| `rpcURLs`, `timeout`, `retryCount`, `httpTransportOptions`, `transport`, `client` | 2nd arg (`ClientOptions`) |
| `logger`, `plugins`, `strictContractTypes`, `gasLimit` | 3rd arg (`OnchainSDKOptions`) |
| `blockNumber`, `addressProvider`, `marketConfigurators`, `ignoreMarkets`, `ignoreUpdateablePrices`, `redstone`, `pyth` | `AttachOptions` passed to `sdk.attach(...)` |

**Key behavioural changes to call out to the user:**

- **`network` is a required positional argument.** v13 could sniff it from
  the RPC; v14 cannot. If the consumer supported multiple networks dynamically,
  the network must now be resolved upfront (or use `MultichainSDK`, see 4c).
- The `OnchainSDK` constructor is **synchronous**; `attach()` is async.

### 4b. `hydrate`

**Before:**

```ts
const sdk = await GearboxSDK.hydrate(savedState, {
  rpcURLs: [RPC_URL],
  logger,
});
```

**After:**

```ts
const sdk = new OnchainSDK(
  "Mainnet",
  { rpcURLs: [RPC_URL] },
  { logger },
);
sdk.hydrate(savedState, { redstone, pyth, ignoreMarkets }); // synchronous
```

`hydrate` is now **synchronous** — drop any `await` on it.

### 4c. Multi-chain consumers

If the consumer juggled multiple `GearboxSDK` instances (one per chain), point
the user at `MultichainSDK` as the idiomatic replacement. Don't auto-rewrite;
propose the migration and let them decide. Refer them to the upstream
[`MIGRATION.md`](https://github.com/Gearbox-protocol/sdk/blob/master/MIGRATION.md)
for the full `MultichainSDK` API.

## 5. `reattach` / `rehydrate` / hooks (advisory — ask before rewriting)

`sdk.reattach()`, `sdk.rehydrate()`, `sdk.addHook()`, and `sdk.removeHook()`
are all removed in v14. There is no mechanical one-to-one replacement — what
to do depends on the consumer's intent. **Surface these call sites to the
user and propose a fix; don't rewrite them blindly.**

### 5a. `reattach` / `rehydrate`

Two reasonable replacements — propose both and let the user pick:

1. **Drop entirely.** If the surrounding code no longer needs re-initialisation,
   remove the call and the logic around it.
2. **Recreate the SDK.** Construct a fresh `OnchainSDK` and call `attach()`
   (or `hydrate()`) on the new instance. Swap the old reference.

### 5b. `addHook('syncState', fn)` + viem `watchBlock`

A very common pattern in v13 was:

```ts
const unwatch = client.watchBlocks({
  onBlock: async block => {
    await sdk.syncState({
      blockNumber: block.number,
      timestamp: block.timestamp,
    });
  },
});
sdk.addHook("syncState", async () => {
  await myPostSyncLogic(sdk);
});
```

In v14, replace both pieces with the new `watchBlocksAsync` helper (exported
from the package root) and call the former hook body **inline after
`sdk.syncState()` returns `true`**:

```ts
import { watchBlocksAsync } from "@gearbox-protocol/sdk";

const unwatch = watchBlocksAsync(client, {
  onBlock: async block => {
    const ok = await sdk.syncState({
      blockNumber: block.number,
      timestamp: block.timestamp,
    });
    if (ok) {
      await myPostSyncLogic(sdk);
    }
  },
  onDrop: block => {
    /* optional */
  },
  onError: err => {
    /* optional */
  },
});
```

`watchBlocksAsync` acts as a mutex around `onBlock`, so overlapping blocks
won't trample each other. Always gate post-sync logic on `syncState()`
returning `true` — `false` means the sync was skipped or failed.

If the hook handler was more elaborate (multiple hook types, conditional
registration, cross-module events), surface the full list to the user and
propose an approach rather than force-fitting `watchBlocksAsync`.

## 6. Verify

Run the consumer's standard checks and report results to the user:

- Typecheck (`tsc --noEmit` / `pnpm typecheck` / `npm run typecheck`).
- Lint.
- Tests.
- Build, if the project has one.

Diff the typecheck output against the baseline captured in step 1. If new
errors exist, cross-reference against the quick-reference below.

## Quick reference (old → new)

| v13                                            | v14                                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| `GearboxSDK`                                   | `OnchainSDK`                                                        |
| `IGearboxSDKPlugin` / `IGearboxSDKPluginConstructor` | `IOnchainSDKPlugin` / `IOnchainSDKPluginConstructor`          |
| `await GearboxSDK.attach({...})`               | `new OnchainSDK(net, client, opts); await sdk.attach({...})`        |
| `await GearboxSDK.hydrate(state, {...})`       | `new OnchainSDK(net, client, opts); sdk.hydrate(state, {...})` (sync) |
| `sdk.reattach()` / `sdk.rehydrate(state)`      | Construct a new `OnchainSDK` and `attach()` / `hydrate()` it        |
| `sdk.addHook('syncState', fn)` + viem `watchBlock` | `watchBlocksAsync` + inline post-`syncState` call (gated on `true`) |

## Upstream references

- [`MIGRATION.md`](https://github.com/Gearbox-protocol/sdk/blob/master/MIGRATION.md)
- [`OnchainSDK` source](https://github.com/Gearbox-protocol/sdk/blob/master/src/sdk/OnchainSDK.ts)
- [`MultichainSDK` source](https://github.com/Gearbox-protocol/sdk/blob/master/src/sdk/MultichainSDK.ts)
- [`watchBlocksAsync` source](https://github.com/Gearbox-protocol/sdk/blob/master/src/sdk/utils/viem/watchBlocksAsync.ts)
