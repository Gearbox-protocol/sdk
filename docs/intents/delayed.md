# Delayed routes: request now, finish later

Some collateral does not sell on a DEX — a Securitize dsToken, a Mellow share.
It redeems through its issuer, which answers a request now and pays out days
later. Two of the intents can take that route:
[withdraw](./withdraw.md) and [adjust leverage](./adjust-leverage.md).

Two transactions rather than one, and nothing has to be kept on the client in
between: the request writes the operation into the withdrawal's `extraData`, and
reading the claimable decodes it back.

- the request half → `planWithdrawDelayed` / `planAdjustLeverageDelayed`
- `prepare.finalize` → `planFinishWithdraw` / `planFinishDecreaseLeverage` /
  `planFinishCloseAccount` / `planFinishClaimOnly`

There is no separate entry point for the request: `prepare.withdrawStrategy` and
`prepare.adjustLeverage` quote this route alongside the instant one, in the
`delayed` field of their answer, and which routes exist is what the caller wanted
to know in the first place.

## The two halves

```mermaid
flowchart LR
  a["request: startDelayedWithdrawal(S, amount)<br/>the phantom token stands in for the proceeds"]
  b["[days] issuer processes the redemption"]
  c["claim: claimDelayedWithdrawal<br/>+ whatever the recorded intent still owes"]
  a --> b --> c
```

While the phantom balance sits on the account it is neither sellable nor
withdrawable, so a second request for the same asset is refused
(`withdrawalInProgress`), and so is an instant exit.

## What the preview reports

The request is half an operation, so the state it lands in is not an answer to
"what does this do to my position": the debt still stands, nothing has been paid
out, and the position sits in the phantom token. So `preview` is the far side —
the account once the redemption has matured, been claimed and the tail has run —
which is the same place the instant route reaches in one transaction, and what
makes the two routes comparable at all.

The half-way state is still reported, as `delayed.afterRequest`: that is what
the facade judges when the transaction lands, so it is the one the engine's
guards are applied to. Both are validated, so a request whose tail could not be
completed is refused rather than started.

The tail is walked by the same realiser as everything else (`realize`), with one
substitution: routed legs are priced by the oracle instead of the pathfinder,
because the funds they trade do not exist yet and no calldata is being produced.
Its half of the numbers is therefore an estimate; `operations` and `calls` are
the request alone, and those are exact.

## Leading half: withdraw

Same arithmetic as the instant flow — `withdrawShape` is shared, so the two
routes cannot disagree on the amounts — and then a single `request` step.

```mermaid
flowchart TD
  in["withdrawStrategy, delayed branch: amount W, to, tokenOut T?, sourceToken S?"]
  shape["withdrawShape: Wᵤ, dD = D0 · Wᵤ / C0, exit?"]
  all{"exit? (W == MAX_UINT256 or Wᵤ >= C0)"}
  pay{"T is U, or the RWA asset behind U?"}
  src{"T == S?"}
  r1["request(S, price(U → S, dD)), reserve = W<br/>the payout never leaves the account, only the debt is raised"]
  r2["request(S, price(U → S, Wᵤ + dD)), reserve = 0"]
  cfg{"exactly one redemption venue for S?"}
  ph{"phantom balance already held?"}
  holds{"account holds amount + reserve of S?"}
  op["startDelayedWithdrawal + record<br/>WITHDRAW_COLLATERAL: to, T, W, S, dD<br/>(CLOSE_ACCOUNT: to, for the exit)"]
  out["delayed: claimableAt, settlement"]

  in --> shape --> all
  all -->|"yes"| ex["request(S, balance(S)), reserve = 0<br/>record CLOSE_ACCOUNT: to<br/>the whole position is redeemed, nothing else is named"] --> cfg
  all --> pay
  pay -->|"no"| e2["noDelayedRoute<br/>the tail cannot pay out in T"]
  pay --> src
  src -->|"yes"| r1 --> cfg
  src -->|"no"| r2 --> cfg
  cfg -->|"none"| e3["noDelayedRoute"]
  cfg -->|"several"| e4["multipleDelayedWithdrawals"]
  cfg --> ph
  ph -->|"yes"| e5["withdrawalInProgress"]
  ph --> holds
  holds -->|"no"| e6["insufficientSourceBalance"]
  holds --> op --> out
```

`settlement` is `"delayed"` when any output of the redemption matures later, and
`"instant"` when the venue happens to pay out at once — in which case the request
already is the whole operation.

## Leading half: adjust leverage

Only deleveraging reaches here, and only for the part idle underlying does not
already cover.

```mermaid
flowchart TD
  in["adjustLeverage, delayed branch: targetLeverage L1, token T?"]
  shape["leverageShape: target = C0 · (L1 − 1), delta = target − D0"]
  up{"delta < 0?"}
  short{"shortfall = −delta − balance(U) > 0?"}
  r["request(T, price(U → T, shortfall)), reserve = 0<br/>record: DECREASE_LEVERAGE"]
  out["startDelayedWithdrawal"]

  in --> shape --> up
  up -->|"no"| e1["noDelayedRoute<br/>levering up settles at once"]
  up --> short
  short -->|"no"| e2["noDelayedRoute<br/>idle underlying covers it, nothing to redeem"]
  short --> r --> out
```

## Tails

`finalize` claims the matured withdrawal and then plans whatever the recorded
operation still owes, against the account **as it stands now** — not as it stood
when the request was signed.

