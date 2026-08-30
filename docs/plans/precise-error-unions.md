# Per-method error unions in sdk

Status: SPEC_DRAFT
Spec lock: unlocked
Implementation lock: unlocked
Active Delivery: none
Unattended decisions: allowed

<!-- plan:spec:start -->
# Goal

One error system for the whole sdk. A new result catalog defines the single
envelope every refusable function answers with:

```ts
export interface SDKResult<T> { ok: true; data: T }
export interface SDKError<E extends IGearboxError = IGearboxError> {
  ok: false;
  error: E;
}
export type SDKReturn<T, E extends IGearboxError> = SDKResult<T> | SDKError<E>;
```

Everything is rewritten onto it — prepare, preview, the verdict-classes that
throw today — EXCEPT the multichain reads (`list*`, `totals`, `charts`, …),
which keep `DataResponse` because their per-chain metadata is real
information and their shape feeds gearbox-backend and client-v3 today. Each
method's `E` is its exact per-method union (from the engine raise-site
trace), result payloads carry the `Result` suffix, and the deptrack graph
drives a committed consumer-impact report so backend/client-v3 breakage is
enumerated, not discovered.

# Owner decisions (fixed)

1. Envelope: `SDKResult<T> { ok: true, data: T }` | `SDKError<E> { ok: false,
   error: E }`, union `SDKReturn<T, E>`. Discriminant is `ok` — deliberately
   the discriminant client-v3 already narrows on today, so consumer diffs
   stay mechanical.
2. Per-method precision stays: `E` is a named per-method union
   (`SDKReturn<StrategyResult, DepositStrategyError>`), never a blanket
   18-member union.
3. Result payload types end in `Result`.
4. No `DataResponse` on single-chain operations; `blockNumber`/`timestamp`
   move onto the `*Result` payloads. Multichain reads keep `DataResponse`
   untouched.
5. Old error content survives as plain discriminated objects
   (`IGearboxError { code, message, cause? }`); no Error-class wrappers for
   verdicts. Thrown exceptions remain only for bugs and outages.
6. The colleague's branch (`next` @ 7d00fb38) is the base: built upon,
   finished, never rewritten; his `WithError`/`success` envelope is replaced
   by `SDKReturn`/`ok`.

# The catalog (new)

