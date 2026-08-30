# Per-method error unions in sdk

Status: SPEC_LOCKED
Spec lock: sha256:f25130ec0722390315252d74d064f705b1e9e42fc8d2d759082cfa80521e71db owner:переходим к стадии PLAN по blueprint, используй planctl чтобы его подготовить (owner, 2026-08-30)
Implementation lock: unlocked
Active Delivery: D1
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

# Deliveries

- **D1 — sdk PR #497** (this repo, feat/precise-error-unions → next): the
  catalog, per-method unions, throw sweep, colleague-branch completion,
  MIGRATION.md and the deptrack impact report. Owner merges.
- **D2 — client-v3 PR** (depends on D1): migrates the 7 files / 31 mentions
  plus the invokers/catalog/issueCopy adapters; developed against the
  deptrack-linked dist, marked ready when the sdk version is published and
  the pin flipped. Encoded as its own planctl plan in the client-v3 repo
  (planctl receipts are repo-local), seeded from D1's impact report; this
  plan's D1 gate requires that seed to exist.
- **D3 — gearbox-backend** (conditional): opened only if the impact report
  shows non-zero breaks; the graph predicts none.
<!-- plan:spec:end -->

<!-- plan:implementation:start -->
## Implementation contract

<!-- plan:delivery:D1:start -->
<!-- plan:delivery-meta:{"active":true,"depends":[]} -->
### PR Delivery D1 — SDKReturn catalog and per-method error unions in sdk

Branch: `feat/precise-error-unions`; Depends: none; Gate: bun run agent:verify:pr exits 0 on a fresh install (build + typecheck + unit and type tests), poison: a code added to or removed from one method's union without moving the raise site fails agent:typecheck, grep zero: WithError<, success-discriminant, and verdict-path Error classes in src/sdk/prepare and src/preview, docs/plans/precise-error-unions.impact.md exists, generated from deptrack link + consumer typechecks, naming every backend/client-v3 break, MIGRATION.md carries the per-method table and the throw disposition table.

Stage graph: `S1 -> {S2,S3}; {S2,S3} -> S4; {S2,S3} -> S5 (S4 parallel S5); S4 -> S6; {S4,S5,S6} -> S7; S7 -> S8`.

<!-- plan:stage:D1-S1:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":[],"parallelWith":[],"writes":["package.json","pnpm-lock.yaml","src/quality/agentScripts.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S1"} -->
#### Stage D1-S1 — Environment: agent scripts, unrun devDep

Owner: agent; Profile: fast; Depends: none; Parallel with: none.
Writes: `package.json`, `pnpm-lock.yaml`, `src/quality/agentScripts.test.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S1` (must be absent at handoff).
Predict: 12 active min / 3 credits.

##### Tasks

- [ ] D1-S1-T1 — the sdk workspace exposes the seven agent:* contract scripts and builds on a clean install
      Writes: `package.json`, `pnpm-lock.yaml`, `src/quality/agentScripts.test.ts`.
      Predict: 12 active min / 3 credits.
      How: add agent:install (pnpm install --frozen-lockfile), agent:test:backend (vitest run --project unit --), agent:test:e2e (vitest run --project e2e --), agent:test:frontend (N/A echo), agent:typecheck, agent:verify:commit (biome check staged via lint-staged if configured else check:ci), agent:verify:pr (check:ci + typecheck:ci + test:unit + build), agent:verify:docs (N/A); add unrun to devDependencies (tsdown config loader; clean-install build fails without it); RED test asserts the seven scripts exist and unrun is a devDependency Files written: package.json, pnpm-lock.yaml, src/quality/agentScripts.test.ts.
      RED: `bun run agent:test:backend -- src/quality/agentScripts.test.ts`

##### Acceptance criteria

- [ ] all seven scripts present; `bun run agent:typecheck` runs tsc
- [ ] Commit

##### Results

<!-- plan:results:D1-S1:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S1:end -->
<!-- plan:stage:D1-S1:end -->

<!-- plan:stage:D1-S2:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S1"],"parallelWith":["D1-S3"],"writes":["src/onchain/market/credit/index.ts","src/onchain/market/credit/CreditSuite.ts","src/preview/preview/index.ts","src/preview/preview/previewOperation.ts","src/preview/preview/previewPoolPositionOperation.ts","src/preview/preview/previewExitOrRepayStrategyPosition.ts","src/preview/preview/previewOpenStrategyPosition.ts","src/preview/preview/previewAdjustStrategyPosition.ts","src/preview/preview/buildDelayedStrategyPositionOperationPreview.ts","src/preview/preview/previewOpenStrategyVerify.ts","src/preview/preview/previewAdjustStrategyVerify.ts","src/preview/preview/buildDelayedStrategyVerify.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S2"} -->
#### Stage D1-S2 — Finish the colleague's branch: build fixes and Verify rewire

