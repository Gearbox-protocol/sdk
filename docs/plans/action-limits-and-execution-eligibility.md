# Action limits and execution eligibility

Status: proposed product behavior. Scope: calculator and the forms consuming it.

Supporting design: [intent flow and suggested result shape](../intents/README.md#proposed-execution-constraints-and-upfront-limits),
[opening](../intents/open-strategy.md#notes), and [adapter source notes](../adapter-safe-prices.md).

## Problem and outcome

A user can see a healthy position and a plausible withdrawal or leverage amount,
then discover that the action fails a protocol constraint. Today, safe-price
validation is tied to wallet payouts, although a swap inside the account can
also require it. Opening can be judged on expected proceeds even when the
minimum proceeds allowed by slippage would be insufficient.

The calculator should answer two questions: **how much can I do, and what is
preventing this action?** Forms should show available limits before submission
and explain the selected action's eligibility independently of position metrics.

## User experience

1. On opening a form, show the limits already known for that action, including
   the constraint setting each limit. Do not wait for a route to expose a known
   balance, debt, liquidity or collateral restriction.
2. As the user chooses an amount and route, show each applicable constraint as
   satisfied, blocked or awaiting information. Hide or mark inapplicable checks.
   Show all independently known blockers together, rather than one per retry.
3. For a blocker, provide the affected asset, requested amount or ratio, allowed
   amount or ratio, units, and a useful explanation where these are known.
   Distinguish “reduce the amount” from “no borrowing liquidity” and “cannot
   evaluate this route.” Do not invent a numerical limit when data is missing.
4. Present action eligibility alongside the expected position preview. A healthy
   displayed health factor must not imply that the selected action is valid.
   Explain when the action requires more conservative collateral prices.
5. Enable submission only after required checks resolve for the selected amount
   and route. Changes to the input, quote or underlying market state invalidate
   that verdict and require preparation again.

## Limits and Max

| Action | What the form should communicate |
| --- | --- |
| Direct collateral withdrawal | Available balance and the collateral limit under the pricing required for withdrawal; quota or token restrictions still to be resolved. |
| Partial strategy withdrawal | The amount that can be withdrawn while leaving valid remaining debt, plus route-dependent collateral and liquidity constraints. |
| Opening or increasing leverage | Debt, borrowing liquidity, quota and collateral constraints; distinguish known bounds from those requiring the selected route. |
| Full exit | A separate action with its own eligibility and estimated proceeds; it is not the partial-withdrawal maximum. |

Combine applicable bounds only when they use the same input units. Label an
incomplete bound as preliminary. A value presented as a **validated Max** must
pass the same preparation checks as a manually entered amount at the same state
and quote. A preliminary amount may populate the form, but must still be
validated before submission. Do not promise an exact route-dependent Max before
the required route and price information exists.

## Eligibility rules

- Check the complete selected action. Safe pricing may be required by a swap
  even when nothing leaves the account; payout alone is not the deciding factor.
- Judge eligibility using minimum proceeds allowed by slippage and the debt and
  quotas the transaction will actually use. Keep expected proceeds for the
  position preview. Apply this consistently to opening and existing positions.
- Where required, safe collateral prices use the lower main/reserve price.
  Missing reserve coverage contributes zero; the market's underlying asset uses
  its main price. A required configured feed that cannot be read is a data
  blocker, not a fallback to a more favorable valuation.
- Apply token restrictions to the final enabled holdings and the selected
  action. Selling down a forbidden token can still leave the action blocked;
  retaining it is allowed only when the protocol permits it and its balance
  cannot increase. Dust is not an automatic exemption.
- Unknown method behavior, an unresolved conditional route, or unavailable data
  must remain unresolved. Preserve any other constraints that can be evaluated.
- Apply full-close rules only to an actual account close. Emptying balances or
  reaching zero debt does not automatically remove all transaction constraints.

## Acceptance criteria

| Scenario | Required outcome |
| --- | --- |
| Swap with no wallet payout; main-price HF passes but required safe-price HF fails | Block the action and explain the collateral shortfall; retain the expected position preview. |
| Action does not require safe pricing | Use its applicable pricing rules; do not reject solely because an unused reserve is unavailable. |
| Opening looks healthy at expected proceeds but fails at the slippage floor | Block opening and show the applicable collateral requirement. |
| Borrowing liquidity and collateral both fail | Show both known blockers with amounts/ratios and units. |
| Required reserve is absent versus configured but unreadable | Distinguish zero eligible collateral from unavailable price data. |
| A forbidden token remains enabled after a restricted action | Explain the token restriction even if its balance fell or is only dust. |
| Route or data is not yet available | Keep dependent checks unresolved while showing independently known limits. |
| User selects a validated Max | The same amount passes preparation at the same state and quote. |
| Partial withdrawal reaches minimum remaining debt | Limit the partial amount and offer full exit separately where eligible. |

## Scope boundaries

Cover currently executable actions, including delayed-withdrawal requests and
matured claims. Future delayed proceeds remain estimates and receive their own
eligibility check when executable. This specification does not prescribe API
names, internal architecture or a route-search algorithm, and includes no code
or automated tests. Eligibility reflects evaluated state; it cannot guarantee
execution after prices, liquidity or venue conditions change.
