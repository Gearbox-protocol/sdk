# Intent calculator → one computational graph

Status: DONE (2026-08-15). Decisions: scope is the SDK only — the frontend
(`client-v3`) is not migrated; the public `IntentPreviewResult` envelope is unchanged;
`repay` / `close` as start intents are out of scope.

Radical simplification of `src/onchain/accounts/intents` (the SDK intent calculator, successor
of `client-v3/src/core/creditAccounts/intent-calculator`, ~700 KB / 11k lines of logic).

## 1. Starting point

| Area | Logic, lines | Tests / fixtures, lines |
| --- | ---: | ---: |
| `intents/full/*` (5 start intents + open + common + types) | 1 344 | 1 798 |
| `intents/resume/*` (withdraw, decrease-leverage, close) | 329 | 1 431 |
| `operations/*` (13 builder directories) | 579 | — |
| `utils/*` (ledger, router-path, quotas, convert, simulate…) | 965 | 115 |
| `index.ts` (`CreditAccountOperationsService`) + `types.ts` | 441 | 291 |
| `testing/*` (sdk / market / expect mocks) | 1 018 | — |
| **Total** | **~4 700** | **~3 600** |

External contract that **must survive** (consumed by `src/sdk/simulate/SimulateApi.ts`):

- `service.startIntent({intent, creditAccount, sdk, slippage, quotaReserve}) → IntentPreviewResult`
- `service.finishIntent({intent: DelayedIntent, claimable, …}) → IntentPreviewResult`
- `service.openStrategyIntent(props) → OpenStrategyPreviewResult`
- types `StartIntent` (5 variants), `AccountCalculatorOperation`, `AdjustState` / `CloseState`,
  `PreviewErrorReason`, `IntentPreviewError`.

## 2. Diagnosis: why "thousands of lines"

Every intent hand-wove three independent concerns:

1. **The math** — how much value (in underlying) comes in / goes out and how debt moves.
   It is **3 formulas** in total (§3), smeared over 6 files.
2. **Picking the conversion primitive** — identity / RWA wrap / RWA unwrap / router swap
   with a hand-computed `keep = balanceOf − spend`. The `if (rwa && eq(token, rwa.asset))`
   appeared **6 times** (`deposit.ts` ×2, `adjust-leverage.ts` ×2,
   `withdraw-collateral/index.ts`, `resume/decrease-leverage.ts`) plus `convert-amount.ts`.
3. **Assembling op objects** and balance bookkeeping. Start intents did it by hand
   (`balanceOf(...) − spend`), resume flows through `OperationLedger`; then `simulateState`
   re-ran the same ledger a third time with a different `convert`.

Result: `withdraw.ts` — 346 lines and a table of 5 "shapes" for what is mathematically one
formula; `adjust-leverage.ts` — 234 lines, both branches duplicating the RWA logic;
`deposit.ts` — 210 lines, its U→T conversion a copy of adjust's.

## 3. The idea: all the math is 3 formulas, the whole calculator is one chain

Notation (all in underlying `U`): `TVL0`, `D0` debt, `C0 = TVL0 − D0` own funds,
`L` total leverage (`LEVERAGE_DECIMALS`, 300n = 3x), `T` position token, `S` source,
`W` payout.

**Formulas:**

```
debtForLeverage(C, L)  = C · (L − 1)              // debt realising leverage L on collateral C
proportionalDebt(dC)   = D0 · dC / C0             // leverage unchanged ⇒ dD/D0 = dC/C0
price(from, to, x)     = oracle | RWA 1:1 rescale // convertAmount, already existed
```

**Checks (3):** `L ≥ 1x`; `D1 == 0 || minDebt ≤ D1 ≤ maxDebt`; `balance(S) ≥ spend`.

**The universal chain.** Every intent is a subset of one linear sequence of slots:

```
wallet ──add──▶ account ──convert(in→U)──▶ [borrow | repay] ──convert(U→out)──▶ ──withdraw──▶ wallet
```

| Intent | add | in→U | Δdebt | U→out | withdraw |
| --- | --- | --- | --- | --- | --- |
| addCollateral | `(token, a)` | — | 0 | — | — |
| withdrawAsset | — | — | 0 | `U→rwa.asset` (forced unwrap only) | `(token, a)` |
| adjustLeverage ↑ | — | — | `+Δ`, Δ = C0(L1−1) − D0 | `U→T, Δ` | — |
| adjustLeverage ↓ | — | `T→U, |Δ| − idleU` | `−|Δ|` | — | — |
| deposit | `(token, a)` | `token→U, a` (RWA wrap; identity if token=U; skipped if token=T) | `+dD`, dD = L1 ? (C0+aU)(L1−1) − D0 : D0·aU/C0 | `U→T, aU + dD` | — |
| withdraw | — | `S→U, dD` | `−dD`, dD = D0·WU/C0 | `S→T, W` (identity if S=T) | `(T, W, to)` |
| openStrategy | (wallet collateral[]) | — | `+D`, D = C(L−1) | `all→T` (openStrategy path) | — |
| resume.withdraw | claim | `claimed→U` (for debt) | `−min(raised, debtRepaid)` | `claimed→T` | `(T, min(W, got))` |
| resume.decreaseLeverage | claim | `claimed→U, all` | `−raised` | — | — |
| resume.close | claim | (close path) | close | — | close |
| repay (client-v3, not in the SDK yet) | `(funding, a)` | `funding→U` | `−R` | — | — |