Owner: agent; Profile: fast; Depends: D1-S1; Parallel with: D1-S3.
Writes: `src/onchain/market/credit/index.ts`, `src/onchain/market/credit/CreditSuite.ts`, `src/preview/preview/index.ts`, `src/preview/preview/previewOperation.ts`, `src/preview/preview/previewPoolPositionOperation.ts`, `src/preview/preview/previewExitOrRepayStrategyPosition.ts`, `src/preview/preview/previewOpenStrategyPosition.ts`, `src/preview/preview/previewAdjustStrategyPosition.ts`, `src/preview/preview/buildDelayedStrategyPositionOperationPreview.ts`, `src/preview/preview/previewOpenStrategyVerify.ts`, `src/preview/preview/previewAdjustStrategyVerify.ts`, `src/preview/preview/buildDelayedStrategyVerify.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S2` (must be absent at handoff).
Predict: 35 active min / 6 credits.

##### Tasks

- [ ] D1-S2-T1 — the branch builds: barrel export restored, the half-landed *Verify rewire completed, removed-field assignments gone
      Writes: `src/onchain/market/credit/index.ts`, `src/onchain/market/credit/CreditSuite.ts`, `src/preview/preview/index.ts`, `src/preview/preview/previewOperation.ts`, `src/preview/preview/previewPoolPositionOperation.ts`, `src/preview/preview/previewExitOrRepayStrategyPosition.ts`, `src/preview/preview/previewOpenStrategyPosition.ts`, `src/preview/preview/previewAdjustStrategyPosition.ts`, `src/preview/preview/buildDelayedStrategyPositionOperationPreview.ts`, `src/preview/preview/previewOpenStrategyVerify.ts`, `src/preview/preview/previewAdjustStrategyVerify.ts`, `src/preview/preview/buildDelayedStrategyVerify.ts`.
      Predict: 35 active min / 6 credits.
      How: add creditOperationMarket to the credit barrel; drop underlyingToken from CreditSuite.creditOperationMarket; rewire preview/index.ts and previewOperation.ts to the new *Verify files and delete the three superseded old files; apply the 7-name rename map in the two files with no Verify counterpart; drop targetCollateral/estClaimableAt assignments; conservative deltas: keep accountStrategyName for preview name, drop the gratuitous async on synchronous replay calls; RED is the colleague's own test written against the new names, failing today Files written: src/onchain/market/credit/index.ts, src/onchain/market/credit/CreditSuite.ts, src/preview/preview/index.ts, src/preview/preview/previewOperation.ts, src/preview/preview/previewPoolPositionOperation.ts, src/preview/preview/previewExitOrRepayStrategyPosition.ts, src/preview/preview/previewOpenStrategyPosition.ts, src/preview/preview/previewAdjustStrategyPosition.ts, src/preview/preview/buildDelayedStrategyPositionOperationPreview.ts, src/preview/preview/previewOpenStrategyVerify.ts, src/preview/preview/previewAdjustStrategyVerify.ts, src/preview/preview/buildDelayedStrategyVerify.ts.
      RED: `bun run agent:test:backend -- src/preview/preview/previewRWADelayedOperation.test.ts`

##### Acceptance criteria

- [ ] tsdown build exits 0
- [ ] `bun run agent:test:backend -- src/preview` exits 0
- [ ] Commit

##### Results

<!-- plan:results:D1-S2:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S2:end -->
<!-- plan:stage:D1-S2:end -->

<!-- plan:stage:D1-S3:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S1"],"parallelWith":["D1-S2"],"writes":["src/model/result.ts","src/model/result.test.ts","src/model/errors.ts","src/model/index.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S3"} -->
#### Stage D1-S3 — SDKReturn catalog in model

Owner: agent; Profile: fast; Depends: D1-S1; Parallel with: D1-S2.
Writes: `src/model/result.ts`, `src/model/result.test.ts`, `src/model/errors.ts`, `src/model/index.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S3` (must be absent at handoff).
Predict: 20 active min / 4 credits.

##### Tasks

