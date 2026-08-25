# Withdraw from a strategy

`prepare.withdrawStrategy` → `intentRoutes({ type: "WITHDRAW" })` →
`planWithdraw` ([`plan.ts`](../../src/sdk/accounts/intents/plan.ts)).

Value leaves the account and the debt shrinks in proportion, so leverage holds —
unless the request is for everything, which is an exit and has no leverage left
to hold. Both the router route and the redemption route are quoted; the delayed
half lives in [delayed.md](./delayed.md).

## Math

```text
W       = amount, denominated in T (the payout token)
Wᵤ      = price(T → U, W)
exit    ⟺ W == MAX_UINT256  or  Wᵤ >= C0
dD      = D0 · Wᵤ / C0                   partial: keeps leverage flat
require D0 − dD in band                  else debtOutOfRange
raise   = Wᵤ + dD of U from S            when T == U
        = dD of U, then Wᵤ worth of T    when T ≠ U
```

`maxWithdraw` is the ceiling of the partial flow: the largest `W` whose
proportional repayment still leaves `D0 − dD >= minDebt`, capped at `C0 − 1`.

```mermaid
flowchart LR
  z["W = 0"] --> a["0 < W <= maxWithdraw<br/>partial, leverage held"]
  a --> b["maxWithdraw < W < C0<br/>refused: debtOutOfRange<br/>the leftover loan would sit below minDebt"]
  b --> c["W >= C0, or MAX_UINT256<br/>exit: account emptied"]
```

## Case selection

```mermaid
flowchart TD
  in["withdrawStrategy: amount W, to, tokenOut T?, sourceToken S?"]
  pos{"W > 0?"}
  max{"W == MAX_UINT256?"}
  wu["Wᵤ = price(T → U, W)"]
  pr{"Wᵤ > 0?"}
  net{"Wᵤ >= C0?"}
  hasv{"C0 > 0?"}
  dd["dD = D0 · Wᵤ / C0"]
  band{"D0 − dD in band?"}
  tu{"T == U?"}
  exit["EXIT plan"]
  p1["PARTIAL, payout in U"]
  p2["PARTIAL, payout in another token"]

  in --> pos
  pos -->|"no"| e1["insufficientSourceBalance"]
  pos --> max
  max -->|"yes"| hasv
  max -->|"no"| wu --> pr
  pr -->|"no"| e2["insufficientSourceBalance"]
  pr --> net
  net -->|"yes"| hasv
  hasv -->|"no"| e3["insufficientSourceBalance<br/>the debt has eaten the net value"]
  hasv --> exit
  net -->|"no"| dd --> band
  band -->|"no"| e4["debtOutOfRange"]
  band --> tu
  tu -->|"yes"| p1
  tu -->|"no"| p2
```

`S` defaults to the account's most valuable non-phantom balance; `T` defaults to
the market underlying.

## Partial, payout in the underlying (`T == U`)

One leg raises payout and repayment together; the repayment is told to keep `W`
back so the payout is not spent on the debt.

```mermaid
flowchart TD
  s["steps: convert(S → U, price(U → S, Wᵤ + dD)), repay(dD, keep W), payout(U, W)"]
  s --> c1["swap: S → U, input priced for Wᵤ + dD"]
  c1 --> c2["decreaseDebt(min(dD, U balance − W))"]
  c2 --> r{"RWA market?"}
  r -->|"no"| c3["withdrawCollateral(U, W, to)"]
  r -->|"yes"| c4["unwrapRwaCollateral(U → asset, W)"] --> c5["withdrawCollateral(asset, raised, to)"]
  c3 --> q["updateQuota(S, −) sized to the balance left"]
  c5 --> q
```

When `S == U` the swap is an identity convert and disappears: the plan becomes
`decreaseDebt` + `withdrawCollateral` out of idle underlying.

## Partial, payout in another token (`T ≠ U`)

Two legs, because the debt wants `U` and the wallet wants `T`.

```mermaid
flowchart TD
  s["steps: convert(S → U, price(U → S, dD)), repay(dD),<br/>convert(S → T, price(U → S, Wᵤ)), payout(T, raised)"]
  s --> c1["swap: S → U for the repayment"]
  c1 --> c2["decreaseDebt(dD)"]
  c2 --> c3["swap: S → T for the payout"]
  c3 --> c4["withdrawCollateral(T, swap floor, to)"]
  c4 --> q["updateQuota(S, −), updateQuota(T, ±)"]
```

