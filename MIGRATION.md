# SDK Migration Guide

Migration notes between consecutive major versions of `@gearbox-protocol/sdk`.
New sections are appended below as future majors ship.

## v14 → v15

### Summary of changes

- **`sdk.accounts` and `sdk.pools` are now built for you.** `OnchainSDK` instantiates a `CreditAccountsServiceV310` and a `PoolService` in its constructor and exposes them as `sdk.accounts` (`ICreditAccountsService`) and `sdk.pools` (`IPoolsService`). You no longer create these services manually.
---

### Use `sdk.accounts` instead of `createCreditAccountService`

**Before:**

```typescript
import { createCreditAccountService } from "@gearbox-protocol/sdk";

const accounts = createCreditAccountService(sdk, 310);
const data = await accounts.getCreditAccountData(account);
```

**After:**

```typescript
const data = await sdk.accounts.getCreditAccountData(account);
```

### Use `sdk.pools` instead of `new PoolService(sdk)`

**Before:**

```typescript
import { PoolService } from "@gearbox-protocol/sdk";

const pools = new PoolService(sdk);
pools.getDepositTokensIn(pool);
```

**After:**

```typescript
sdk.pools.getDepositTokensIn(pool);
```

### Automated migration

An agent skill ships with this repo at
[`skills/gearbox-sdk-v14-to-v15`](skills/gearbox-sdk-v14-to-v15/SKILL.md).

```bash
npx skills add Gearbox-protocol/sdk --skill gearbox-sdk-v14-to-v15
```

---

## v13 → v14

### Summary of changes

- **`OnchainSDK`** — renamed from `GearboxSDK`, single-chain entry point
- **Instantiation is now two steps**: `new OnchainSDK(network, clientOptions, options)` then `await sdk.attach()` or `sdk.hydrate(state)`
- **Network is explicit**: you pass a `NetworkType` string (e.g. `"Mainnet"`) to the constructor instead of relying on auto-detection
- **`blockNumber`, `addressProvider`, `marketConfigurators`** moved out of constructor options into `AttachOptions`
- **`reattach()` / `rehydrate()`** — dropped entirely (create a new instance instead)
- **hooks** dropped from OnchainSDK
- **`MultichainSDK`** — new class wrapping multiple `OnchainSDK` instances (one per chain)

---


### Imports

```diff
- import { GearboxSDK } from "@gearbox-protocol/sdk";
+ import { OnchainSDK } from "@gearbox-protocol/sdk";
```

### Creating and attaching the SDK

**Before:**

```typescript
const sdk = await GearboxSDK.attach({
  rpcURLs: [RPC_URL],
  timeout: 480_000,
  logger,
  blockNumber: 24736900,
  plugins: {
    adapters: new AdaptersPlugin(),
    bots: new BotsPlugin(),
  },
});
```

**After:**

```typescript
const sdk = new OnchainSDK(
  "Mainnet",                                    // explicit network
  { rpcURLs: [RPC_URL], timeout: 480_000 },     // client options
  {                                              // SDK options
    logger,
    plugins: {
      adapters: new AdaptersPlugin(),
      bots: new BotsPlugin(),
    },
  },
);
await sdk.attach({ blockNumber: 24736900 });    // attach options
```

Key differences:
- Network type (`"Mainnet"`, `"Arbitrum"`, etc.) is now a **required** constructor argument
- Client connection config and SDK options are separate arguments
- `blockNumber`, `addressProvider`, `marketConfigurators` move to `attach()`
- Constructor is sync; `attach()` is async

### Hydrating from saved state

**Before:**

```typescript
const sdk = await GearboxSDK.hydrate(savedState, {
  rpcURLs: [RPC_URL],
  logger,
});
```

**After:**

```typescript
const sdk = new OnchainSDK(
  "Mainnet",
  { rpcURLs: [RPC_URL] },
  { logger },
);
sdk.hydrate(savedState, { redstone, pyth }); // synchronous
```

### Removed methods

| Old | Replacement |
|---|---|
| `sdk.reattach(...)`  | Create a new `OnchainSDK` instance |
| `sdk.rehydrate(...)` | Create a new `OnchainSDK` instance |

### Removed hooks

Instead of `sdk.addHook('syncState', handler)` await sync and run your code:

```
const success = await sdk.syncState()
if (success) {
  await myFn(sdk.currentBlock);
}
```

If you need to subscribe to block changes there's now new async helper that acts as mutex for onBlock callback
```
const unwatch = watchBlocksAsync(client, {
  onBlock: async (block, prevBlock) => {
    console.log("new block", block.number);
  },
  onDrop: (block) => {
    console.log("dropped block", block.number);
  },
  onError: (err) => {
    console.error(err);
  },
});
```


### Automated migration

An agent skill ships with this repo at
[`skills/gearbox-sdk-v13-to-v14`](skills/gearbox-sdk-v13-to-v14/SKILL.md). 

```bash
npx skills add Gearbox-protocol/sdk --skill gearbox-sdk-v13-to-v14
```