So the "computational graph" of an intent is **a row of this table**: which slots are filled
and which formula gives Δdebt. Everything else is one shared executor.

## 4. Target architecture

```
intents/
  math.ts        // collateral(), debtForLeverage(), proportionalDebt(), assert*
  plan.ts        // type Step + planners (pure, sync, no sdk calls)
  view.ts        // AccountView from CreditAccountSlice
  realize.ts     // Step[] → AccountCalculatorOperation[]: ledger walk,
                 // resolve convert → identity|wrap|unwrap|swap, quota, calls
  index.ts       // CreditAccountOperationsService: start/finish/open — thin
  operations.ts  // op vocabulary + builders in one file (was 13 directories)
  utils/         // convert-amount, quotas-for-update, router-path, ledger,
                 // credit-account-slice, pick-token — as before
  types.ts       // public types + StartIntent types + IntentPreviewError
```

### 4.1 `Step` — the plan language

```ts
type Amount = bigint | { raised: true; max?: bigint };   // fixed, or what the previous step produced

type Step =
  | { kind: "add";      token; amount; value? }
  | { kind: "borrow";   amount }
  | { kind: "repay";    amount: Amount; keep?: bigint }   // never more than U on the ledger − keep
  | { kind: "convert";  from; to; amount: Amount }
  | { kind: "withdraw"; token; amount: Amount; to }
  | { kind: "claim";    claimable }
  | { kind: "close";    to };
```

`raised` links steps: the output of the previous `convert` (router min-out / 1:1 wrap) or
`claim` becomes the input of the next one — exactly what used to be done by hand via
`leg.minAmount` and `BigIntMath.min(repay, onAccount + leg.minAmount)`.

### 4.2 Planners (`plan.ts`) — pure functions

Signature: `(intent, view: AccountView) → Step[]`, where `AccountView = { underlying,
rwaAsset?, debt, collateral, band, balanceOf(token), price(from,to,x), fattest(exclude?) }` —
read once in the service. No `await`, no `sdk.*` inside — the math is tested with plain
numbers, no mocks.

Example — withdraw (was 346 lines / 5 branches):

```ts
function planWithdraw(i, v): Step[] {
  const T = i.tokenOut ?? v.underlying, S = i.sourceToken ?? v.fattest();
  const WU = v.price(T, v.underlying, i.amount);            // payout priced in U
  assert(WU > 0 && WU < v.collateral, "insufficientSourceBalance");
  const dD = proportionalDebt(v, WU);
  assertDebtInBand(v.debt − dD, v.band);
  if (eq(T, U)) return [                                     // both flows land in U: one leg
    convert(S, U, price(U, S, WU + dD)),
    repay(dD, keep = W),                                     // payout first, debt takes the rest
    ...payout(U, W),
  ];
  return [
    convert(S, U, price(U, S, dD)),  repay(dD),              // identity if S = U
    convert(S, T, price(U, S, WU)),  ...payout(T, RAISED),   // identity if S = T
  ];
}
```

Identity `convert`s (from = to) are dropped by the executor after a balance check — that is
what collapses the 5-shape table into one list.

### 4.3 Executor (`realize.ts`) — the only place with I/O

```
for step of plan:
  add       → addCollateral;                       ledger += token
  borrow    → increaseDebt;                         ledger.debt += x; U += x
  repay     → decreaseDebt(min(x, U on ledger − keep))
  convert   → from==to        → skip (balance asserted)
              (U↔rwa.asset)   → wrap/unwrap 1:1 (toTargetDecimals)
              otherwise       → router.swap(amount, keep = ledger.balanceOf(from) − amount)
              assert ledger.balanceOf(from) ≥ amount   (one check instead of N assertSourceCovers)
  withdraw  → withdrawCollateral (RWA forced unwrap is an explicit convert step in the plan)
  claim     → claimDelayedWithdrawal;  raised = primary instant output
  close     → close path + closeCreditAccount
then: quotas = getQuotasForUpdate(before, ledger.assets) → changeQuota; calls = flatMap.
```

This merges the former `#preview` + `simulateState` + `getOperationsWithQuotaUpdate`
+ `#resumeContext` + all RWA branching. `OperationLedger` is the single source of state for
both start and resume.

## 5. Removed

