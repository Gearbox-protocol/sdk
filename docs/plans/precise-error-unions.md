# Per-method error unions in sdk

Status: SPEC_DRAFT
Spec lock: unlocked
Implementation lock: unlocked
Active Delivery: none
Unattended decisions: allowed

<!-- plan:spec:start -->
# Goal

Every refusable function of the sdk `prepare` namespace answers with a flat,
per-method-precise union — `Promise<XResult | Error1 | ... | ErrorN>` — where
the error list is exactly the set that method can produce, proven by the
engine trace and locked by type tests. The colleague's half-landed branch
(`next` @ 7d00fb38) builds again, its `WithError`/blanket-`PrepareError`
envelope is replaced, result types carry the `Result` suffix, and
`DataResponse` disappears from single-chain prepare signatures (block
provenance moves onto the result). Errors are plain discriminated objects —
the old classes' well-described content survives, the class wrappers do not.

# Owner requirements (verbatim intent)

1. Signature must enumerate: `): Result | Error1 | ... | ErrorN` per method —
   not a blanket 18-member union on every method.
2. All result types end in `Result`.
3. No `DataResponse` on prepare: single-chain, single-source; the envelope
   carries nothing there. Multi-chain reads keep it.
4. Old sdk errors were well described — keep the content, drop the classes.
5. client-v3 must not silently break: the rename impact is enumerated by its
   compiler (7 files / 31 mentions, chokepoint `hooks/sdk/index.tsx`), and the
   client migration is its own follow-up Delivery.

# Design

## Error objects (extends colleague's model, declassed)

```ts
// model/errors.ts — keep IGearboxError { code, message, cause? } as the base.
// Add the one guard a flat union needs:
export function isGearboxError(value: object): value is IGearboxError;
// WithError<D, E> is REMOVED — the flat union replaces it.
```

One interface per code stays (colleague's `src/sdk/prepare/errors.ts`
content), tightened where the trace proves shapes narrower:

- `MarketPausedError` from prepare always carries `creditManager` (the pool
  variant is preview-only).
- `InsufficientPoolLiquidityError.binding` excludes `"poolDebtLimit"` in
  prepare (borrowable() weighs three ceilings).
- `poolSunset` / `quotaCountExceeded` / `malformedTransaction` leave the
  prepare vocabulary entirely — they are raisable only by
  `preview/validate/checkOperation`.

## Results

`LpPlan/StrategyPlan/OpenStrategyPlan/DelayedStrategyPlan/StrategyRoutes` →
`LpResult / StrategyResult / OpenStrategyResult / DelayedStrategyResult /
StrategyRoutesResult`, each gaining `blockNumber: number` and
`timestamp: Timestamp` (the surviving payload of `DataResponse.meta`).

## Signatures (per-method unions, named aliases)

Each method gets a named union alias declared beside the interface, so the
signature stays readable while the alias enumerates exactly (owner may veto
in favour of inline unions — flagged decision):

```ts
export type DepositStrategyError =
  | DebtOutOfRangeError | ForbiddenTokenError | InsufficientCollateralError
  | InsufficientPoolLiquidityError | InsufficientSourceBalanceError
  | LeverageOutOfRangeError | MarketExpiredError | MarketPausedError
  | QuotaLimitReachedError | UnsupportedCollateralTokenError
  | UnsupportedTokenPairError;

depositStrategy(position, params): Promise<StrategyResult | DepositStrategyError>;
```

Per-method sets, from the engine trace (audit table, file:line-backed):

| method | codes |
|---|---|
| deposit / withdraw / redeem (LP) | unsupportedTokenPair (1) |
| openNewStrategy | 10: debtOutOfRange, forbiddenToken, insufficientCollateral, insufficientPoolLiquidity, insufficientSourceBalance, leverageOutOfRange, marketExpired, marketPaused, quotaLimitReached, unsupportedTokenPair |
| depositStrategy | 11: + unsupportedCollateralToken, − none |
| repayStrategy | 8: debtOutOfRange, forbiddenToken, insufficientCollateral, insufficientSourceBalance, marketExpired, marketPaused, quotaLimitReached, unsupportedCollateralToken |
| addCollateral / withdrawCollateral | 6: forbiddenToken, insufficientCollateral, insufficientSourceBalance, marketExpired, marketPaused, quotaLimitReached |
| withdrawStrategy | 11: + multipleDelayedWithdrawals, noDelayedRoute, withdrawalInProgress, debtOutOfRange, unsupportedTokenPair − insufficientPoolLiquidity |
| adjustLeverage | 13 (widest): withdrawStrategy's + insufficientPoolLiquidity + leverageOutOfRange |
| finalize | 10: plumbing 6 + noDelayedRoute, noRecordedIntent, withdrawalInProgress, unsupportedTokenPair |
| maxWithdraw / maxRepay / maxWithdrawCollateral / leverageBand / withdrawableCollaterals | not refusable — plain values, no envelope |

Routes methods (`withdrawStrategy`, `adjustLeverage`): the routes error keeps
`refused: RouteRefusals`, with `refused.instant` / `refused.delayed` narrowed
to that route's own reason set.

## Boundary and engine