- [ ] D1-S3-T1 — SDKResult/SDKError/SDKReturn with ok discriminant plus sdkOk/sdkErr/isSDKError exist as the single envelope, WithError is gone from model
      Writes: `src/model/result.ts`, `src/model/result.test.ts`, `src/model/errors.ts`, `src/model/index.ts`.
      Predict: 20 active min / 4 credits.
      How: create src/model/result.ts with the owner's exact shapes and the three helpers; IGearboxError keeps one home (errors.ts) re-exported beside the catalog; remove WithError from model/errors.ts; barrel exports; RED spec asserts narrowing both ways, helper behavior, and that model exports no WithError Files written: src/model/result.ts, src/model/result.test.ts, src/model/errors.ts, src/model/index.ts.
      RED: `bun run agent:test:backend -- src/model/result.test.ts`

##### Acceptance criteria

- [ ] `bun run agent:test:backend -- src/model` exits 0
- [ ] Commit

##### Results

<!-- plan:results:D1-S3:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S3:end -->
<!-- plan:stage:D1-S3:end -->

<!-- plan:stage:D1-S4:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S2","D1-S3"],"parallelWith":["D1-S5"],"writes":["src/sdk/prepare/errors.ts","src/sdk/prepare/types.ts","src/sdk/prepare/PrepareApi.ts","src/sdk/prepare/types.test-d.ts","src/sdk/prepare/PrepareApi.test.ts","src/sdk/execute/types.ts","src/sdk/execute/ExecuteApi.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S4"} -->
#### Stage D1-S4 — Prepare namespace on SDKReturn with per-method exact unions

Owner: agent; Profile: fast; Depends: D1-S2, D1-S3; Parallel with: D1-S5.
Writes: `src/sdk/prepare/errors.ts`, `src/sdk/prepare/types.ts`, `src/sdk/prepare/PrepareApi.ts`, `src/sdk/prepare/types.test-d.ts`, `src/sdk/prepare/PrepareApi.test.ts`, `src/sdk/execute/types.ts`, `src/sdk/execute/ExecuteApi.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S4` (must be absent at handoff).
Predict: 60 active min / 11 credits.

##### Tasks

- [ ] D1-S4-T1 — every prepare method answers Promise<SDKReturn<XResult, ExactUnion>> with the union from the engine trace; blanket PrepareError and DataResponse are gone from prepare
      Writes: `src/sdk/prepare/errors.ts`, `src/sdk/prepare/types.ts`, `src/sdk/prepare/PrepareApi.ts`, `src/sdk/prepare/types.test-d.ts`, `src/sdk/prepare/PrepareApi.test.ts`, `src/sdk/execute/types.ts`, `src/sdk/execute/ExecuteApi.ts`.
      Predict: 60 active min / 11 credits.
      How: declare the eight named per-method unions (LpError 1 code ... AdjustLeverageError 13) per the SPEC table; rename *Plan payloads to *Result adding blockNumber/timestamp from the query context; retype toPrepareError per-set; PrepareApi constructs sdkOk/sdkErr and stops wrapping in DataResponse; narrow MarketPausedError to creditManager-only and binding to exclude poolDebtLimit for prepare; execute namespace consumes result.data via ok narrowing; RED type-test file proves per-method exactness incl. negative tests for the three preview-only codes Files written: src/sdk/prepare/errors.ts, src/sdk/prepare/types.ts, src/sdk/prepare/PrepareApi.ts, src/sdk/prepare/types.test-d.ts, src/sdk/prepare/PrepareApi.test.ts, src/sdk/execute/types.ts, src/sdk/execute/ExecuteApi.ts.
      RED: `bun run agent:test:backend -- src/sdk/prepare/types.test-d.ts`

##### Acceptance criteria

- [ ] `bun run agent:test:backend -- src/sdk` exits 0
- [ ] no DataResponse import remains in src/sdk/prepare
- [ ] Commit

##### Results

<!-- plan:results:D1-S4:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S4:end -->
<!-- plan:stage:D1-S4:end -->

<!-- plan:stage:D1-S5:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S2","D1-S3"],"parallelWith":["D1-S4"],"writes":["src/model/previews.ts","src/preview/preview/previewOperation.ts","src/preview/preview/errors.ts","src/preview/parse/errors.ts","src/preview/simulate/errors.ts","src/preview/index.ts","src/preview/preview/previewOperation.test-d.ts","src/onchain/market/zapper/errors.ts","src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/validation/index.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S5"} -->
#### Stage D1-S5 — Preview namespace: SDKReturn and verdict declassing

Owner: agent; Profile: fast; Depends: D1-S2, D1-S3; Parallel with: D1-S4.
Writes: `src/model/previews.ts`, `src/preview/preview/previewOperation.ts`, `src/preview/preview/errors.ts`, `src/preview/parse/errors.ts`, `src/preview/simulate/errors.ts`, `src/preview/index.ts`, `src/preview/preview/previewOperation.test-d.ts`, `src/onchain/market/zapper/errors.ts`, `src/onchain/accounts/withdrawal-compressor/errors.ts`, `src/onchain/validation/index.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S5` (must be absent at handoff).
Predict: 50 active min / 9 credits.

