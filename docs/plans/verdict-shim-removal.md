# Preview errors cleanup: shims out, PreviewOperationError in

Status: SPEC_DRAFT
Spec lock: unlocked
Implementation lock: unlocked
Active Delivery: none
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
<!-- plan:implementation:end -->

<!-- plan:execution:start -->
## Execution log
<!-- plan:execution:end -->
