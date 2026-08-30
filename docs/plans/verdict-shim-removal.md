# Preview errors cleanup: shims out, PreviewOperationError in

Status: SPEC_LOCKED
Spec lock: sha256:d3e90f7ec46be390818eae298608503ada1fdd19346ba9ec22a99be35438114e owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)
Implementation lock: unlocked
Active Delivery: D1
Unattended decisions: allowed

<!-- plan:spec:start -->
# The Goal

The six preview refusal errors are defined cleanly — an interface plus an
exported factory function, nothing else. The `Symbol.hasInstance` shims, the
`as`-cast class aliases and every `new XError(...)` raise site go away; the
"verdict" term (a coinage of the previous Delivery, not a domain word) is
retired in favor of `PreviewOperationError` across code, tests and
MIGRATION.md. Behavior is unchanged: `previewOperation` answers the same
codes and fields behind the same `SDKReturn` envelope.

# Ground truth (measured on origin/next c3a9d962)

- 6 shims in 5 `errors.ts` files: `invalidDelayedIntent`
  (withdrawal-compressor), `unsupportedZapperFunction` (zapper),
  `unsupportedTarget` + `unsupportedPoolFunction` (preview/parse),
  `unsupportedOperation` (preview/preview), `previewSimulationFailed`
  (preview/simulate). Each = `Object.defineProperty(factory,
  Symbol.hasInstance, ...)` + `export const XError = factory as {(...);
  new (...)}`.
- Raise sites using the alias: 5 × `throw new XError(...)`
  (RedemptionLoggerV310Contract.ts:66, ZapperContract.ts:89,
  parseOperationCalldata.ts:72, parsePoolOperationCalldata.ts:83,
  detectDelayedOperation.ts:84) + `return new PreviewSimulationError(...)`
  (simulate/errors.ts:81).
- Narrowing via the shimmed `instanceof`: the six-way chain in
  `isPreviewVerdict` (previewOperation.ts:53-69) and the pass-through in
  `asPreviewSimulationError` (simulate/errors.ts:77).