```mermaid
flowchart TD
  in["prepare.finalize: claimable, intent?"]
  rec{"which operation was recorded?"}
  w["WITHDRAW_COLLATERAL"]
  d["DECREASE_LEVERAGE"]
  x["CLOSE_ACCOUNT"]
  c["ADD_COLLATERAL / INCREASE_LEVERAGE<br/>DEPOSIT / DEPOSIT_AND_INCREASE_LEVERAGE"]
  n["nothing recorded"]

  in --> rec
  rec --> w
  rec --> d
  rec --> x
  rec --> c
  rec --> n
  n --> e1["noRecordedIntent"]
  w --> wq{"claim credits something now?"}
  d --> dq{"claim credits something now?"}
  x --> xq{"claim credits something now?"}
  wq -->|"no"| e2["insufficientSourceBalance"]
  dq -->|"no"| e2
  xq -->|"no"| e2
  wq --> wp["planFinishWithdraw: four shapes"]
  dq --> dp["claim, convert(claimed → U, all), repay(raised)"]
  xq --> xp["planFinishCloseAccount: the instant exit, over again"]
  c --> cp["claim only — the tokens land, quotas catch up"]
```

### `WITHDRAW_COLLATERAL`, four shapes

The claim is split between the payout the wallet was promised and the debt the
leading half deferred. The payout is served first, so a routing shortfall shows
up as leverage a touch above target rather than as a payout that came up short.

```mermaid
flowchart TD
  subgraph a["dD == 0: the whole claim is payout"]
    a1["claimDelayedWithdrawal"] --> a2["convert claimed → T, all of it"] --> a3["withdrawCollateral(T, min(raised, W), to)"]
  end
  subgraph b["S == T: the payout was already on the account"]
    b1["claimDelayedWithdrawal"] --> b2["convert claimed → U, all of it"] --> b3["decreaseDebt(min(raised, dD))"] --> b4["withdrawCollateral(T, W, to)"]
  end
  subgraph c["T == U: payout and debt both want the underlying"]
    c1["claimDelayedWithdrawal"] --> c2["convert claimed → U, all of it"] --> c3["decreaseDebt(dD), keeping W back"] --> c4["withdrawCollateral(U, min(raised, W), to)"]
  end
  subgraph d["T is the RWA asset, the debt wants U"]
    d1["claimDelayedWithdrawal"] --> d2["reserved = min(price(T → claimed, W), claimed)"] --> d3["convert claimed → U, claimed − reserved"] --> d4["decreaseDebt(min(raised, dD))"] --> d5["unwrap / convert reserved → T"] --> d6["withdrawCollateral(T, min(raised, W), to)"]
  end
```

A payout in `T` that is neither the underlying nor the RWA asset behind it is
refused (`noDelayedRoute`) — the leading half checks the same thing, so this only
fires when the account's market changed shape in between.

### `DECREASE_LEVERAGE`

```mermaid
flowchart LR
  a["claimDelayedWithdrawal"] --> b["convert claimed → U, all of it"] --> c["decreaseDebt(raised)<br/>MAX_UINT256 when it covers the whole debt"] --> d["updateQuota(source, −)"]
```

Everything claimed goes into the debt: the request only ever asked for the
shortfall, so there is nothing to hand back.

### `CLOSE_ACCOUNT`

The leading half redeemed the position and could name nothing else: how much the
redemption pays, what the debt has grown to and what else is on the account by
then are all unknowable days in advance. So this half is the
[instant exit](./withdraw.md) over again, run against the account the claim
finds.

```mermaid
flowchart TD
  a["claimDelayedWithdrawal"] --> w{"claim paid the RWA asset?"}
  w -->|"yes"| b["wrap claimed → U, all of it"] --> q
  w --> q["updateQuota(each, −) — the loan is going to zero"]
  q --> r["closeAll: everything left → U in one many-to-one route<br/>(skipped when the claim was all there was)"]
  r --> d["decreaseDebt(debt) — skipped on an account that owes nothing"]
  d --> s["sweep: every balance left → to, unwrapped to the RWA asset on an RWA market"]
```

This is what lets a position that only redeems through its issuer leave at all:
the instant exit needs a route for the whole account, and there is none.

### Claim only

```mermaid
flowchart LR
  a["claimDelayedWithdrawal"] --> b["updateQuota(claimed token, +) sized to the new balance"]
```

For the operations that were never interrupted by the delay — collateral added,
leverage raised, a deposit — the claim is the whole tail: the tokens land on the
account and only their quota has to catch up.

## Notes

- The tail is planned at claim time, not stored: only then are the claimed amount
  and the token it arrived in known. The projection behind `preview` plans the
  same tail from the claim the request implies, so the two cannot drift apart.
- `intent` can be passed explicitly for a compressor too old to report what the
  request recorded.
- Requests and claims carry calldata the compressor produces; the intent engine
  does not build those calls itself.
- Tests: [`start-delayed.onchain.test.ts`](../../src/sdk/accounts/intents/tests/start-delayed.onchain.test.ts),
  [`finish-withdraw.onchain.test.ts`](../../src/sdk/accounts/intents/tests/finish-withdraw.onchain.test.ts),
  [`finish-decrease-leverage.onchain.test.ts`](../../src/sdk/accounts/intents/tests/finish-decrease-leverage.onchain.test.ts),
  [`finish-claim-only.onchain.test.ts`](../../src/sdk/accounts/intents/tests/finish-claim-only.onchain.test.ts),
  [`finish-close-account.onchain.test.ts`](../../src/sdk/accounts/intents/tests/finish-close-account.onchain.test.ts).
