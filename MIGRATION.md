# SDK Migration Guide

Migration notes between consecutive versions of `@gearbox-protocol/sdk` that
introduce consumer-visible breaking changes. New sections are appended below
as future releases ship.

## v16.x — wallet-wide Merkl rewards

`getMerklRewards` is gone. Rewards are read for the whole wallet at once, and
the read reports what happened on each chain.

### Summary of changes

- **`getMerklRewards`, `GetMerklRewardsProps` and its `reportError` callback removed.** Use `getMerklRewardsMultichain`, which fans out over the chains a `MultichainSDK` carries and answers the read model's `DataResponse` envelope.
- **A chain that could not be reached is now distinguishable from one with nothing to claim.** The old call resolved an empty list either way and only whispered the difference through `reportError`; the new one reports `status: "error"` in `meta.chains` for the first and `status: "success"` with no rows for the second.
- **The Merkl transport no longer uses `axios`.** It is `fetch`, with a per-attempt timeout (10 s by default, `timeout` to change it) and a fallback to the Angle mirror on a non-2xx as well as on a transport failure.

---

### Read every chain at once instead of fanning out yourself

**Before:**

```typescript
import { getMerklRewards, type MerklReward } from "@gearbox-protocol/sdk/rewards";

const rewards: MerklReward[] = [];
for (const chain of multichainSDK.chains.values()) {
  rewards.push(
    ...(await getMerklRewards({
      sdk: chain,
      account: wallet,
      apiKey,
      // the only way to learn a chain was down: it resolves `[]` regardless
      reportError: error => report(chain.chainId, error),
    })),
  );
}
```

**After:**

```typescript
import { getMerklRewardsMultichain } from "@gearbox-protocol/sdk/rewards";

const { data, meta } = await getMerklRewardsMultichain({
  sdk: multichainSDK,
  wallet,
  apiKey,
});

for (const chain of meta.chains) {
  if (chain.status === "error") report(chain.chainId, chain.error);
}
```

`chainIds` narrows the fan-out to a subset; omit it to ask every chain the
handle carries. An id the handle has no chain for is dropped rather than
reported — absence from `meta.chains` means the chain was never asked.

---

## v14.x → v14.10

> Despite being a minor bump, `v14.10.0` introduced consumer-visible breaking
> changes. A short-lived `v15.0.0-next.{1,2,3}` prerelease line carried the
> same changes but was never released as stable — `^14.10.0` is the supported
> upgrade target.

### Summary of changes

- **`sdk.accounts` and `sdk.pools` are now built for you.** `OnchainSDK` instantiates a `CreditAccountsServiceV310` and a `PoolService` in its constructor and exposes them as `sdk.accounts` (`ICreditAccountsService`) and `sdk.pools` (`IPoolsService`). You no longer create these services manually.
- **`createCreditAccountService` factory removed.** Use `sdk.accounts` directly.
- **`AbstractCreditAccountService` removed.** Its functionality was merged into `CreditAccountsServiceV310`.
- **`CreditAccountServiceV310` renamed to `CreditAccountsServiceV310`** (note the plural `Accounts`).

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

### Rename `CreditAccountServiceV310` → `CreditAccountsServiceV310`

```diff
- import { CreditAccountServiceV310 } from "@gearbox-protocol/sdk";
+ import { CreditAccountsServiceV310 } from "@gearbox-protocol/sdk";
```

### Automated migration

An agent skill ships with this repo at
[`skills/gearbox-sdk-v14.x-to-v14.10`](skills/gearbox-sdk-v14.x-to-v14.10/SKILL.md).

```bash
npx skills add Gearbox-protocol/sdk --skill gearbox-sdk-v14.x-to-v14.10
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
