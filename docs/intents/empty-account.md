# Open an empty credit account

`prepare.openEmptyCreditAccount` → `openEmptyAccountIntent`
([`index.ts`](../../src/onchain/accounts/intents/index.ts)).

The flow with nothing in it: no collateral leaves the wallet, no debt is
borrowed, no route is quoted and no quota is bought. It exists so a wallet can
hold an account ahead of having a use for one — which markets want that is the
caller's decision, and `prepare` does not gate it. A parsed one is still judged
by `checkOperation`.

The market is the whole request, so there is no state to build and no planner to
call. What `prepare` answers is the block it cleared the request at; the only
thing that can refuse it is the facade being paused or expired, since an opening
is a multicall like any other.

## Shape

```text
openCreditAccount(wallet, calls, 0)
  calls = the price updates the market demands, and nothing else
```

`execute.buildTx` takes `kind: "openEmpty"` and reads nothing off the
preparation, because there is nothing on it. The account holds no token, so an
RWA market has none to resolve its open requirements against — unlike an
opening or a borrow, which name the token the account keeps.

`checkOperation` is where that gap is closed. With no gated token to weigh and
no account being reopened, a Midas market falls back to the degen NFT's own
tokens: the borrower is held to their requirements, and the account itself to
the greenlist the multicall is expected to grant it
([`checkRWAOpening`](../../src/onchain/validation/bundles/checkRWAOpening.ts),
`midasGreenlistsAccount` on the preview).

## What it leaves behind

The account reports `debt` and `totalValue` of zero and stores `MAX_UINT256` as
its health factor, which both the projection and the read path report as
`MAX_UINT16` (65535). `positions.list` returns it — the compressor is queried
with `includeZeroDebt` unless a filter says otherwise. A caller's own list may
still hide it: `PositionFilter.isZeroDebt` is what drops such rows.

## Using it later

Both flows that open an account take one instead:
[`openNewStrategy`](./open-strategy.md#reusing-a-pre-opened-account) and
[`borrow`](./borrow.md#reusing-a-pre-opened-account) accept `creditAccount`, and
what they require of it is exactly what this leaves behind — no debt and no
quota. Neither is required to use an account from here; any account of the same
credit manager in that condition does.