##### Tasks

- [ ] D1-S5-T1 — previewOperation answers SDKReturn; the six verdict classes are returned plain objects with string codes; IntentPreviewError leaves the public barrel
      Writes: `src/model/previews.ts`, `src/preview/preview/previewOperation.ts`, `src/preview/preview/errors.ts`, `src/preview/parse/errors.ts`, `src/preview/simulate/errors.ts`, `src/preview/index.ts`, `src/preview/preview/previewOperation.test-d.ts`, `src/onchain/market/zapper/errors.ts`, `src/onchain/accounts/withdrawal-compressor/errors.ts`, `src/onchain/validation/index.ts`.
      Predict: 50 active min / 9 credits.
      How: OperationPreviewError re-expressed with string codes (numeric kept as a field); declass UnsupportedTarget/PoolFunction/Operation/Zapper, InvalidDelayedIntent, PreviewSimulation into IGearboxError objects constructed at their sites and returned; unexport IntentPreviewError from onchain validation barrel; checkOperation/checkSimulation untouched; RED extends previewOperation.test-d.ts with the SDKReturn shape assertions Files written: src/model/previews.ts, src/preview/preview/previewOperation.ts, src/preview/preview/errors.ts, src/preview/parse/errors.ts, src/preview/simulate/errors.ts, src/preview/index.ts, src/preview/preview/previewOperation.test-d.ts, src/onchain/market/zapper/errors.ts, src/onchain/accounts/withdrawal-compressor/errors.ts, src/onchain/validation/index.ts.
      RED: `bun run agent:test:backend -- src/preview/preview/previewOperation.test-d.ts`

##### Acceptance criteria

- [ ] `bun run agent:test:backend -- src/preview` exits 0
- [ ] grep zero: extends Error in the six former verdict files
- [ ] Commit

##### Results

<!-- plan:results:D1-S5:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S5:end -->
<!-- plan:stage:D1-S5:end -->

<!-- plan:stage:D1-S6:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S4"],"parallelWith":[],"writes":["src/sdk/prepare/throwSweep.test.ts","src/sdk/prepare/PrepareApi.ts","src/onchain/accounts/intents/index.ts","src/onchain/accounts/intents/tail.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S6"} -->
#### Stage D1-S6 — Bare-throw sweep with disposition table

Owner: agent; Profile: fast; Depends: D1-S4; Parallel with: none.
Writes: `src/sdk/prepare/throwSweep.test.ts`, `src/sdk/prepare/PrepareApi.ts`, `src/onchain/accounts/intents/index.ts`, `src/onchain/accounts/intents/tail.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S6` (must be absent at handoff).
Predict: 40 active min / 7 credits.

##### Tasks

- [ ] D1-S6-T1 — every audited bare throw on a public operation path is either a union member produced as SDKError or a justified kept-throw; no unclassified sites
      Writes: `src/sdk/prepare/throwSweep.test.ts`, `src/sdk/prepare/PrepareApi.ts`, `src/onchain/accounts/intents/index.ts`, `src/onchain/accounts/intents/tail.ts`.
      Predict: 40 active min / 7 credits.
      How: convert PrepareApi:255 to noStrategyTargetCollateral on OpenStrategyError; assess the four intents/index.ts and two tail.ts sites — claim/resume-input-reachable ones become FinalizeError/route codes, invariant guards keep throw with justification comments; PoolService throws are caught at the PrepareApi boundary extending the lpRoute pattern (engine file untouched); RED spec drives each converted site via fixtures and asserts the SDKError, and walks the disposition list failing on an undispositioned site Files written: src/sdk/prepare/throwSweep.test.ts, src/sdk/prepare/PrepareApi.ts, src/onchain/accounts/intents/index.ts, src/onchain/accounts/intents/tail.ts.
      RED: `bun run agent:test:backend -- src/sdk/prepare/throwSweep.test.ts`

##### Acceptance criteria

- [ ] disposition table complete in the test's list
- [ ] `bun run agent:test:backend -- src/sdk/prepare` exits 0
- [ ] Commit

##### Results

<!-- plan:results:D1-S6:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S6:end -->
<!-- plan:stage:D1-S6:end -->

