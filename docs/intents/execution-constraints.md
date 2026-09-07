# Execution constraints and upfront limits

This change fixes preparation accepting a swap or opening operation at main
prices when its adapter requires safe prices. Expected-state metrics remain
separate from the slippage-floor check used to accept the executable call body.

## Review order

1. `market/adapters/safe-prices.ts`: decode the registered adapter's actual ABI;
   classify the method/version and any provable diff-method no-op. The complete
   source-linked inventory is in [adapter-safe-prices.md](../adapter-safe-prices.md).
2. `accounts/intents/execution-constraints.ts`: accumulate facade flags, quota
   transitions and guaranteed balance bounds; apply forbidden-token rules and
   the strict, lazy collateral check. Unknown behavior remains unresolved.
3. `accounts/assemble-open-account-calls.ts`: one call builder shared by `openCA`
   and opening validation. Opening checks floor balances against encoded
   `averageQuota`. Existing-account realization uses its floor and encoded quotas.
4. `sdk/prepare`: preserve the report through successful results and typed
   errors. Existing primary error codes remain available.

Source baseline: SDK `1e76f774ff312c4e6acb3ca5b2f8acb0db4774ba`, core-v3
`510fc6541c3767ce825929b4c311826fe81d6fa5`. Adapter sources and historical
ambiguities are recorded individually in the inventory.

## UI contract

`executionConstraints` describes the current operation, not the displayed
account. It records `useSafePrices`, `revertOnForbiddenTokens`, the collateral
threshold and independently evaluated constraints. Each has a stable `id` and
`passed`, `failed`, `unresolved` or `notApplicable` status. Failed checks retain
their existing typed `issue.detail` amounts/tokens; collateral also records
`actual`, `required` and `unit: "bps"`. `checkedHealthFactor` is capped when the
contract's lazy check succeeds, so use the account projection for displayed HF.

Refusals preserve the first issue for existing callers and attach the other
evaluated issues in the report. Early input, market or routing failures may
precede a report; absence means execution was not evaluated, never success.
`executionRequirementsUnavailable` identifies an unknown target, selector,
version or unprovable balance branch. `invalidPriceFeed` identifies a required
configured feed that could not be read. An absent reserve is valid zero
collateral; it is not an invalid feed. Underlying always uses its main feed.

The prepare namespace adds:

```ts
const withdrawal = await prepare.withdrawCollateralLimits(position, token);
const partial = await prepare.withdrawStrategyLimits(position);
const opening = prepare.leverageLimits(strategy, collateral, targetHF);
```

The reports expose each known cap in the operation's input units, plus the
minimum known `max`. **`complete: false` means this is a preliminary bound, not
a validated executable Max.** Direct withdrawal still refreshes quotas during
preparation; routed actions need route proceeds and final collateral pricing.
Always prepare the selected amount before enabling submission. Withdrawal
reports state `useSafePrices: true`; opening leaves it unresolved until routing.
Partial strategy withdrawal has a separate oracle-valued `exit`; full exit is
not interchangeable with a partial minimum-debt cap. Legacy scalar helpers stay
available.

## Scope and deliberately omitted work

- Future delayed tails remain estimates. The current request and the eventual
  matured claim are checked when their executable calls exist.
- No route search solver, new dependency, RPC simulation framework or transaction
  sending was added. This is validation against loaded SDK state and route
  guarantees, not a promise against subsequent state changes or venue reverts.
- Adapter versions whose source behavior cannot be identified unambiguously
  remain unsupported. A known `true` dominates conditional pricing flags, but
  never excuses unknown selectors.
- Price-update construction still includes reserves by default. This change
  shares opening call assembly without changing transaction signing or sending.

## Verification

Focused TypeScript tests cover real ABI calldata, safe swaps without payout,
false-returning methods, conditional branches, forbidden retention/growth/dust,
quota disabling, opening/close distinctions, feed failures, lazy checks and
separate diagnostics. Opening regressions check floor balances and combined
pool/collateral failures; public tests check report propagation and limit shape.

Representative upstream Solidity tests are run separately against the source
baseline. They corroborate the modeled rules; they are not an end-to-end replay
of every generated SDK transaction. See the delivery message for observed
commands and results.