The engine's `PreviewIssue`/`refuse()`/`IntentPreviewError` machinery stays
unchanged — `PrepareApi` remains the single conversion boundary
(`toPrepareError` becomes per-method-typed). Thrown exceptions keep their
meaning: bugs and outages throw, verdicts return.

# Also in scope: finish the colleague's branch (it does not build)

1. `creditOperationMarket` missing from `market/credit/index.ts` barrel
   (breaks LiquidationsService and buildDelayedStrategyVerify).
2. Complete the half-landed preview rewire: `preview/index.ts` and
   `previewOperation.ts` still wire the OLD files; the new `*Verify` files
   have zero importers; two old files have no new counterpart and get the
   7-name rename map applied in place.
3. Removed fields still assigned: `targetCollateral` ×6, `underlyingToken`
   ×2 (`CreditSuite.ts:292`, `previewPoolPositionOperation.ts:27`),
   `estClaimableAt` ×1.
4. Flagged behaviour deltas in the new Verify files, resolved conservatively:
   keep `accountStrategyName` for the preview `name` (the new files silently
   change the string), and drop the gratuitous `async` on replay calls
   (`replayMulticall` is synchronous). Deviation-recorded if the colleague
   objects.
5. `unrun` added to devDependencies — tsdown cannot load its TS config
   without it and the build fails on a clean install.

# Constraints

- Branch `feat/precise-error-unions` from `origin/next` — the colleague's
  commit stays in history untouched; we build on top, never rewrite.
- Engine internals (`src/onchain/accounts/intents/**`,
  `onchain/validation/refusal.ts`) unchanged except where a per-method
  raise-site audit finding requires a comment; `guards.onchain.test.ts`
  passes untouched.
- Multi-chain reads (`positions.list`, `opportunities.list`, totals, charts)
  keep `DataResponse` — out of scope.
- Preview namespace's own return-shape migration (checkOperation etc. to
  flat unions) is a follow-up Delivery, not this one; preview keeps
  `PreviewIssue | null`.
- client-v3 changes are a follow-up Delivery; this one ships the rename map
  and MIGRATION.md so that migration is mechanical.
- Process prerequisite: sdk has no `agent:*` scripts — add the seven
  contract aliases (test lanes → vitest projects, verify:pr → check:ci +
  typecheck:ci + test).
- Node 22 for vitest; sdk's own tsc 7 for typecheck:ci.

# Reuse

- Colleague's `IGearboxError`, per-code interfaces, `MESSAGES` table,
  `toPrepareError` adapter (retyped), MIGRATION.md §"prepare answers in the
  SDK's error envelope" (extended, not rewritten).
- `refusal.test-d.ts` as the precedent for exact-union type tests; vitest
  `typecheck.include` already wired.
- `previewMatchesPrepare.test.ts` as the drift harness between the two
  vocabularies.
- e2e `prepare-execute.test.ts` assertions (rewritten by the colleague to
  `success/error.code`) migrate to flat unions.

# Testable invariants

- I1. Per-method exactness: a `src/sdk/prepare/types.test-d.ts` proves each
  method's awaited return equals `XResult | <exact union>` via
  `expectTypeOf().toEqualTypeOf<>()` — a code added to or removed from a
  method's real raise set fails typecheck until the alias moves.
- I2. `poolSunset` / `quotaCountExceeded` / `malformedTransaction` are not
  assignable to any prepare return (negative type test).
- I3. The branch builds: `tsdown` exits 0 and `typecheck:ci` is clean on a
  fresh install.
- I4. Engine untouched: `guards.onchain.test.ts` and
  `previewMatchesPrepare.test.ts` pass without edits to their assertions on
  engine shapes.
- I5. No `DataResponse` in any prepare signature; every `*Result` carries
  `blockNumber`/`timestamp`; multi-chain read signatures byte-identical.
- I6. `isGearboxError` narrows the flat union in both directions (type test
  + runtime test), and no `*Result` type structurally matches it.
- I7. Prepare error shapes are narrowed per the trace: `MarketPausedError`
  (prepare) has no `pool` variant; `binding` excludes `poolDebtLimit`
  (type tests).
- I8. Existing prepare error-path tests (`PrepareApi.test.ts:332,421`, e2e
  `prepare-execute.test.ts` refusal describe-block) assert the flat shape
  and pass.
- I9. MIGRATION.md documents the per-method table, the `*Result` renames,
  the `DataResponse` removal on prepare, and the client-v3 rename map
  (7 files / 31 mentions known).
- I10. No Error subclass is constructed for a refusal on any prepare path;
  classes that remain thrown are the audited bug/outage list.

# Success metrics

- Poison: adding a fake member to one method's union alias without a raise
  site is caught by the exactness type test (and vice versa).
- `PrepareError`-the-blanket no longer exists; grep finds no
  `WithError<` in src.
- Unit suite + type tests green; build artifact produced.

# Non-goals

- No preview-namespace flat-union migration; no client-v3 edits; no
  publishing/version bump; no engine redesign; no changes to multi-chain
  read envelopes.
<!-- plan:spec:end -->

<!-- plan:implementation:start -->
## Implementation contract
<!-- plan:implementation:end -->

<!-- plan:execution:start -->
## Execution log
<!-- plan:execution:end -->
