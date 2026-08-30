# Preview errors cleanup: shims out, PreviewOperationError in

Status: APPROVED
Spec lock: sha256:a406b8f13e450953c794a91f35bd2873ccc197b085b1050a8608a1823b367d7f owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 2 findings)
Implementation lock: sha256:c4269923919c42d605fc21c20d8ab69d7f19289e33a603970de938207ff5b266 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)
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
  (simulate/errors.ts:81) + the direct call
  `UnsupportedOperationError(operation.operation)` (previewOperation.ts:127)
  + the value re-export of the zapper alias (parse/errors.ts:6).
- Narrowing via the shimmed `instanceof`: the six-way chain in
  `isPreviewVerdict` (previewOperation.ts:53-69) and the pass-through in
  `asPreviewSimulationError` (simulate/errors.ts:77).
- Tests keying on the shim: `verdictErrors.test.ts` (the whole file is the
  shim's spec — legacy `new`, `instanceof` matching),
  `detectDelayedOperation.test.ts:144` `toThrow(Class)`,
  `simulatePoolOperation.test.ts:195` `rejects.toThrow(Class)`.
- The word "verdict": 21 src files + MIGRATION.md — the preview section
  plus the compat and dispositions tables (lines 219/436/444); the
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
   (`Record<PreviewOperationError["code"], true>`) instead of `instanceof`:
   membership via `Object.hasOwn` after object/`code` narrowing, so
   prototype keys like `toString` never pass — union drift breaks the
   build inside the map.
3. **Raise sites** call the factories: `throw unsupportedTarget(to)` etc.;
   `asPreviewSimulationError` passes through on the `code` check and builds
   via `previewSimulationFailed(...)`.
4. **Tests**: `verdictErrors.test.ts` → `previewOperationErrors.test.ts`,
   rewritten as the clean-surface spec — every factory's answer is pinned
   exactly (`toEqual`: message, optional-field presence, cause, failures),
   the guard accepts all six codes and rejects genuine `Error`s,
   primitives, `null`, unknown codes and prototype keys, the barrel
   exports factories and no callable class aliases. The two `toThrow(Class)` assertions become code
   assertions (the house `toSatisfy` pattern from throwSweep).
5. **Barrels**: preview/index.ts and simulate/index.ts export the factories
   plus `type`-only interfaces; sdk/preview/types.ts and
   PreviewNamespace.ts follow the union rename.
6. **Docs**: MIGRATION.md renames the union and drops the verdict wording
   in every section — the preview section plus the stray mentions in the
   compat and dispositions tables; comments across the touched files
   reword to the sdk's own refusal vocabulary.

# Testable invariants

- I1. Grep-zero, enforced by a quality test that builds the banned tokens
  from fragments so nothing is exempt: no `Symbol.hasInstance` in src, no
  `new` on the six error names, no `verdict` (case-insensitive) in src or
  MIGRATION.md.
- I2. The guard's code map is compile-total: a member added to or removed
  from `PreviewOperationError` breaks the build inside the map — poison
  evidence both ways, quoted diagnostics, restored byte-exact.
- I3. Behavior unchanged: `previewOperation` still answers `sdkErr` with
  the same codes and fields — the per-factory assertions pin the exact
  shipped objects (`toEqual`), and the envelope test still passes.
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

Branch: `feat/verdict-shim-removal`; Depends: none; Gate: cold gate: rm -rf node_modules, bun run agent:install, bun run agent:verify:pr exits 0, poison evidence: code-map totality broken both ways, diagnostics quoted, restored byte-exact (docs/plans/verdict-shim-removal.evidence.md), grep-zero in src and MIGRATION.md: Symbol.hasInstance, new on the six error names, verdict wording (src/quality/errorSurface.test.ts green), previewOperation answers the same codes and fields as on next (exact toEqual payloads in previewOperationErrors.test.ts).

Stage graph: `S1 -> S2 -> S3 (sequential: rename feeds the wording sweep, the sweep feeds the gate)`.

<!-- plan:stage:D1-S1:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":[],"parallelWith":[],"writes":["src/preview/parse/errors.ts","src/preview/parse/parseOperationCalldata.ts","src/preview/parse/parsePoolOperationCalldata.ts","src/preview/previewOperationErrors.test.ts","src/onchain/market/zapper/errors.ts","src/onchain/market/zapper/ZapperContract.ts","src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/accounts/withdrawal-compressor/RedemptionLoggerV310Contract.ts","src/preview/preview/errors.ts","src/preview/preview/detectDelayedOperation.ts","src/preview/preview/detectDelayedOperation.test.ts","src/preview/simulate/errors.ts","src/preview/simulate/simulatePoolOperation.test.ts","src/preview/preview/previewOperation.ts","src/sdk/preview/types.ts","src/sdk/preview/PreviewNamespace.ts","src/preview/preview/previewOperation.test-d.ts","src/preview/index.ts","src/preview/simulate/index.ts","src/preview/verdictErrors.test.ts"],"tempRoot":".tmp/code-production/verdict-shim-removal/D1-S1","verifyActiveMinutes":8,"verifyCredits":2} -->
#### Stage D1-S1 — Declass the six preview errors

Owner: session-main; Profile: fast; Depends: none; Parallel with: none.
Writes: `src/preview/parse/errors.ts`, `src/preview/parse/parseOperationCalldata.ts`, `src/preview/parse/parsePoolOperationCalldata.ts`, `src/preview/previewOperationErrors.test.ts`, `src/onchain/market/zapper/errors.ts`, `src/onchain/market/zapper/ZapperContract.ts`, `src/onchain/accounts/withdrawal-compressor/errors.ts`, `src/onchain/accounts/withdrawal-compressor/RedemptionLoggerV310Contract.ts`, `src/preview/preview/errors.ts`, `src/preview/preview/detectDelayedOperation.ts`, `src/preview/preview/detectDelayedOperation.test.ts`, `src/preview/simulate/errors.ts`, `src/preview/simulate/simulatePoolOperation.test.ts`, `src/preview/preview/previewOperation.ts`, `src/sdk/preview/types.ts`, `src/sdk/preview/PreviewNamespace.ts`, `src/preview/preview/previewOperation.test-d.ts`, `src/preview/index.ts`, `src/preview/simulate/index.ts`, `src/preview/verdictErrors.test.ts`.
Temp root: `.tmp/code-production/verdict-shim-removal/D1-S1` (must be absent at handoff).
Predict: 61 active min / 15 credits.
Of which verification: 8 active min / 2 credits.

##### Tasks

- [x] VSR_101 — declass parse errors: errors.ts keeps interface+factory; parseOperationCalldata.ts and parsePoolOperationCalldata.ts throw factories; previewOperationErrors.test.ts opens the clean-surface spec (9 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes":["src/preview/parse/errors.ts","src/preview/parse/parseOperationCalldata.ts","src/preview/parse/parsePoolOperationCalldata.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":9,"predictedCredits":2,"how":"delete the hasInstance block and as-alias in src/preview/parse/errors.ts, export the unsupportedTarget/unsupportedPoolFunction factories, make the zapper-alias re-export a factory + type-only pair, swap the two throw-new sites, pin both payloads with toEqual","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'unsupportedTarget factory'"} -->
- [x] VSR_102 — declass zapper: errors.ts exports the unsupportedZapperFunction factory, ZapperContract.ts throws it, previewOperationErrors.test.ts proves the payload (5 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes":["src/onchain/market/zapper/errors.ts","src/onchain/market/zapper/ZapperContract.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"same declass move as VSR_101 applied to the zapper family; the payload is pinned exactly with toEqual (code, message, zapper, functionName)","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'unsupportedZapperFunction factory'"} -->
- [x] VSR_103 — declass invalidDelayedIntent: errors.ts exports the factory, RedemptionLoggerV310Contract.ts throws it, previewOperationErrors.test.ts proves extraData and cause (5 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes":["src/onchain/accounts/withdrawal-compressor/errors.ts","src/onchain/accounts/withdrawal-compressor/RedemptionLoggerV310Contract.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"same declass move for the withdrawal-compressor family; keep the non-Error cause normalisation exactly as shipped; toEqual pins extraData and cause presence/absence","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'invalidDelayedIntent factory'"} -->
- [x] VSR_104 — declass errors.ts (unsupportedOperation); detectDelayedOperation.ts throws the factory; detectDelayedOperation.test.ts asserts the code; payload in previewOperationErrors.test.ts (7 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes":["src/preview/preview/errors.ts","src/preview/preview/detectDelayedOperation.ts","src/preview/preview/detectDelayedOperation.test.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":7,"predictedCredits":2,"how":"declass the preview/errors.ts family; rewrite the toThrow(class) assertion to the toSatisfy-on-code house pattern; toEqual pins the payload","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'unsupportedOperation factory'"} -->
- [x] VSR_105 — declass previewSimulationFailed in errors.ts, asPreviewSimulationError narrows by code; simulatePoolOperation.test.ts asserts the code; payload in previewOperationErrors.test.ts (7 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes":["src/preview/simulate/errors.ts","src/preview/simulate/simulatePoolOperation.test.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":7,"predictedCredits":2,"how":"declass the simulate family; the pass-through narrows object/null-safely and compares code === \"previewSimulationFailed\" (string literal), matching objects pass through by identity, primitives/null/non-matching normalise; rewrite the rejects.toThrow(class); toEqual pins failures and cause","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'previewSimulationFailed factory'"} -->
- [x] VSR_106 — PreviewVerdictError becomes PreviewOperationError: previewOperation.ts exports the compile-total isPreviewOperationError guard (Object.hasOwn map); guard spec in previewOperationErrors.test.ts (10 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes": ["src/preview/preview/previewOperation.ts", "src/preview/previewOperationErrors.test.ts"], "predictedActiveMinutes": 10, "predictedCredits": 2, "how": "rename the union; membership via Object.hasOwn on a Record<PreviewOperationError[\"code\"], true> after object/code narrowing; export the guard; swap the direct UnsupportedOperationError(operation.operation) call (:127) to the factory; guard tests: all six codes accepted; genuine Error, primitives, null, unknown code, toString/constructor rejected", "red": "bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'isPreviewOperationError'"} -->
- [x] VSR_108 — the union rename follows through: sdk/preview/types.ts and PreviewNamespace.ts import PreviewOperationError; previewOperation.test-d.ts probes the renamed union (4 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes": ["src/sdk/preview/types.ts", "src/sdk/preview/PreviewNamespace.ts", "src/preview/preview/previewOperation.test-d.ts"], "predictedActiveMinutes": 4, "predictedCredits": 1, "how": "mechanical rename of the type imports and the test-d probe; no runtime change", "red": "bun run agent:test:backend -- src/preview/preview/previewOperation.test-d.ts"} -->
- [x] VSR_107 — barrels export factories and type-only names: preview/index.ts and simulate/index.ts swap the six exports; verdictErrors.test.ts is deleted; barrel spec lands in previewOperationErrors.test.ts (6 min) — 3b570b421f2790cd50f4ae4e971a207af4e2f10a
<!-- plan:task-meta:{"writes":["src/preview/index.ts","src/preview/simulate/index.ts","src/preview/verdictErrors.test.ts","src/preview/previewOperationErrors.test.ts"],"predictedActiveMinutes":6,"predictedCredits":2,"how":"value exports become the factories plus isPreviewOperationError, the six interfaces go type-only; the envelope test moves over from the deleted file","red":"bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts -t 'barrel'"} -->

##### Acceptance criteria

- [ ] bun run agent:typecheck exits 0 — no callable alias remains, every raise site compiles on the factories
- [ ] bun run agent:test:backend -- src/preview/previewOperationErrors.test.ts src/preview/preview/detectDelayedOperation.test.ts src/preview/simulate/simulatePoolOperation.test.ts exits 0 with exact toEqual payloads pinned from the shipped objects
- [ ] grep -rn 'Symbol.hasInstance' src returns nothing
- [x] Commit — 38e5299bbc63999443e04ed2943f421d40717cc7

##### Results

<!-- plan:results:D1-S1:start -->
| Task | Commit | UTC start-end | Active / elapsed | Usage | Result / proof |
|---|---|---|---:|---|---|
| VSR_101 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_102 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_103 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_104 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_105 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_106 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_108 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
| VSR_107 | 3b570b421f2790cd50f4ae4e971a207af4e2f10a | 2026-08-30T12:39:12.865Z–2026-08-30T12:50:53.000Z | 11 / 12 min | unavailable: runner did not expose usage | Six errors declassed to interface+factory; hasInstance shims, as-aliases and new-raises gone; PreviewOperationError union + exported Object.hasOwn guard; 34 tests green, typecheck clean, grep-zero hasInstance. |
<!-- plan:results:D1-S1:end -->
<!-- plan:stage:D1-S1:end -->

<!-- plan:stage:D1-S2:start -->
<!-- plan:stage-meta:{"deliveryId":"D1","depends":["D1-S1"],"parallelWith":[],"writes":["src/quality/errorSurface.test.ts","src/model/errors.ts","src/onchain/validation/index.ts","src/onchain/validation/checks.ts","src/onchain/accounts/intents/index.ts","src/preview/validate/checkOperation.ts","src/preview/validate/checkOperation.test.ts","src/sdk/GearboxSDK.loading.test.ts","src/sdk/prepare/errors.ts","src/sdk/prepare/types.test-d.ts","src/sdk/prepare/PrepareApi.test.ts","MIGRATION.md"],"tempRoot":".tmp/code-production/verdict-shim-removal/D1-S2","verifyActiveMinutes":4,"verifyCredits":1} -->
#### Stage D1-S2 — Retire the verdict wording

Owner: session-main; Profile: fast; Depends: D1-S1; Parallel with: none.
Writes: `src/quality/errorSurface.test.ts`, `src/model/errors.ts`, `src/onchain/validation/index.ts`, `src/onchain/validation/checks.ts`, `src/onchain/accounts/intents/index.ts`, `src/preview/validate/checkOperation.ts`, `src/preview/validate/checkOperation.test.ts`, `src/sdk/GearboxSDK.loading.test.ts`, `src/sdk/prepare/errors.ts`, `src/sdk/prepare/types.test-d.ts`, `src/sdk/prepare/PrepareApi.test.ts`, `MIGRATION.md`.
Temp root: `.tmp/code-production/verdict-shim-removal/D1-S2` (must be absent at handoff).
Predict: 19 active min / 4 credits.
Of which verification: 4 active min / 1 credits.

##### Tasks

- [ ] VSR_201 — errorSurface.test.ts opens the per-file wording sweep; model/errors.ts, onchain/validation/index.ts and checks.ts reword to refusal vocabulary (5 min)
<!-- plan:task-meta:{"writes":["src/quality/errorSurface.test.ts","src/model/errors.ts","src/onchain/validation/index.ts","src/onchain/validation/checks.ts"],"predictedActiveMinutes":5,"predictedCredits":1,"how":"the quality test builds the banned tokens from fragments (no self-exemption), greps src per file and MIGRATION.md for /verdict/i, plus repo-wide bans on Symbol.hasInstance and new-on-the-six-error-names; then clean model/errors.ts, onchain/validation/index.ts, checks.ts","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'model/errors.ts'"} -->
- [ ] VSR_202 — wording sweep: intents/index.ts, checkOperation.ts, checkOperation.test.ts and GearboxSDK.loading.test.ts drop the retired term for refusal vocabulary (4 min)
<!-- plan:task-meta:{"writes":["src/onchain/accounts/intents/index.ts","src/preview/validate/checkOperation.ts","src/preview/validate/checkOperation.test.ts","src/sdk/GearboxSDK.loading.test.ts"],"predictedActiveMinutes":4,"predictedCredits":1,"how":"comment-only rewording; no behavior or type changes in these four files","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'intents/index.ts'"} -->
- [ ] VSR_203 — wording sweep closes: prepare/errors.ts, types.test-d.ts, PrepareApi.test.ts; MIGRATION.md drops the term in every section and renames the union (6 min)
<!-- plan:task-meta:{"writes":["src/sdk/prepare/errors.ts","src/sdk/prepare/types.test-d.ts","src/sdk/prepare/PrepareApi.test.ts","MIGRATION.md"],"predictedActiveMinutes":6,"predictedCredits":1,"how":"comment rewording plus MIGRATION.md whole-file: union and guard rename, the preview section and the stray mentions in the compat (219) and dispositions (436, 444) tables; keep every anchor migrationDocs.test.ts counts","red":"bun run agent:test:backend -- src/quality/errorSurface.test.ts -t 'prepare/errors.ts'"} -->

##### Acceptance criteria

- [ ] bun run agent:test:backend -- src/quality/errorSurface.test.ts exits 0 — every listed file is clean of the retired term
- [ ] git grep -in verdict -- src MIGRATION.md returns nothing
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

- replace-stage D1-S1

- replace-stage D1-S2

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 1 REAL findings) sha256:1d1e4414b7237072b31c3cd8da6accdaf2cd1add08b2f77492c16f2c60e17e7b

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 1 REAL findings) sha256:43401b8f881bab7ff5ae108f66ce63779143603a75f3ebd8c8ee8e3198846170

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 1 REAL findings) sha256:0b11803ffa7ba6cf19befafaf081403a7a2250b47f1906702232340480075c9d

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 1 REAL findings) sha256:4923c0e3ff08075c01b364a408776f8e32f482f62d39cb4b14b0104693da8b03

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 1 REAL findings) sha256:0544cccaffe84a7331054b2b999ef9e852896505b2ee03c32ee5a9aa1f2ceedf

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 1 REAL findings) sha256:2485eb8f1a52977422f865812e17c53cd517c06667755b44765b68899fe40245

- approve sha256:46f39ade76d8e9a5a392add0befc0a0fc243876bb45540d504595421781d82a7 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- amend implementation owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 2 findings) sha256:2186ecaf1f49b91cfb29e147c84af701413653f954d54d500ef37243d728860a

- amend implementation owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 2 findings) sha256:c4269923919c42d605fc21c20d8ab69d7f19289e33a603970de938207ff5b266

- amend spec owner:let plan, review and start. I approve all stages (owner, 2026-08-30; applying codex round 2 findings) sha256:a406b8f13e450953c794a91f35bd2873ccc197b085b1050a8608a1823b367d7f

- approve sha256:c4269923919c42d605fc21c20d8ab69d7f19289e33a603970de938207ff5b266 owner:let plan, review and start. I approve all stages, wanna check the last commit - it should return the same dicctionary as it was 0 just shange some tests and types where needed (owner, 2026-08-30)

- record-result D1-S1 commit:3b570b421f2790cd50f4ae4e971a207af4e2f10a

- close D1-S1 partial commit:38e5299bbc63999443e04ed2943f421d40717cc7
<!-- plan:execution:end -->