`src/model/result.ts` (model-level, importable by every namespace; re-exported
from every entrypoint's barrel): `SDKResult`, `SDKError`, `SDKReturn`,
`IGearboxError` (moves in from model/errors.ts or stays and is re-exported —
one home, no duplicates), plus the two helpers every caller and implementer
need:

```ts
export function sdkOk<T>(data: T): SDKResult<T>;
export function sdkErr<E extends IGearboxError>(error: E): SDKError<E>;
export function isSDKError<T, E extends IGearboxError>(
  r: SDKReturn<T, E>,
): r is SDKError<E>;  // r.ok === false — trivial, but names the intent
```

# Scope of the rewrite

## Tier 1 — prepare namespace (per-method unions from the audit trace)

| method | E = | codes |
|---|---|---|
| deposit / withdraw / redeem | `LpError` | unsupportedTokenPair (1) |
| addCollateral / withdrawCollateral | `CollateralError` | 6 plumbing codes |
| repayStrategy | `RepayStrategyError` | 8 |
| openNewStrategy | `OpenStrategyError` | 10 |
| depositStrategy | `DepositStrategyError` | 11 |
| withdrawStrategy | `WithdrawStrategyError` | 11 (no insufficientPoolLiquidity) |
| adjustLeverage | `AdjustLeverageError` | 13 |
| finalize | `FinalizeError` | 10 (only home of noRecordedIntent) |
| max* / leverageBand / withdrawableCollaterals | — | not refusable, plain values |

Signatures: `depositStrategy(...): Promise<SDKReturn<StrategyResult,
DepositStrategyError>>`. Renames: `LpPlan/StrategyPlan/OpenStrategyPlan/
DelayedStrategyPlan/StrategyRoutes` → `LpResult/StrategyResult/
OpenStrategyResult/DelayedStrategyResult/StrategyRoutesResult`. Precision
extras locked by types: `poolSunset`/`quotaCountExceeded`/
`malformedTransaction` are unreachable from prepare and leave its
vocabulary; prepare's `MarketPausedError` has no `pool` variant; `binding`
excludes `poolDebtLimit`; routes errors keep `refused` with per-route
narrowed reason sets.

## Tier 2 — preview namespace

- `previewOperation` and friends: `SDKReturn<OperationPreviewResult, …>`
  instead of throw-or-value; the numeric-code `OperationPreviewError`
  (1xxx/2xxx) is re-expressed with string codes in the common vocabulary
  (`malformedTransaction` / `previewIncomplete`), keeping the numeric code
  as a field for backend compatibility.
- The six verdict classes stop throwing and become returned errors:
  `UnsupportedTargetError`, `UnsupportedPoolFunctionError`,
  `UnsupportedOperationError`, `UnsupportedZapperFunctionError`,
  `InvalidDelayedIntentError`, `PreviewSimulationError` — same fields,
  declassed, `code` assigned, wrapped in `SDKError`.
- `checkOperation`/`checkSimulation` keep `PreviewIssue | null` (they are
  predicates, not operations) — unchanged.

## Tier 2.5 — the bare-throw sweep on public operation paths

The rule, encoded and tested: on any public refusable path, a `throw`
reachable through caller input or on-chain/market state is a verdict and
must become an `SDKError` member of that method's union. A `throw` may
remain only for (a) programmer misuse of the API (invariant violations),
(b) transport/RPC failure, (c) sdk lifecycle (attach/state). Every audited
site is dispositioned one way or the other — no unclassified throws left:

- `PrepareApi.ts:255` — "credit manager has no strategy target collateral":
  market-state verdict → new code `noStrategyTargetCollateral` on
  `OpenStrategyError`.
- `PoolService` route/metadata throws (10 sites; 2 already converted by
  `lpRoute`): each assessed — reachable via LP prepare with a wrong-but-
  well-typed token/pool is a verdict (`unsupportedTokenPair` or a new
  `unsupportedPool` code); reachable only via corrupted internal state
  stays thrown with a justification comment.
- `intents/index.ts:143,284,298,383` and `tail.ts:71,111` — dispositioned
  individually the same way; those that guard engine invariants stay
  thrown, those triggered by resumable/claim input become codes on
  `FinalizeError`/route errors.
- `queryChain` unknown-chain (`ChainNotConfiguredError`) — programmer
  misuse, stays thrown, documented in the method docs.

The disposition table (site → verdict-code | kept-throw + why) is part of
MIGRATION.md.

## Tier 3 — engine boundary

Engine internals stay (`PreviewIssue`, `refuse()`, and the internal-only
transport `IntentPreviewError`); `IntentPreviewError` stops being exported
from `/onchain` (it never was a public verdict channel — the boundary
converts it). `PrepareApi`/preview boundaries construct `SDKError` via one
retyped adapter.

## Out of scope (unchanged)

- Multichain reads and their `DataResponse` envelopes (`list`, `totals`,
  `charts`, merges) — the backend/client contract stands.
- Thrown outage classes: root source errors (`AllSourcesFailedError`, …),
  `/offchain` transport classes, core lifecycle `Sdk*Error`s — genuine
  failures keep throwing. (A later delivery may give them `code`s; not this
  one.)
- Consumer repos: gearbox-backend and client-v3 migrate in their own
  Deliveries, driven by the impact report below.

# Also in scope: finish the colleague's branch (does not build)

Barrel export for `creditOperationMarket`; the 7-name preview rename map
applied and the half-landed `*Verify` rewire completed (old files deleted,
`preview/index.ts`/`previewOperation.ts` rewired); removed-field
assignments fixed (`targetCollateral` ×6, `underlyingToken` ×2,
`estClaimableAt`); conservative resolution of his two behaviour deltas
(keep `accountStrategyName` for preview `name`; drop the gratuitous
`async`); `unrun` added to devDependencies (clean-install build fails
without it).

# Impact tracking with deptrack (the graph tool)

- Rescan the sdk internal graph on this branch; `link` the built dist into
  gearbox-backend and client-v3 checkouts; run their typechecks; parse.
- Commit `docs/plans/precise-error-unions.impact.md`: per consumer, the
  file:line list every signature change touches (known floor: client-v3
  7 files / 31 mentions via the `*Prepare` renames; backend expected ~0 on
  prepare — it does not consume the facade — verified, not assumed).
- The impact report is a Delivery gate artifact: no publish until it exists
  and names every consumer break.

# Constraints

- Branch `feat/precise-error-unions` from `origin/next`; colleague's history
  untouched.
- Engine raise sites unchanged; `guards.onchain.test.ts` passes without
  assertion edits.
- One vocabulary invariant: every `code` value across prepare and preview is
  a member of one union (`SDKErrorCode`), no numeric-only codes remain.
- Process: sdk gets the seven `agent:*` scripts (vitest lanes, check:ci +
  typecheck:ci + test as verify:pr). Node 22 for vitest; tsc 7 for
  typecheck.
- MIGRATION.md §"prepare answers in the SDK's error envelope" is rewritten
  to `SDKReturn` (it documents `WithError` today) and extended with the
  per-method table, Tier-2 changes, and the consumer rename map.

# Reuse

- Colleague's per-code error interfaces, `MESSAGES` table, `toPrepareError`
  adapter (retyped to per-method unions), MIGRATION.md structure.
- `refusal.test-d.ts` as precedent for exact-union type tests; vitest
  `typecheck.include` already wired; `previewMatchesPrepare.test.ts` as the
  prepare/preview drift harness.
- deptrack (`~/Coding/deptrack`) for graph + link + consumer typecheck.

# Testable invariants

- I1. Envelope: `SDKReturn` narrows on `ok` in both directions (type test);
  `sdkOk`/`sdkErr`/`isSDKError` behave (unit test); no `WithError<` and no
  `success:` discriminant remain in src (grep-backed test).
- I2. Per-method exactness: `src/sdk/prepare/types.test-d.ts` proves each
  method's awaited return equals `SDKReturn<XResult, ExactUnion>`; adding or
  removing a code without moving the raise site fails typecheck.
- I3. `poolSunset`/`quotaCountExceeded`/`malformedTransaction` not
  assignable to any prepare `E`; `MarketPausedError` (prepare) has no pool
  variant; no `poolDebtLimit` binding (negative type tests).
- I4. Preview: the six former verdict classes are returned, never thrown —
  a spec drives each construction path and asserts no throw crosses the
  public API; every error `code` (prepare + preview) is a member of
  `SDKErrorCode` (type test).
- I4b. Bare-throw sweep: every audited throw site on a public operation
  path is either a union member with a fixture-driven test producing it as
  an `SDKError`, or carries a kept-throw justification and appears in the
  MIGRATION.md disposition table; a repo test walks the table and fails on
  an undispositioned site (list-driven, so a new throw on these paths
  must be classified to land).
- I5. No `DataResponse` in any prepare/preview operation signature; every
  `*Result` carries `blockNumber`/`timestamp`; multichain read signatures
  byte-identical (type test pinning them).
- I6. Build: tsdown exit 0 and `typecheck:ci` clean on a fresh install;
  colleague's breaks fixed.
- I7. Engine untouched: `guards.onchain.test.ts`,
  `previewMatchesPrepare.test.ts` pass; `IntentPreviewError` no longer
  exported from `/onchain` (type test on the barrel).
- I8. Existing error-path tests (PrepareApi.test.ts, e2e
  prepare-execute.test.ts refusal block) assert the `SDKReturn` shape and
  pass.
- I9. Impact report exists, generated from deptrack link + consumer
  typechecks, listing every backend/client-v3 break with file:line.
- I10. MIGRATION.md documents the catalog, the per-method table, Tier-2,
  and the consumer rename map.

# Success metrics

- Poison: a fake code added to one method's union without a raise site — or
  a raise site added without a union member — fails `agent:typecheck`.
- Grep zero: `WithError<`, `success: true`, `extends Error` on any verdict
  path in `src/sdk/prepare/**` and `src/preview/**` (outage classes exempt).
- Unit + type-test suites green; impact report committed.

# Non-goals

- No changes to multichain read envelopes or their consumers.
- No `code` retrofit on thrown outage classes (root/offchain/core) — later.
- No consumer-repo edits; no npm publish/version bump in this Delivery.
<!-- plan:spec:end -->

<!-- plan:implementation:start -->
## Implementation contract
<!-- plan:implementation:end -->

<!-- plan:execution:start -->
## Execution log
<!-- plan:execution:end -->
