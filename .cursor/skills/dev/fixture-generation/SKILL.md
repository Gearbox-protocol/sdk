---
name: fixture-generation
description: Generate and verify Gearbox SDK preview/e2e fixtures (especially RWA delayed withdrawals). Use when regenerating fixtures, comparing generated txs to frontend dumps, or debugging Securitize testnet fixture scripts.
---

# Fixture generation (SDK maintainer)

Internal workflow for regenerating and verifying fixtures under
`src/preview/__fixtures__` and related e2e fixtures. Scripts live in `dev/`
(not published). Transaction dumps use the shared **TxDump** JSON format
(`dev/txdiff/types.ts`).

## When to use

- Regenerating RWA delayed / preview / e2e fixtures
- Comparing script output to frontend-assembled transactions
- Debugging fixture-generator reverts on the RWA anvil fork (Securitize +
  Midas markets)

## Choose the workflow

### Regenerate fixtures with an existing script

Use this when the generator already models the intended transactions.

1. Read the generator and the tests that consume its output.
2. Optionally copy existing `txs.json` files aside (e.g. to `/tmp/…-before.json`)
   if you want a composition-only self-baseline when no frontend dump exists.
3. Reset the testnet if the generator requires a clean fork.
4. Run the generator with output redirected to a log file. Live anvil runs can
   stay quiet for a long time while redirected — silence alone is not a hang.
   Never pipe through `head` / `tail`.
5. After regenerate:
   - Point the consuming tests’ hardcoded `STATE_FIXTURE` at the new
     `Mainnet-{block}-rwa.json` if the block changed (both
     `previewRWADelayedOperation.test.ts` and the wallet-funded repay part of
     `previewCloseOrRepay.test.ts` hydrate it).
   - Remove obsolete `Mainnet-*-rwa.json` files once nothing references
     them.
6. Run the consuming tests and inspect the fixture git diff. Large numeric /
   address churn is expected; call labels/order should stay the same.
7. Optionally `pnpm tx:diff` the saved-before vs new `txs.json` for composition
   sanity. A frontend TxDump is not required for routine regeneration.

**Done when:** consuming tests pass, state fixture path is current, and the
git diff is structurally expected (same scenario labels / composition). Amounts
need not match the previous fixture.

### Create or change a generator to imitate frontend transactions

Use this when introducing a scenario or when frontend transaction assembly
changed.

1. Ask for frontend transactions in TxDump format before the reference is
   deleted.
2. Inspect the frontend code that assembles every transaction and record the
   expected call order and argument semantics.
3. Implement the generator using the same SDK/router entrypoints as frontend.
4. Run it on a clean testnet.
5. Require `pnpm tx:diff generated.json frontend.json` to match call
   composition. Investigate every target/function/order mismatch; numeric
   drift may be acceptable.
6. Add or update tests that consume the generated fixtures.

**Done when:** frontend TxDump composition matches and consuming tests pass.

## Commands

```bash
# Generate RWA delayed fixtures (requires live RWA testnet)
pnpm exec tsx dev/scripts/generate-rwa-delayed-fixtures.ts > /tmp/rwa-gen.log 2>&1

# Decode a TxDump or raw calldata
pnpm tx:decode path/to/txs.json
pnpm tx:decode 0x…

# Diff two TxDump files (composition must match; amounts may drift)
pnpm tx:diff generated.json frontend-dump.json
# or, for routine regen self-baseline:
pnpm tx:diff /tmp/withdraw-usdc-before.json src/preview/__fixtures__/rwa-delayed/withdraw-usdc/txs.json
```

Other generators: `dev/scripts/generate-e2e-fixtures.ts`,
`generate-preview-*.ts`, `generate-rwa-pool-fixture.ts`.

## Operational rules

1. **Ask the user to reset the RWA testnet** before a full regenerate.
   Do not assume the fork is clean.
2. **Redirect generator output to a log file.** Never pipe through `head` /
   `tail` directly — SIGPIPE kills `tsx` mid-run and truncates fixtures.
   Do not treat a quiet log as a hang; the run is long-lived.
3. For routine regeneration, verify by running the consuming tests and
   reviewing the fixture diff. Use `pnpm tx:diff` only if a reference TxDump
   exists (frontend dump or a self-baseline copy from before the run).
4. When creating or changing a generator to imitate frontend, a frontend
   TxDump comparison is required (same labels/order).
5. **Composition vs amounts:** call order, targets, and function names must
   match. Numeric args (amounts, deadlines, signatures, quotas) may differ
   between runs — treat those as annotations, not failures.
6. Unknown 4-byte revert selectors → use the **foundry-cast** skill
   (`cast 4byte 0x…`). Do not write ad-hoc decoder scripts.
7. `no address found for GLOBAL::RWA_COMPRESSOR` (or similar attach failures)
   usually means the testnet was reset mid-run — **stop and ask** the user
   to restart / confirm the fork is ready. Do not retry-loop blindly.

## TxDump format

```json
{
  "description": "scenario01: withdraw 2000 USDC",
  "chainId": 1,
  "transactions": [
    { "label": "open", "to": "0x…", "data": "0x…", "value": "0" }
  ]
}
```

When frontend reference transactions are available, frontend dumps and
generator output must share this shape so `pnpm tx:diff` is a one-command
check.
