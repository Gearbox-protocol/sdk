# Per-method error unions in sdk

Status: APPROVED
Spec lock: sha256:f25130ec0722390315252d74d064f705b1e9e42fc8d2d759082cfa80521e71db owner:переходим к стадии PLAN по blueprint, используй planctl чтобы его подготовить (owner, 2026-08-30)
Implementation lock: sha256:d23980fc0f55153d109187096a7d2ace6728f95cb3765b14ed9960507ba24f43 owner:фиксируем так (owner) — six consumer test files need the one-line unwrap
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
<!-- plan:stage-meta:{"deliveryId":"D1","depends":[],"parallelWith":[],"writes":["package.json","pnpm-lock.yaml","src/quality/agentScripts.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S1","verifyActiveMinutes":3,"verifyCredits":1} -->
#### Stage D1-S1 — Environment

Owner: agent; Profile: fast; Depends: none; Parallel with: none.
Writes: `package.json`, `pnpm-lock.yaml`, `src/quality/agentScripts.test.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S1` (must be absent at handoff).
Predict: 15 active min / 4 credits.
Of which verification: 3 active min / 1 credits.

##### Tasks

- [x] D1-S1-T1 — package.json gains the seven agent:* scripts and the unrun devDependency (pnpm-lock.yaml follows); agentScripts.test.ts proves both. (12 min) — 634c8791f5c1dd668618ebcff28a20fdba5b11a5
<!-- plan:task-meta:{"writes":["package.json","pnpm-lock.yaml","src/quality/agentScripts.test.ts"],"predictedActiveMinutes":12,"predictedCredits":3,"how":"thin aliases over pnpm/vitest","red":"bun run agent:test:backend -- src/quality/agentScripts.test.ts"} -->

##### Acceptance criteria

- [ ] fresh check: `rm -rf node_modules && bun run agent:install` then the RED test passes — proves unrun really fixes the clean install
- [ ] each of the seven scripts runs (N/A lanes exit 0 with their reason printed)
- [x] Commit — 634c8791f5c1dd668618ebcff28a20fdba5b11a5

##### Results

<!-- plan:results:D1-S1:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
| D1-S1-T1 | 634c8791f5c1dd668618ebcff28a20fdba5b11a5 | 2026-08-30T09:34:19.851Z–2026-08-30T09:35:26.000Z | 1 / 1 min | unavailable: runner did not expose usage | Seven contract scripts + agent:typecheck exposed; unrun in devDependencies; cold rm-rf install then RED-test and tsc both green. |
<!-- plan:results:D1-S1:end -->
<!-- plan:stage:D1-S1:end -->

<!-- plan:stage:D1-S3:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S1"],"parallelWith":[],"writes":["src/model/result.ts","src/model/result.test.ts","src/model/errors.ts","src/model/index.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S3","verifyActiveMinutes":4,"verifyCredits":1} -->
#### Stage D1-S3 — The SDKReturn catalog

Owner: agent; Profile: fast; Depends: D1-S1; Parallel with: none.
Writes: `src/model/result.ts`, `src/model/result.test.ts`, `src/model/errors.ts`, `src/model/index.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S3` (must be absent at handoff).
Predict: 24 active min / 5 credits.
Of which verification: 4 active min / 1 credits.

##### Tasks

- [x] D1-S3-T1 — src/model/result.ts defines SDKResult/SDKError/SDKReturn plus sdkOk/sdkErr/isSDKError; WithError leaves errors.ts and index.ts; result.test.ts proves narrowing. (20 min) — 33c87ef4ce423f2b712a16e9f12badb549d4669c
<!-- plan:task-meta:{"writes":["src/model/result.ts","src/model/result.test.ts","src/model/errors.ts","src/model/index.ts"],"predictedActiveMinutes":20,"predictedCredits":4,"how":"one new module, barrel update","red":"bun run agent:test:backend -- src/model/result.test.ts"} -->

##### Acceptance criteria

- [ ] result.test.ts asserts narrowing in BOTH directions (ok true→data, ok false→error) at type and runtime level
- [ ] `grep -r "WithError<" src/model` is empty; `bun run agent:test:backend -- src/model` exits 0
- [x] Commit — 33c87ef4ce423f2b712a16e9f12badb549d4669c

##### Results

<!-- plan:results:D1-S3:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
| D1-S3-T1 | 33c87ef4ce423f2b712a16e9f12badb549d4669c | 2026-08-30T09:35:34.249Z–2026-08-30T09:37:55.000Z | 3 / 3 min | unavailable: runner did not expose usage | SDKReturn/SDKResult/SDKError with ok discriminant plus helpers; narrowing proven both directions at type and runtime; WithError removed from model; 41 model tests green. |
<!-- plan:results:D1-S3:end -->
<!-- plan:stage:D1-S3:end -->

<!-- plan:stage:D1-S4:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S3"],"parallelWith":["D1-S5"],"writes":["src/sdk/prepare/errors.ts","src/sdk/prepare/types.ts","src/sdk/prepare/types.test-d.ts","src/sdk/prepare/PrepareApi.ts","src/sdk/prepare/PrepareApi.test.ts","src/sdk/execute/types.ts","src/sdk/execute/ExecuteApi.ts","src/e2e/tests/prepare-execute.test.ts","src/sdk/execute/buildTx.test.ts","src/sdk/opportunities/mode.test-d.ts","src/sdk/GearboxSDK.loading.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S4","verifyActiveMinutes":10,"verifyCredits":2} -->
#### Stage D1-S4 — Prepare on SDKReturn with exact unions

Owner: agent; Profile: fast; Depends: D1-S3; Parallel with: D1-S5.
Writes: `src/sdk/prepare/errors.ts`, `src/sdk/prepare/types.ts`, `src/sdk/prepare/types.test-d.ts`, `src/sdk/prepare/PrepareApi.ts`, `src/sdk/prepare/PrepareApi.test.ts`, `src/sdk/execute/types.ts`, `src/sdk/execute/ExecuteApi.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S4` (must be absent at handoff).
Predict: 70 active min / 13 credits.
Of which verification: 10 active min / 2 credits.

##### Tasks

- [x] D1-S4-T1 — Give src/sdk/prepare/types.ts inline per-method unions over two documented bases (AccountFlowError / OpenFlowError) declared in errors.ts; exactness in types.test-d.ts, mode.test-d.ts follows. (25 min) — 0b55f1beed33093a37a44e8bf147d1f217c2d8b7
<!-- plan:task-meta:{"writes":["src/sdk/prepare/errors.ts","src/sdk/prepare/types.ts","src/sdk/prepare/types.test-d.ts","src/sdk/opportunities/mode.test-d.ts"],"predictedActiveMinutes":25,"predictedCredits":5,"how":"bases carry the shared plumbing + creditAccountNotFound + unexpectedFailure; flow-specific codes stay inline; the blanket PrepareError dies; exactness tests compare the EXPANDED sets against the raise-site table","red":"bun run agent:test:backend -- src/sdk/prepare/types.test-d.ts"} -->
- [x] D1-S4-T2 — PrepareApi.ts builds sdkOk/sdkErr and drops the DataResponse wrapper; PrepareApi.test.ts, e2e prepare-execute.test.ts and GearboxSDK.loading.test.ts assert the new shape. (25 min) — 0b55f1beed33093a37a44e8bf147d1f217c2d8b7
<!-- plan:task-meta:{"writes":["src/sdk/prepare/PrepareApi.ts","src/sdk/prepare/PrepareApi.test.ts","src/e2e/tests/prepare-execute.test.ts","src/sdk/GearboxSDK.loading.test.ts"],"predictedActiveMinutes":25,"predictedCredits":4,"how":"adapter retyped per-method","red":"bun run agent:test:backend -- src/sdk/prepare/PrepareApi.test.ts"} -->
- [x] D1-S4-T3 — src/sdk/execute/types.ts and ExecuteApi.ts consume ok/data; buildTx.test.ts, mode.test-d.ts and GearboxSDK.loading.test.ts follow the shape. (10 min) — 0b55f1beed33093a37a44e8bf147d1f217c2d8b7
<!-- plan:task-meta:{"writes":["src/sdk/execute/types.ts","src/sdk/execute/ExecuteApi.ts","src/sdk/execute/buildTx.test.ts"],"predictedActiveMinutes":10,"predictedCredits":2,"how":"narrowing updates only","red":"bun run agent:test:backend -- src/sdk"} -->

##### Acceptance criteria

- [ ] types.test-d.ts carries one toEqualTypeOf exactness assertion per refusable method (nine) plus negative assertions for the three preview-only codes
- [ ] `grep -rn "DataResponse" src/sdk/prepare --include=*.ts | grep -v test` is empty
- [ ] `bun run agent:typecheck` clean — the e2e refusal assertions compile against the new shape
- [ ] previewMatchesPrepare.test.ts still green; `bun run agent:test:backend -- src/sdk` exits 0
- [x] Commit — 406f317d796778a6fbd9a48715fc446d339e93a6

##### Results

<!-- plan:results:D1-S4:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
| D1-S4-T1 | 0b55f1beed33093a37a44e8bf147d1f217c2d8b7 | 2026-08-30T09:38:05.789Z–2026-08-30T10:06:08.000Z | 26 / 28 min | unavailable: runner did not expose usage | Inline unions over AccountFlowError/OpenFlowError on every prepare signature; blanket PrepareError and DataResponse gone from prepare; *Result renames with block provenance via stateBlock(); execute on ok/isSDKError; 262 sdk tests + 1376 full unit green; whole-repo tsc clean; 13 exactness type-tests incl. negative preview-only probes; parity harness untouched and green. |
| D1-S4-T2 | 0b55f1beed33093a37a44e8bf147d1f217c2d8b7 | 2026-08-30T09:38:05.789Z–2026-08-30T10:06:08.000Z | 26 / 28 min | unavailable: runner did not expose usage | Inline unions over AccountFlowError/OpenFlowError on every prepare signature; blanket PrepareError and DataResponse gone from prepare; *Result renames with block provenance via stateBlock(); execute on ok/isSDKError; 262 sdk tests + 1376 full unit green; whole-repo tsc clean; 13 exactness type-tests incl. negative preview-only probes; parity harness untouched and green. |
| D1-S4-T3 | 0b55f1beed33093a37a44e8bf147d1f217c2d8b7 | 2026-08-30T09:38:05.789Z–2026-08-30T10:06:08.000Z | 26 / 28 min | unavailable: runner did not expose usage | Inline unions over AccountFlowError/OpenFlowError on every prepare signature; blanket PrepareError and DataResponse gone from prepare; *Result renames with block provenance via stateBlock(); execute on ok/isSDKError; 262 sdk tests + 1376 full unit green; whole-repo tsc clean; 13 exactness type-tests incl. negative preview-only probes; parity harness untouched and green. |
<!-- plan:results:D1-S4:end -->
<!-- plan:stage:D1-S4:end -->

<!-- plan:stage:D1-S5:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S3"],"parallelWith":["D1-S4"],"writes":["src/preview/preview/previewOperation.ts","src/preview/preview/previewOperation.test-d.ts","src/preview/preview/errors.ts","src/preview/parse/errors.ts","src/preview/simulate/errors.ts","src/preview/verdictErrors.test.ts","src/onchain/market/zapper/errors.ts","src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/validation/index.ts","src/preview/index.ts","src/sdk/preview/PreviewNamespace.ts","src/preview/preview/previewMatchesPrepare.test.ts","src/preview/preview/previewRWADelayedOperation.test.ts","src/preview/preview/previewAdjustStrategyPosition.test.ts","src/preview/preview/previewCloseOrRepay.test.ts","src/preview/preview/previewExitOrRepayStrategyPosition.test.ts","src/preview/preview/previewRWAOperation.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S5","verifyActiveMinutes":8,"verifyCredits":2} -->
#### Stage D1-S5 — Preview on SDKReturn, verdicts declassed

Owner: agent; Profile: fast; Depends: D1-S3; Parallel with: D1-S4.
Writes: `src/preview/preview/previewOperation.ts`, `src/model/previews.ts`, `src/preview/preview/previewOperation.test-d.ts`, `src/preview/preview/errors.ts`, `src/preview/parse/errors.ts`, `src/preview/simulate/errors.ts`, `src/preview/verdictErrors.test.ts`, `src/onchain/market/zapper/errors.ts`, `src/onchain/accounts/withdrawal-compressor/errors.ts`, `src/onchain/validation/index.ts`, `src/preview/index.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S5` (must be absent at handoff).
Predict: 68 active min / 13 credits.
Of which verification: 8 active min / 2 credits.

##### Tasks

- [ ] D1-S5-T1 — previewOperation.ts answers SDKReturn over the six declassed verdicts; PreviewNamespace.ts follows; previewOperation.test-d.ts proves the exact union. (20 min)
<!-- plan:task-meta:{"writes":["src/preview/preview/previewOperation.ts","src/preview/preview/previewOperation.test-d.ts","src/sdk/preview/PreviewNamespace.ts"],"predictedActiveMinutes":20,"predictedCredits":4,"how":"numeric codes stay for backend compatibility","red":"bun run agent:test:backend -- src/preview/preview/previewOperation.test-d.ts"} -->
- [ ] D1-S5-T2 — Declass the verdict errors of src/preview/preview/errors.ts, parse/errors.ts and simulate/errors.ts; verdictErrors.test.ts drives each construction path. (15 min)
<!-- plan:task-meta:{"writes":["src/preview/preview/errors.ts","src/preview/parse/errors.ts","src/preview/simulate/errors.ts","src/preview/verdictErrors.test.ts"],"predictedActiveMinutes":15,"predictedCredits":3,"how":"same fields, no Error inheritance","red":"bun run agent:test:backend -- src/preview/verdictErrors.test.ts"} -->
- [ ] D1-S5-T3 — Declass zapper/errors.ts and withdrawal-compressor/errors.ts; IntentPreviewError leaves src/onchain/validation/index.ts and src/preview/index.ts. (15 min)
<!-- plan:task-meta:{"writes":["src/onchain/market/zapper/errors.ts","src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/validation/index.ts","src/preview/index.ts"],"predictedActiveMinutes":15,"predictedCredits":2,"how":"two declassings, two barrel removals","red":"bun run agent:test:backend -- src/preview/verdictErrors.test.ts -t onchain"} -->
- [ ] D1-S5-T4 — Unwrap the SDKReturn once in previewMatchesPrepare.test.ts, previewRWADelayedOperation.test.ts, previewAdjustStrategyPosition.test.ts and previewCloseOrRepay.test.ts. (6 min)
<!-- plan:task-meta:{"writes":["src/preview/preview/previewMatchesPrepare.test.ts","src/preview/preview/previewRWADelayedOperation.test.ts","src/preview/preview/previewAdjustStrategyPosition.test.ts","src/preview/preview/previewCloseOrRepay.test.ts"],"predictedActiveMinutes":6,"predictedCredits":1,"how":"mechanical: if (!res.ok) throw; use res.data \u2014 no assertion changes","red":"bun run agent:test:backend -- src/preview/preview/previewMatchesPrepare.test.ts"} -->
- [ ] D1-S5-T5 — Unwrap the SDKReturn once in previewExitOrRepayStrategyPosition.test.ts and previewRWAOperation.test.ts. (4 min)
<!-- plan:task-meta:{"writes":["src/preview/preview/previewExitOrRepayStrategyPosition.test.ts","src/preview/preview/previewRWAOperation.test.ts"],"predictedActiveMinutes":4,"predictedCredits":1,"how":"mechanical: if (!res.ok) throw; use res.data \u2014 no assertion changes","red":"bun run agent:test:backend -- src/preview/preview/previewRWAOperation.test.ts"} -->

##### Acceptance criteria

- [ ] verdictErrors.test.ts drives all six construction paths and asserts each returns (never throws) an object with its code
- [ ] `grep -n "extends Error"` in the six former verdict files is empty
- [ ] a negative type test proves IntentPreviewError is no longer importable from the /onchain barrel
- [ ] `bun run agent:test:backend -- src/preview` exits 0
- [ ] Commit

##### Results

<!-- plan:results:D1-S5:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S5:end -->
<!-- plan:stage:D1-S5:end -->

<!-- plan:stage:D1-S6:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S4"],"parallelWith":[],"writes":["src/sdk/prepare/PrepareApi.ts","src/sdk/prepare/throwSweep.test.ts","src/onchain/accounts/intents/index.ts","src/onchain/accounts/intents/tail.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S6","verifyActiveMinutes":5,"verifyCredits":1} -->
#### Stage D1-S6 — Bare-throw sweep

Owner: agent; Profile: fast; Depends: D1-S4; Parallel with: none.
Writes: `src/sdk/prepare/PrepareApi.ts`, `src/sdk/prepare/throwSweep.test.ts`, `src/onchain/accounts/intents/index.ts`, `src/onchain/accounts/intents/tail.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S6` (must be absent at handoff).
Predict: 27 active min / 5 credits.
Of which verification: 5 active min / 1 credits.

##### Tasks

- [ ] D1-S6-T1 — Claim-input throws in src/onchain/accounts/intents/index.ts and tail.ts become their own codes instead of the unexpectedFailure catch-all; throwSweep.test.ts walks the disposition list. (22 min)
<!-- plan:task-meta:{"writes":["src/onchain/accounts/intents/index.ts","src/onchain/accounts/intents/tail.ts","src/sdk/prepare/throwSweep.test.ts"],"predictedActiveMinutes":22,"predictedCredits":4,"how":"only the audited sites move; invariant guards keep a justified throw wrapped as unexpectedFailure","red":"bun run agent:test:backend -- src/sdk/prepare/throwSweep.test.ts"} -->

##### Acceptance criteria

- [ ] throwSweep.test.ts is list-driven over every audited engine site (intents/index x4, tail x2) and fails on an unlisted disposition
- [ ] each converted site has a fixture producing its precise SDKError; kept sites assert the unexpectedFailure wrap and carry a justification comment the test locates
- [ ] `bun run agent:test:backend -- src/sdk/prepare` exits 0
- [ ] Commit

##### Results

<!-- plan:results:D1-S6:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S6:end -->
<!-- plan:stage:D1-S6:end -->

<!-- plan:stage:D1-S7:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S4","D1-S5","D1-S6"],"parallelWith":[],"writes":["MIGRATION.md","docs/plans/precise-error-unions.impact.md","src/quality/migrationDocs.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S7","verifyActiveMinutes":5,"verifyCredits":1} -->
#### Stage D1-S7 — Migration guide and impact report

Owner: agent; Profile: fast; Depends: D1-S4, D1-S5, D1-S6; Parallel with: none.
Writes: `MIGRATION.md`, `docs/plans/precise-error-unions.impact.md`, `src/quality/migrationDocs.test.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S7` (must be absent at handoff).
Predict: 35 active min / 6 credits.
Of which verification: 5 active min / 1 credits.

##### Tasks

- [ ] D1-S7-T1 — MIGRATION.md gains the per-method and disposition tables; deptrack consumer typechecks become precise-error-unions.impact.md; migrationDocs.test.ts asserts both. (30 min)
<!-- plan:task-meta:{"writes":["MIGRATION.md","docs/plans/precise-error-unions.impact.md","src/quality/migrationDocs.test.ts"],"predictedActiveMinutes":30,"predictedCredits":5,"how":"impact built from real linked typechecks of both consumers","red":"bun run agent:test:backend -- src/quality/migrationDocs.test.ts"} -->

##### Acceptance criteria

- [ ] MIGRATION.md tables are count-checked by migrationDocs.test.ts against the code: per-method table rows == refusable methods, disposition rows == audited sites
- [ ] impact.md carries both consumers' real tsc output from deptrack-linked dist; client-v3 section covers at least the 7 known files or proves zero
- [ ] Commit

##### Results

<!-- plan:results:D1-S7:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S7:end -->
<!-- plan:stage:D1-S7:end -->

<!-- plan:stage:D1-S8:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S7"],"parallelWith":[],"writes":["docs/plans/precise-error-unions.evidence.md","src/quality/deliveryGate.test.ts"],"tempRoot":".tmp/code-production/precise-error-unions/D1-S8","verifyActiveMinutes":5,"verifyCredits":1} -->
#### Stage D1-S8 — Delivery gate

Owner: agent; Profile: fast; Depends: D1-S7; Parallel with: none.
Writes: `docs/plans/precise-error-unions.evidence.md`, `src/quality/deliveryGate.test.ts`.
Temp root: `.tmp/code-production/precise-error-unions/D1-S8` (must be absent at handoff).
Predict: 30 active min / 5 credits.
Of which verification: 5 active min / 1 credits.

##### Tasks

- [ ] D1-S8-T1 — agent:verify:pr plus both union-exactness poisons recorded in precise-error-unions.evidence.md; deliveryGate.test.ts asserts the evidence. (25 min)
<!-- plan:task-meta:{"writes":["docs/plans/precise-error-unions.evidence.md","src/quality/deliveryGate.test.ts"],"predictedActiveMinutes":25,"predictedCredits":4,"how":"poisons restored byte-exact","red":"bun run agent:test:backend -- src/quality/deliveryGate.test.ts"} -->

##### Acceptance criteria

- [ ] `rm -rf node_modules && bun run agent:install && bun run agent:verify:pr` exits 0 — the gate runs from a cold start
- [ ] poison A (fake code, no raise site) and poison B (removed real member) each quoted with their failing tsc diagnostic in evidence, then restored byte-exact
- [ ] pack check: `npm pack` installed into a scratch project typechecks a sample that narrows one prepare union — the published d.ts shape works
- [ ] `grep -rn "WithError<\|success: true" src` is empty
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

- replace-stage D1-S1

- replace-stage D1-S2

- replace-stage D1-S3

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S7

- replace-stage D1-S8

- replace-stage D1-S1

- replace-stage D1-S2

- replace-stage D1-S3

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S7

- replace-stage D1-S8

- replace-stage D1-S1

- replace-stage D1-S2

- replace-stage D1-S3

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S7

- replace-stage D1-S8

- replace-stage D1-S1

- replace-stage D1-S2

- replace-stage D1-S3

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S7

- replace-stage D1-S8

- replace-stage D1-S1

- replace-stage D1-S2

- replace-stage D1-S3

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S7

- replace-stage D1-S8

- replace-stage D1-S1

- replace-stage D1-S2

- replace-stage D1-S3

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S7

- replace-stage D1-S8

- drop D1-S2

- replace-stage D1-S4

- replace-stage D1-S5

- replace-stage D1-S6

- replace-stage D1-S4

- replace-stage D1-S4

- replace-stage D1-S3

- approve sha256:cc369304924dcab046d054b2219edc34dc81fac048a6d987262a63fecbb658ba owner:фиксируем так (owner, 2026-08-30): базовые AccountFlowError/OpenFlowError + inline flow-коды, unexpectedFailure в базе

- record-result D1-S1 commit:634c8791f5c1dd668618ebcff28a20fdba5b11a5

- close D1-S1 partial commit:634c8791f5c1dd668618ebcff28a20fdba5b11a5

- record-result D1-S3 commit:33c87ef4ce423f2b712a16e9f12badb549d4669c

- deviation D1-S3: prepare/execute compile red until D1-S4 lands, by design — their fix is that stage's scope

- close D1-S3 partial commit:33c87ef4ce423f2b712a16e9f12badb549d4669c

- amend implementation owner:фиксируем так (owner, 2026-08-30) — SPEC I8: e2e prepare-execute assertions follow the new shape; adding the file the encoding missed sha256:bedc63636039aae6752c8b947a89b444243ffb60e7c13be1be9184f658494774

- amend implementation owner:фиксируем так (owner, 2026-08-30) — SPEC I8: e2e prepare-execute assertions follow the new shape; adding the file the encoding missed sha256:6dc84464d9b4b875be1d2a24ab3645402de84a70a6da192d08e1fb09075c35be

- amend implementation owner:фиксируем так (owner, 2026-08-30) — SPEC I8: e2e prepare-execute assertions follow the new shape sha256:4b70857cfa169dcb2c3d332fa97f2958220bfec6d9d9bb19ebf8f1ecdeb9a9cb

- amend implementation owner:фиксируем так (owner) — SPEC derivation rule: previews.ts leaves S5, orphaned PreviewNamespace return joins sha256:0f33fdd1a09c5246eb78c802bd632d329944b455a2198aed9024b878ce11a70c

- amend implementation owner:фиксируем так (owner) — SPEC derivation rule sha256:3a481618504eeea378db5c758585fe1137b332d1eadbfc1b4326c736525b1d73

- amend implementation owner:фиксируем так (owner) — SPEC derivation rule sha256:cd6bfe09818ddc2006d0c79c4a277769596a3145c21c9ee2ad99bc53278e3b0b

- amend implementation owner:фиксируем так (owner) — SPEC derivation rule sha256:88978db8eb1428c6a9d06580a03a7ab1147145dfc297eb40df58df825e306c1c

- amend implementation owner:фиксируем так (owner) — SPEC derivation rule sha256:325972ac2962c2b1b4ab25156005e099faa5cbb9c70454d0b646032d3eaf156e

- amend implementation owner:фиксируем так (owner) — three orphaned test files consume the deleted shapes; no other stage owns them sha256:3506f5a5932d1951225cedf3384737a7c42384856cffaaa081a3a54e30d9015c

- amend implementation owner:фиксируем так (owner) — three orphaned test files consume the deleted shapes; no other stage owns them sha256:8c33a22689d4901a7b5fe6756b5436134d9721ebb73f3928b357a538749cd5ab

- deviation D1-S4: adapter renamed toRefusalError (grep-gate collision with the deleted blanket name); max* readers throw creditAccountNotFound message on a missing account (bare Promise<bigint> has no failure half); one documented as-unknown-as narrows the correlated union inside refusal()/routed().

- amend implementation owner:фиксируем так (owner) — orphaned test files distributed across the tasks that break them sha256:939e91caf53822606a13fd926559eab4da2876b6d0f0a0a3a06d042051d8f31c

- amend implementation owner:фиксируем так (owner) — orphaned test files distributed across the tasks that break them sha256:a4920ce10aced9cae8e54211703d966423269a6b453d6af9b5c7ae8192c20c10

- amend implementation owner:фиксируем так (owner) — orphaned test files distributed across the tasks that break them sha256:f246a174d3aa05a8dcaf2671c24a2b3a95a0b07373c0e871e82281cd25c56db9

- amend implementation owner:фиксируем так (owner) — orphaned test files distributed across the tasks that break them sha256:5fc7e58cb87155631875a0528728bbbd95a9545e4abdf0c46611fc89bdd9e9ae

- amend implementation owner:фиксируем так (owner) — orphaned test files distributed across the tasks that break them sha256:abe978db5d63dc0492b9bb22baa2ec1a3b58ed10cd0898a79568e1d3d71d464e

- record-result D1-S4 commit:0b55f1beed33093a37a44e8bf147d1f217c2d8b7

- deviation D1-S4: three orphaned test files consuming deleted shapes migrated and distributed across tasks by owner amend

- deviation D1-S4: adapter renamed toRefusalError; max* readers throw on missing account; one documented correlated-union assertion inside refusal()/routed()

- close D1-S4 partial commit:406f317d796778a6fbd9a48715fc446d339e93a6

- amend implementation owner:фиксируем так (owner) — six consumer test files need the one-line unwrap the new return shape implies sha256:9ac1bb35d12beca7f794050034a80ca745baf2d2bc4eb0b76cbe63ac88556694

- amend implementation owner:фиксируем так (owner) — six consumer test files need the one-line unwrap sha256:d23980fc0f55153d109187096a7d2ace6728f95cb3765b14ed9960507ba24f43
<!-- plan:execution:end -->