The payout is the **floor** of the second swap, so the wallet is never promised
more than the worst allowed slippage delivers. When `S == T` the second convert
is an identity and the payout comes straight off the existing balance.

## Exit (`W == MAX_UINT256`, or `W >= C0`)

Everything is sold in one many-to-one route, the loan is settled out of the
proceeds, and what is left goes to the wallet. The quotas go first: quota fees
accrue on the quota, not on the loan, so one outliving the debt it backed would
keep charging an account that owes nothing.

```mermaid
flowchart TD
  s["steps: clearQuotas, closeAll, repay(D0)?, sweep(to)"]
  s --> q1["updateQuota(tokenᵢ, MIN_INT96) for every quoted token"]
  q1 --> ph{"any phantom balance?"}
  ph -->|"yes"| e["withdrawalInProgress<br/>a redemption is in flight; claim it first"]
  ph -->|"no"| sell{"anything but underlying, above dust?"}
  sell -->|"yes"| c1["swap: many-to-one, every balance → U<br/>router findBestClosePath"]
  sell -->|"no"| c2["nothing to sell"]
  c1 --> d{"D0 > 0?"}
  c2 --> d
  d -->|"yes"| c3["decreaseDebt(MAX_UINT256)<br/>full: the payment covers the whole debt"]
  d -->|"no"| c4["no repayment"]
  c3 --> w{"RWA market?"}
  c4 --> w
  w -->|"yes"| c5["unwrapRwaCollateral(U → asset, whole balance)"] --> c6
  w -->|"no"| c6["withdrawCollateral(tokenᵢ, MAX_UINT256, to) per remaining balance"]
  c6 --> out["account: no debt, no quotas, no balances"]
```

Why the sentinels rather than the quoted amounts:

- `decreaseDebt(MAX_UINT256)` — by the time the transaction lands the debt has
  grown by a few blocks of interest, and repaying the quoted figure would leave
  dust the facade refuses to let stand below `minDebt`.
- `withdrawCollateral(MAX_UINT256)` — the facade reads the balance, so a swap
  that beat its floor does not strand the surplus on the account.
- `updateQuota(MIN_INT96)` — a reset, rather than an amount quota interest may
  have moved.

`tokenOut` and `sourceToken` are ignored by an exit: everything is sold, and the
payout is whatever the route produced.

An exit has a delayed route too, and for a position that only redeems through
its issuer it is the only one — no route exists for the whole account, so this
plan cannot be quoted at all. The request redeems `sourceToken` whole and
records `CLOSE_ACCOUNT`; `prepare.finalize` then runs this same plan against the
account the claim finds, see [delayed.md](./delayed.md).

Balances at or below 10 wei are left where they are — the router's close path
will not route them, and projecting them as sold would make the swept amounts
disagree with reality.

## Guards on the way out

| Check                                    | Refusal                        |
| ---------------------------------------- | ------------------------------ |
| balance actually holds each leg's input  | `insufficientSourceBalance`    |
| no phantom balance to sell (exit)        | `withdrawalInProgress`         |
| nothing forbidden or unquotable grew     | `forbiddenToken`, `quotaLimitReached` |
| HF at **safe prices** — funds leave      | `insufficientCollateral`       |

After an exit the debt is zero, so the health factor reports the no-debt
sentinel and the check is trivially satisfied.

## Notes

- The partial flow never touches quotas explicitly; the closing update sizes
  them to the balances left behind, with `quotaReserve` on top.
- Between `maxWithdraw` and the net value the flow refuses rather than clamping:
  the caller gets a reason it can show, not a number it did not ask for.
- Tests: [`withdraw.onchain.test.ts`](../../src/sdk/accounts/intents/tests/withdraw.onchain.test.ts),
  [`withdraw-all.onchain.test.ts`](../../src/sdk/accounts/intents/tests/withdraw-all.onchain.test.ts),
  [`plan.test.ts`](../../src/sdk/accounts/intents/plan.test.ts).