- Tests keying on the shim: `verdictErrors.test.ts` (the whole file is the
  shim's spec — legacy `new`, `instanceof` matching),
  `detectDelayedOperation.test.ts:144` `toThrow(Class)`,
  `simulatePoolOperation.test.ts:195` `rejects.toThrow(Class)`.
- The word "verdict": 21 src files + the MIGRATION.md preview section; the
  union name `PreviewVerdictError` is referenced by sdk/preview/types.ts,
  PreviewNamespace.ts and previewOperation.test-d.ts.
- External consumers of the six value exports: zero, measured — client-v3
  has one mention in a comment, gearbox-backend none. Removing the value
  aliases breaks nobody.

# What changes

1. **Each errors.ts** keeps `export interface XError extends IGearboxError`
   (the definition) and gains `export function <factory>(...): XError` (the
   builder); the `defineProperty(Symbol.hasInstance)` block and the
   `export const XError = factory as {...}` alias are deleted.
2. **previewOperation.ts**: `PreviewVerdictError` → `PreviewOperationError`;
   the private `isPreviewVerdict` becomes exported
   `isPreviewOperationError`, narrowing by a compile-total code map
   (`Record<PreviewOperationError["code"], true>`) instead of `instanceof`
   — union drift breaks the build inside the map.
3. **Raise sites** call the factories: `throw unsupportedTarget(to)` etc.;
   `asPreviewSimulationError` passes through on the `code` check and builds
   via `previewSimulationFailed(...)`.
4. **Tests**: `verdictErrors.test.ts` → `previewOperationErrors.test.ts`,
   rewritten as the clean-surface spec — every factory answers its flat
   object (same `matchObject` payloads as today), the guard accepts all six
   and rejects genuine `Error`s, the barrel exports factories and no
   callable class aliases. The two `toThrow(Class)` assertions become code
   assertions (the house `toSatisfy` pattern from throwSweep).
5. **Barrels**: preview/index.ts and simulate/index.ts export the factories
   plus `type`-only interfaces; sdk/preview/types.ts and
   PreviewNamespace.ts follow the union rename.
6. **Docs**: MIGRATION.md preview section renames the union and drops the
   verdict wording; comments across the touched files reword to the sdk's
   own refusal vocabulary.

# Testable invariants

- I1. Grep-zero, enforced by a quality test (src/quality excluded from its
  own sweep): no `Symbol.hasInstance` in src, no `new` on the six error
  names, no `verdict` (case-insensitive) in src.
- I2. The guard's code map is compile-total: a member added to or removed
  from `PreviewOperationError` breaks the build inside the map — poison
  evidence both ways, quoted diagnostics, restored byte-exact.
- I3. Behavior unchanged: `previewOperation` still answers `sdkErr` with
  the same codes and fields — the envelope test and the per-factory
  payload assertions stay green with today's `matchObject` bodies.
- I4. The six names survive as types only: `import type { XError }`
  compiles, a value import of `XError` fails — test-d probe; the barrel
  exports `isPreviewOperationError` and the six factories.
- I5. Full gate `bun run agent:verify:pr` green; the MIGRATION docs
  count-tests still pass.

# Non-goals

- No changes to prepare/* unions, PrepareApi or the engine's internal
  `refuse()`/`IntentPreviewError`.
- No client-v3 work here — D2 separately decides which published version
  its pin takes.
- No publish step inside the Delivery; the PR merges to next and rides the
  normal release train.
<!-- plan:spec:end -->

<!-- plan:implementation:start -->
## Implementation contract

<!-- plan:delivery:D1:start -->
<!-- plan:delivery-meta:{"active":true,"depends":[]} -->
### PR Delivery D1 — Preview errors cleanup: shims out, PreviewOperationError in (one PR to next)

Branch: `feat/verdict-shim-removal`; Depends: none; Gate: cold gate: rm -rf node_modules, bun run agent:install, bun run agent:verify:pr exits 0, poison evidence: code-map totality broken both ways, diagnostics quoted, restored byte-exact (docs/plans/verdict-shim-removal.evidence.md), grep-zero in src: Symbol.hasInstance, new on the six error names, verdict wording (src/quality/errorSurface.test.ts green), previewOperation answers the same codes and fields as on next (same matchObject payloads in previewOperationErrors.test.ts).

Stage graph: `S1 -> S2 -> S3 (sequential: rename feeds the wording sweep, the sweep feeds the gate)`.

<!-- plan:stage:D1-S1:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":[],"parallelWith":[],"writes":["src/preview/parse/errors.ts","src/preview/parse/parseOperationCalldata.ts","src/preview/parse/parsePoolOperationCalldata.ts","src/preview/previewOperationErrors.test.ts","src/onchain/market/zapper/errors.ts","src/onchain/market/zapper/ZapperContract.ts","src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/accounts/withdrawal-compressor/RedemptionLoggerV310Contract.ts","src/preview/preview/errors.ts","src/preview/preview/detectDelayedOperation.ts","src/preview/preview/detectDelayedOperation.test.ts","src/preview/simulate/errors.ts","src/preview/simulate/simulatePoolOperation.test.ts","src/preview/preview/previewOperation.ts","src/sdk/preview/types.ts","src/sdk/preview/PreviewNamespace.ts","src/preview/preview/previewOperation.test-d.ts","src/preview/index.ts","src/preview/simulate/index.ts","src/preview/verdictErrors.test.ts"],"tempRoot":".tmp/code-production/verdict-shim-removal/D1-S1","verifyActiveMinutes":8,"verifyCredits":2} -->
#### Stage D1-S1 — Declass the six preview errors

Owner: session-main; Profile: fast; Depends: none; Parallel with: none.
Writes: `src/preview/parse/errors.ts`, `src/preview/parse/parseOperationCalldata.ts`, `src/preview/parse/parsePoolOperationCalldata.ts`, `src/preview/previewOperationErrors.test.ts`, `src/onchain/market/zapper/errors.ts`, `src/onchain/market/zapper/ZapperContract.ts`, `src/onchain/accounts/withdrawal-compressor/errors.ts`, `src/onchain/accounts/withdrawal-compressor/RedemptionLoggerV310Contract.ts`, `src/preview/preview/errors.ts`, `src/preview/preview/detectDelayedOperation.ts`, `src/preview/preview/detectDelayedOperation.test.ts`, `src/preview/simulate/errors.ts`, `src/preview/simulate/simulatePoolOperation.test.ts`, `src/preview/preview/previewOperation.ts`, `src/sdk/preview/types.ts`, `src/sdk/preview/PreviewNamespace.ts`, `src/preview/preview/previewOperation.test-d.ts`, `src/preview/index.ts`, `src/preview/simulate/index.ts`, `src/preview/verdictErrors.test.ts`.
Temp root: `.tmp/code-production/verdict-shim-removal/D1-S1` (must be absent at handoff).
Predict: 54 active min / 14 credits.
Of which verification: 8 active min / 2 credits.

##### Tasks

- [ ] VSR_101 — declass parse errors: errors.ts keeps interface+factory; parseOperationCalldata.ts and parsePoolOperationCalldata.ts throw factories; previewOperationErrors.test.ts opens the clean-surface spec (8 min)
<!-- plan:task-meta:{"writes":["src/preview/parse/errors.ts","src/preview/parse/parseOperationCalldata.ts","src/preview/parse/parsePoolOperationCalldata.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":8,"predictedCredits":2,"how":"delete the hasInstance block and as-alias in src/preview/parse/errors.ts, export the unsupportedTarget/unsupportedPoolFunction factories, swap the two throw-new sites, assert both factory payloads","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'unsupportedTarget factory'"} -->
- [ ] VSR_102 — declass zapper: errors.ts exports the unsupportedZapperFunction factory, ZapperContract.ts throws it, previewOperationErrors.test.ts proves the payload (5 min)
<!-- plan:task-meta:{"writes":["src/onchain/market/zapper/errors.ts","src/onchain/market/zapper/ZapperContract.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"same declass move as VSR_101 applied to the zapper family; keep code/message/zapper/functionName fields byte-identical","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'unsupportedZapperFunction factory'"} -->
- [ ] VSR_103 — declass invalidDelayedIntent: errors.ts exports the factory, RedemptionLoggerV310Contract.ts throws it, previewOperationErrors.test.ts proves extraData and cause (5 min)
<!-- plan:task-meta:{"writes":["src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/accounts/withdrawal-compressor/RedemptionLoggerV310Contract.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"same declass move for the withdrawal-compressor family; keep the non-Error cause normalisation exactly as shipped","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'invalidDelayedIntent factory'"} -->
- [ ] VSR_104 — declass errors.ts (unsupportedOperation); detectDelayedOperation.ts throws the factory; detectDelayedOperation.test.ts asserts the code; payload in previewOperationErrors.test.ts (7 min)
<!-- plan:task-meta:{"writes":["src/preview/preview/errors.ts","src/preview/preview/detectDelayedOperation.ts","src/preview/preview/detectDelayedOperation.test.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":7,"predictedCredits":2,"how":"declass the preview/errors.ts family; rewrite the toThrow(class) assertion to the toSatisfy-on-code house pattern","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'unsupportedOperation factory'"} -->
- [ ] VSR_105 — declass previewSimulationFailed in errors.ts, asPreviewSimulationError narrows by code; simulatePoolOperation.test.ts asserts the code; payload in previewOperationErrors.test.ts (7 min)
<!-- plan:task-meta:{"writes":["src/preview/simulate/errors.ts","src/preview/simulate/simulatePoolOperation.test.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":7,"predictedCredits":2,"how":"declass the simulate family; the pass-through check reads code === previewSimulationFailed instead of instanceof; rewrite the rejects.toThrow(class)","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'previewSimulationFailed factory'"} -->
- [ ] VSR_106 — PreviewVerdictError becomes PreviewOperationError: previewOperation.ts exports the compile-total isPreviewOperationError code map; types.ts, PreviewNamespace.ts and previewOperation.test-d.ts follow (8 min)
<!-- plan:task-meta:{"writes":["src/preview/preview/previewOperation.ts","src/sdk/preview/types.ts","src/sdk/preview/PreviewNamespace.ts","src/preview/preview/previewOperation.test-d.ts"],"predictedActiveMinutes":8,"predictedCredits":2,"how":"rename the union; replace the six-way instanceof chain with a Record<PreviewOperationError[\"code\"], true> membership check and export the guard","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'isPreviewOperationError'"} -->
- [ ] VSR_107 — barrels export factories and type-only names: preview/index.ts and simulate/index.ts swap the six exports; verdictErrors.test.ts is deleted; barrel spec lands in previewOperationErrors.test.ts (6 min)
<!-- plan:task-meta:{"writes":["src/preview/index.ts","src/preview/simulate/index.ts","src/preview/verdictErrors.test.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":6,"predictedCredits":2,"how":"value exports become the factories plus isPreviewOperationError, the six interfaces go type-only; the envelope test moves over from the deleted file","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'barrel'"} -->

##### Acceptance criteria

- [ ] bun run agent:typecheck exits 0 — no callable alias remains, every raise site compiles on the factories
- [ ] bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts src/preview/preview/detectDelayedOperation.test.ts src/preview/simulate/simulatePoolOperation.test.ts exits 0 with today's matchObject payloads
- [ ] grep -rn 'Symbol.hasInstance' src returns nothing
- [ ] Commit

##### Results

<!-- plan:results:D1-S1:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S1:end -->
<!-- plan:stage:D1-S1:end -->

<!-- plan:stage:D1-S2:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S1"],"parallelWith":[],"writes":["src/quality/errorSurface.test.ts","src/model/errors.ts","src/onchain/validation/index.ts","src/onchain/validation/checks.ts","src/onchain/accounts/intents/index.ts","src/preview/validate/checkOperation.ts","src/preview/validate/checkOperation.test.ts","src/sdk/GearboxSDK.loading.test.ts","src/sdk/prepare/errors.ts","src/sdk/prepare/types.test-d.ts","src/sdk/prepare/PrepareApi.test.ts","MIGRATION.md"],"tempRoot":".tmp/code-production/verdict-shim-removal/D1-S2","verifyActiveMinutes":4,"verifyCredits":1} -->
#### Stage D1-S2 — Retire the verdict wording

Owner: session-main; Profile: fast; Depends: D1-S1; Parallel with: none.
Writes: `src/quality/errorSurface.test.ts`, `src/model/errors.ts`, `src/onchain/validation/index.ts`, `src/onchain/validation/checks.ts`, `src/onchain/accounts/intents/index.ts`, `src/preview/validate/checkOperation.ts`, `src/preview/validate/checkOperation.test.ts`, `src/sdk/GearboxSDK.loading.test.ts`, `src/sdk/prepare/errors.ts`, `src/sdk/prepare/types.test-d.ts`, `src/sdk/prepare/PrepareApi.test.ts`, `MIGRATION.md`.
Temp root: `.tmp/code-production/verdict-shim-removal/D1-S2` (must be absent at handoff).
Predict: 18 active min / 4 credits.
Of which verification: 4 active min / 1 credits.

##### Tasks

- [ ] VSR_201 — errorSurface.test.ts opens the per-file wording sweep; model/errors.ts, onchain/validation/index.ts and checks.ts reword to refusal vocabulary (5 min)
<!-- plan:task-meta:{"writes":["src/quality/errorSurface.test.ts","src/model/errors.ts","src/onchain/validation/index.ts","src/onchain/validation/checks.ts"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"the quality test greps src per file for /verdict/i (src/quality excluded), plus repo-wide bans on Symbol.hasInstance and new-on-the-six-error-names; then clean its first three files","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'model/errors.ts'"} -->
- [ ] VSR_202 — wording sweep: intents/index.ts, checkOperation.ts, checkOperation.test.ts and GearboxSDK.loading.test.ts drop the retired term for refusal vocabulary (4 min)
<!-- plan:task-meta:{"writes":["src/onchain/accounts/intents/index.ts","src/preview/validate/checkOperation.ts","src/preview/validate/checkOperation.test.ts","src/sdk/GearboxSDK.loading.test.ts"],"predictedActiveMinutes":4,"predictedCredits":1,"how":"comment-only rewording; no behavior or type changes in these four files","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'intents/index.ts'"} -->
- [ ] VSR_203 — wording sweep closes: prepare/errors.ts, types.test-d.ts, PrepareApi.test.ts; MIGRATION.md renames the union to PreviewOperationError (5 min)
<!-- plan:task-meta:{"writes":["src/sdk/prepare/errors.ts","src/sdk/prepare/types.test-d.ts","src/sdk/prepare/PrepareApi.test.ts","MIGRATION.md"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"comment rewording plus the MIGRATION.md preview section: union name, guard name, refusal wording; keep every anchor migrationDocs.test.ts counts","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'prepare/errors.ts'"} -->

##### Acceptance criteria

- [ ] bun run agent:test:backend -- src/quality/errorSurface.test.ts exits 0 — every listed file is clean of the retired term
- [ ] git grep -in verdict -- src returns nothing outside src/quality
- [ ] bun run agent:test:backend -- src/quality/migrationDocs.test.ts exits 0 — the docs count-checks survive the rename
- [ ] Commit

##### Results

<!-- plan:results:D1-S2:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S2:end -->
<!-- plan:stage:D1-S2:end -->

<!-- plan:stage:D1-S3:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S2"],"parallelWith":[],"writes":["docs/plans/verdict-shim-removal.evidence.md","src/quality/errorSurface.test.ts"],"tempRoot":".tmp/code-production/verdict-shim-removal/D1-S3","verifyActiveMinutes":10,"verifyCredits":2} -->
#### Stage D1-S3 — Poison evidence and the gate

Owner: session-main; Profile: fast; Depends: D1-S2; Parallel with: none.
Writes: `docs/plans/verdict-shim-removal.evidence.md`, `src/quality/errorSurface.test.ts`.
Temp root: `.tmp/code-production/verdict-shim-removal/D1-S3` (must be absent at handoff).
Predict: 20 active min / 5 credits.
Of which verification: 10 active min / 2 credits.

##### Tasks

- [ ] VSR_301 — verdict-shim-removal.evidence.md records the code-map poison both ways with quoted diagnostics; errorSurface.test.ts pins the evidence file (10 min)
<!-- plan:task-meta:{"writes":["docs/plans/verdict-shim-removal.evidence.md","src/quality/errorSurface.test.ts"],"predictedActiveMinutes":10,"predictedCredits":3,"how":"poison A adds a fake member to the PreviewOperationError union, poison B removes a real one; quote both tsc failures at the code map, restore byte-exact, pin the file in the quality test","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'evidence'"} -->

##### Acceptance criteria

- [ ] poison A and poison B both break bun run agent:typecheck inside the isPreviewOperationError code map; diagnostics quoted; tree restored byte-exact
- [ ] cold gate: rm -rf node_modules && bun run agent:install && bun run agent:verify:pr exits 0
- [ ] Commit

##### Results

<!-- plan:results:D1-S3:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
<!-- plan:results:D1-S3:end -->
<!-- plan:stage:D1-S3:end -->
<!-- plan:delivery:D1:end -->
<!-- plan:implementation:end -->

<!-- plan:execution:start -->
## Execution log

- lock-spec sha256:d3e90f7ec46be390818eae298608503ada1fdd19346ba9ec22a99be35438114e owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- put-delivery D1

- put-stage D1-S1

- put-stage D1-S2

- put-stage D1-S3
<!-- plan:execution:end -->