- `intents/full/{add-collateral,withdraw-asset,adjust-leverage,deposit,withdraw}/*.ts` →
  rows in `plan.ts`; `full/common.ts` → `math.ts`; `full/types.ts` → `types.ts`;
  `open-strategy.ts` moved up, on `math.ts`.
- `intents/resume/{withdraw,decrease-leverage,close}/*.ts`, `resume/types.ts`
  (`ResumeContext`, `push`) → planners whose first step is `claim`.
- `utils/simulate-adjust-state.ts`, `utils/with-quota-update.ts`,
  `utils/assemble-operation-calls.ts` → inside `realize.ts`.
- `operations/*/index.ts` (13 directories) → one `operations.ts`; RWA forced-unwrap moved
  from `withdraw-collateral` into the plan (`payout` helper).
- Per-intent `amount <= 0` checks → one `assertPositive`.

## 6. Invariants (TDD)

Each is a RED test on plain numbers (no sdk mock) in `plan.test.ts` / `math.test.ts`:

1. `debtForLeverage(C, 1x) = 0`; `debtForLeverage(C, L) + C = C·L`.
2. deposit without `targetLeverage`: `L1 == L0` (up to integer rounding);
   with `targetLeverage`: `D1 = (C0+aU)(L1−1)`; negative dD → `leverageOutOfRange`.
3. withdraw: `(D0−dD)/(C0−WU) == D0/C0` (leverage held); `WU ≥ C0` → error.
4. adjustLeverage: `C1 == C0` (own funds invariant); `L1 < 1x` → error; `Δ = 0` → empty plan.
5. Identity `convert` never reaches the ops (S=U, S=T, token=U).
6. RWA: any `convert(U↔rwa.asset)` is a 1:1 rescale, no router; withdrawing `U` on an RWA
   market always yields `[unwrap, withdrawCollateral(rwa.asset)]`.
7. `repay` never exceeds `min(requested, U on the ledger after conversion − keep)`.
8. Any plan: source balance ≥ spend, otherwise `insufficientSourceBalance` — checked in one
   place in realize.
9. Debt band: `D1 ∉ {0} ∪ [minDebt, maxDebt]` → `debtOutOfRange` for every intent.
10. Existing `*.onchain.test.ts` (ops / calls / TVL / debt per fixture) pass with unchanged
    expectations — the regression barrier.

## 7. Stages

1. `math.ts` + invariant tests 1–4, 9 (RED → GREEN).
2. `Step` + `plan.ts` for the 5 start intents and the 3 resume tails; `plan.test.ts`.
3. `realize.ts` + `view.ts`; wired into the service instead of `#preview`; existing onchain
   tests as the regression barrier.
4. Old builders removed (`full/`, `resume/`, `simulate-*`, `with-quota-update`).
5. Types merged, `operations/` collapsed, tests relocated to `tests/`.

## 8. Verification

- `vitest --project unit src/onchain/accounts/intents src/sdk/simulate` — new unit tests +
  every existing onchain suite.
- `tsc --noEmit` / biome — repo config.
- `SimulateApi` tests (`src/sdk/simulate`) with unchanged expectations.

## 9. Result (2026-08-15)

Final layout of `src/onchain/accounts/intents/`:

| File | Lines | Role |
| --- | ---: | --- |
| `math.ts` | 76 | 3 formulas + 2 checks |
| `plan.ts` | 400 | `Step`, `AccountView`, 5 start planners + 3 resume tails |
| `view.ts` | 41 | `AccountView` from `CreditAccountSlice` |
| `realize.ts` | 272 | the one async walk: ledger + router + RWA + quota + calls |
| `index.ts` | 248 | service — a switch over planners |
| `open-strategy.ts` | 189 | essentially unchanged, on `math.ts` |
| `operations.ts` | 417 | op vocabulary (was 13 directories, 579 lines) |
| `types.ts` | 280 | public types + `StartIntent`, `IntentPreviewError` |
| `utils/` | ~900 | ledger, router-path, quotas, convert, slice, pick-token |

| | Logic | Tests / fixtures | Total | Files |
| --- | ---: | ---: | ---: | ---: |
| `client-v3` intent-calculator (agentic-rwa) | **11 073** | 13 247 | 24 320 | 174 |
| SDK before (`intent-calculator` commit) | 3 660 | ~3 600 | ~7 300 | ~75 |
| **SDK now** | **2 740** | 4 672 | 7 412 | 44 |

Intent logic proper (`full/` + `resume/` + `index.ts` = 2 114 lines) → `math + plan + view +
realize + index + open-strategy` = 1 226 lines; of those, 517 are pure math / plans testable
without an sdk mock (`math.test.ts`, `plan.test.ts`, 23 tests). All 12 regression onchain
suites (`tests/`, 75 tests) pass with unchanged expectations.

Deviations from §4 as first drafted: `view.ts` split out (planners stay sdk-free);
`ResumeContext/push` replaced by a leading `claim` step; onchain tests and fixtures gathered
under `tests/`.