<!-- plan:stage:D1-S7:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S4","D1-S5","D1-S6"],"parallelWith":[],"writes":["MIGRATION.md","docs/plans/precise-error-unions.impact.md","src/quality/migrationDocs.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S7"} -->
#### Stage D1-S7 — MIGRATION.md and deptrack impact report

Owner: agent; Profile: fast; Depends: D1-S4, D1-S5, D1-S6; Parallel with: none.
Writes: `MIGRATION.md`, `docs/plans/precise-error-unions.impact.md`, `src/quality/migrationDocs.test.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S7` (must be absent at handoff).
Predict: 30 active min / 5 credits.

##### Tasks

- [ ] D1-S7-T1 — the migration doc carries the catalog, per-method table and throw dispositions; the impact report enumerates every consumer break from real typechecks
      Writes: `MIGRATION.md`, `docs/plans/precise-error-unions.impact.md`, `src/quality/migrationDocs.test.ts`.
      Predict: 30 active min / 5 credits.
      How: rewrite the WithError section to SDKReturn/ok; add the per-method union table, Tier-2 changes, throw disposition table and consumer rename map; build dist, deptrack link into gearbox-backend and client-v3, run their typechecks, parse into impact.md with file:line per break; seed client-v3 D2 plan stub from it; RED test asserts MIGRATION sections and impact file exist and are non-empty Files written: MIGRATION.md, docs/plans/precise-error-unions.impact.md, src/quality/migrationDocs.test.ts.
      RED: `bun run agent:test:backend -- src/quality/migrationDocs.test.ts`

##### Acceptance criteria

- [ ] impact.md lists both consumers with real typecheck output
- [ ] Commit

##### Results

<!-- plan:results:D1-S7:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S7:end -->
<!-- plan:stage:D1-S7:end -->

<!-- plan:stage:D1-S8:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S7"],"parallelWith":[],"writes":["docs/plans/precise-error-unions.evidence.md","src/quality/deliveryGate.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S8"} -->
#### Stage D1-S8 — Delivery gate: verify, poison checks, evidence

Owner: agent; Profile: fast; Depends: D1-S7; Parallel with: none.
Writes: `docs/plans/precise-error-unions.evidence.md`, `src/quality/deliveryGate.test.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S8` (must be absent at handoff).
Predict: 25 active min / 4 credits.

##### Tasks

- [ ] D1-S8-T1 — the whole Delivery is proven green and the union-exactness poison checks are recorded
      Writes: `docs/plans/precise-error-unions.evidence.md`, `src/quality/deliveryGate.test.ts`.
      Predict: 25 active min / 4 credits.
      How: run bun run agent:verify:pr on a fresh install; poison A: add a fake code to one union alias without a raise site — typecheck must fail; poison B: remove a real member — the exactness type test must fail; restore byte-exact; record both in evidence; deliveryGate test asserts evidence exists, grep-zero WithError/success-discriminant, and pushes the branch Files written: docs/plans/precise-error-unions.evidence.md, src/quality/deliveryGate.test.ts.
      RED: `bun run agent:test:backend -- src/quality/deliveryGate.test.ts`

##### Acceptance criteria

- [ ] agent:verify:pr exits 0
- [ ] both poisons recorded with restored state
- [ ] Commit

##### Results

<!-- plan:results:D1-S8:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S8:end -->
<!-- plan:stage:D1-S8:end -->
<!-- plan:delivery:D1:end -->

<!-- plan:delivery:D2:start -->
<!-- plan:delivery-meta:{"active":false,"depends":["D1"]} -->
### PR Delivery D2 — client-v3 migration to SDKReturn (executed via client-v3 plan)

Branch: `feat/sdk-return-migration`; Depends: D1; Gate: executed as its own planctl plan in the client-v3 repo, seeded from D1's impact report, client-v3 agent:verify:pr green against the deptrack-linked dist; PR marked ready only after the sdk version is published and the pin flipped.

Stage graph: `encoded in client-v3 docs/plans/sdk-return-migration.md`.

<!-- plan:delivery:D2:end -->
<!-- plan:implementation:end -->

<!-- plan:execution:start -->
## Execution log

- lock-spec sha256:f25130ec0722390315252d74d064f705b1e9e42fc8d2d759082cfa80521e71db owner:переходим к стадии PLAN по blueprint, используй planctl чтобы его подготовить (owner, 2026-08-30)

- put-delivery D1

- put-delivery D2

- put-stage D1-S1

- put-stage D1-S2

- put-stage D1-S3

- put-stage D1-S4

- put-stage D1-S5

- put-stage D1-S6

- put-stage D1-S7

- put-stage D1-S8
<!-- plan:execution:end -->
