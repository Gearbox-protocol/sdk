---
name: gearbox-sdk-v14.x-to-v14.10
description: >-
  Migrate a TypeScript repo that consumes @gearbox-protocol/sdk from an early
  v14 minor (v14.0.x – v14.9.x) up to v14.10.0 or later (covers stable
  14.10.x and 14.10.x-next.x pre-releases). Focuses on the new
  sdk.accounts / sdk.pools namespaces, removal of createCreditAccountService,
  removal of AbstractCreditAccountService, and the CreditAccountServiceV310 ->
  CreditAccountsServiceV310 rename. Use when the user asks to upgrade
  @gearbox-protocol/sdk to v14.10, bump to ^14.10.0, or fix breakage after the
  v14.10 bump.
---

# Gearbox SDK v14.x → v14.10 Migration

Migrate a consumer repo that depends on `@gearbox-protocol/sdk@^14.x` (any minor
older than `14.10`) to `@gearbox-protocol/sdk@^14.10.x`. Despite landing in a
minor bump, `v14.10.0` shipped a handful of consumer-visible breaking changes:
`sdk.accounts` / `sdk.pools` are now built by the SDK, the
`createCreditAccountService` factory is gone, `AbstractCreditAccountService` is
gone, and `CreditAccountServiceV310` is renamed to `CreditAccountsServiceV310`.
See the upstream
[`MIGRATION.md`](https://github.com/Gearbox-protocol/sdk/blob/master/MIGRATION.md)
for the authoritative reference.

If the consumer is still on v13, run the `gearbox-sdk-v13-to-v14` skill first,
then this one.

## 1. Pre-flight

1. Confirm the consumer is on `@gearbox-protocol/sdk@^14.x` **older than
   `14.10`**:
   - Check `package.json` `dependencies` / `devDependencies`.
   - Cross-check the lockfile (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml`).
   - If the installed version is already `>=14.10.0`, this skill is a no-op —
     report that and stop.
2. Capture a typecheck baseline so post-migration errors are easy to diff
   against. Use whatever script the repo has (`tsc --noEmit`, `pnpm typecheck`,
   `npm run typecheck`, etc.). Save the output.
3. Search the codebase for the symbols this migration touches:
   - `createCreditAccountService` (imports and call sites)
   - `CreditAccountServiceV310` (singular — the old class name)
   - `AbstractCreditAccountService` (extremely rare)
   - `new PoolService(` (direct instantiations)

This gives you a complete picture of what needs changing before touching any
files.

## 2. Bump the dependency

Edit `package.json` to one of the following. Use whichever channel the user is
tracking.

- **Stable**: `"@gearbox-protocol/sdk": "^14.10.0"`
- **Prerelease (`next` channel)**: pin an exact tag, e.g.
  `"@gearbox-protocol/sdk": "14.10.3-next.2"`. Ask the user which tag they want
  if unclear — `^14.10.x-next.x` ranges don't behave the way you'd expect with
  semver.

Reinstall with the project's existing package manager (`npm install`, `yarn`,
or `pnpm install`). **Do not switch package managers** as part of this
migration.

## 3. Replace `createCreditAccountService` with `sdk.accounts`

In v14.10, every `OnchainSDK` already owns a `CreditAccountsServiceV310`
instance at `sdk.accounts` (type `ICreditAccountsService`). The factory is
gone.

**Before:**

```ts
import { createCreditAccountService } from "@gearbox-protocol/sdk";

const accounts = createCreditAccountService(sdk, 310);
const data = await accounts.getCreditAccountData(account);
```

**After:**

```ts
const data = await sdk.accounts.getCreditAccountData(account);
```

Remove the `createCreditAccountService` import. The `ICreditAccountsService`
interface itself is unchanged — every method that used to be on the factory's
return value is available on `sdk.accounts`.

## 4. Replace `new PoolService(sdk)` with `sdk.pools`

Every `OnchainSDK` also owns a `PoolService` at `sdk.pools` (type
`IPoolsService`).

**Before:**

```ts
import { PoolService } from "@gearbox-protocol/sdk";

const pools = new PoolService(sdk);
const tokens = pools.getDepositTokensIn(pool);
```

**After:**

```ts
const tokens = sdk.pools.getDepositTokensIn(pool);
```

Remove the `PoolService` import if nothing else uses it. If the consumer was
constructing a `PoolService` against a `sdk` field on a wrapper object
(e.g. `new PoolService(service.sdk)`), rewrite it as `service.sdk.pools`.

## 5. Renames: `CreditAccountServiceV310` → `CreditAccountsServiceV310`

The class was renamed for consistency with the `sdk.accounts` namespace. Note
the plural `Accounts`.

```diff
- import { CreditAccountServiceV310 } from "@gearbox-protocol/sdk";
+ import { CreditAccountsServiceV310 } from "@gearbox-protocol/sdk";
```

Apply the same rename to every type annotation, `extends` clause, and
`instanceof` check.

Most consumers should **not** need to reference this class directly anymore —
prefer the `ICreditAccountsService` interface (unchanged) or just use
`sdk.accounts`. Only keep a direct import if you genuinely need the concrete
class (e.g. to construct a standalone instance for a test or a non-SDK code
path).

## 6. `AbstractCreditAccountService` is removed

The abstract base class was merged into `CreditAccountsServiceV310`. Consumers
extending it are extremely rare, but if you find one:

- Replace `extends AbstractCreditAccountService` with
  `extends CreditAccountsServiceV310` (or, better, implement
  `ICreditAccountsService` from scratch and delegate to `sdk.accounts`).
- Surface the change to the user before rewriting — extending internal SDK
  classes is fragile and usually indicates the consumer wants a decorator or
  a wrapper instead.

Remove any imports of `AbstractCreditAccountService` — they will fail to
resolve in v14.10.

## 7. Verify

Run the consumer's standard checks and report results to the user:

- Typecheck (`tsc --noEmit` / `pnpm typecheck` / `npm run typecheck`).
- Lint.
- Tests.
- Build, if the project has one.

Diff the typecheck output against the baseline captured in step 1. If new
errors exist, cross-reference against the quick-reference below.

## Quick reference (old → new)

| Pre-14.10                                             | v14.10+                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `createCreditAccountService(sdk, 310)`                | `sdk.accounts`                                                      |
| `createCreditAccountService(sdk, 310, { batchSize })` | `sdk.accounts` + `sdk.accounts.setBatchSize(n)`                     |
| `new PoolService(sdk)`                                | `sdk.pools`                                                         |
| `CreditAccountServiceV310`                            | `CreditAccountsServiceV310` (plural)                                |
| `AbstractCreditAccountService`                        | Removed — extend `CreditAccountsServiceV310` or wrap `sdk.accounts` |

## Upstream references

- [`MIGRATION.md`](https://github.com/Gearbox-protocol/sdk/blob/master/MIGRATION.md)
- [`OnchainSDK` source](https://github.com/Gearbox-protocol/sdk/blob/master/src/sdk/OnchainSDK.ts)
- [`CreditAccountsServiceV310` source](https://github.com/Gearbox-protocol/sdk/blob/master/src/sdk/accounts/CreditAccountsServiceV310.ts)
- [`PoolService` source](https://github.com/Gearbox-protocol/sdk/blob/master/src/sdk/pools/PoolService.ts)
