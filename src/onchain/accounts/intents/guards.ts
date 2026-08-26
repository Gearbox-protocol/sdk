import { PERCENTAGE_FACTOR } from "../../constants/index.js";
import type { Asset, OnchainSDK } from "../../index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import type { MarketSuite } from "../../market/MarketSuite.js";
import { IntentPreviewError } from "./refusal.js";
import { eq } from "./utils/common.js";
import { isPhantomToken } from "./utils/pick-token.js";

/**
 * What the market itself refuses, checked before anything is quoted.
 *
 * The planners answer for the arithmetic of an intent and the ledger for the
 * balances it moves, but neither can see that the facade is paused or that the
 * pool has run out of what it lends. On-chain those come back as a reverted
 * multicall with a selector no form can explain, so they are read from the
 * loaded market and reported as refusals instead.
 *
 * Every guard here refuses something the market decides rather than something
 * the arithmetic cannot do, which is why all six of their reasons are
 * `blocking`: the walk that hit one still reached an end state, and a caller
 * gets that state alongside the refusal.
 */

/**
 * The facade takes no multicall while it is paused or past its expiration, so
 * every intent the engine previews would revert on arrival.
 */
export function assertMarketOperable(suite: CreditSuite): void {
  const creditManager = suite.creditManager.address;
  if (suite.isPaused) {
    throw new IntentPreviewError(
      "marketPaused",
      { creditManager },
      `${creditManager} is paused`,
    );
  }
  if (suite.isExpired) {
    throw new IntentPreviewError(
      "marketExpired",
      { creditManager, expirationDate: suite.creditFacade.expirationDate },
      `${creditManager} expired at ${suite.creditFacade.expirationDate}`,
    );
  }
}

/**
 * What the pool will hand this manager in one transaction: the tightest of its
 * free liquidity, the manager's remaining debt limit and the per-block cap the
 * facade puts on a single borrow. A zero multiplier switches borrowing off
 * outright, which reads here as nothing being available.
 */
export function borrowable(suite: CreditSuite): bigint {
  const { pool } = suite.market.pool;
  const { maxDebtPerBlockMultiplier, maxDebt } = suite.creditFacade;
  if (maxDebtPerBlockMultiplier === 0) {
    return 0n;
  }
  const available = pool.creditManagerDebtParams.get(
    suite.creditManager.address,
  )?.available;

  return [
    pool.availableLiquidity,
    maxDebt * BigInt(maxDebtPerBlockMultiplier),
    ...(available === undefined ? [] : [available]),
  ].reduce((a, b) => (a < b ? a : b));
}

/** The pool has to be able to lend what the plan means to draw. */
export function assertCanBorrow(suite: CreditSuite, amount: bigint): void {
  const limit = borrowable(suite);
  if (amount > limit) {
    // The same underlying `borrowable` counts in, read the same way.
    const token = suite.market.pool.underlying;
    throw new IntentPreviewError(
      "insufficientPoolLiquidity",
      {
        requested: { token, balance: amount },
        available: { token, balance: limit },
      },
      `borrow: ${amount} exceeds what the pool can lend now (${limit})`,
    );
  }
}

/**
 * What the account is allowed to end up holding more of than it started with.
 *
 * A forbidden token may be sold and may leave, but its balance must not grow —
 * the facade checks exactly that at the end of the multicall. A token the
 * market takes no quota for is not forbidden, only worthless as collateral:
 * buying one builds a position the collateral check cannot count, so the plan
 * is refused before it is signed rather than after it reverts.
 *
 * The underlying answers to neither rule, and a phantom token is a redemption
 * in flight rather than a holding.
 */
export function assertGrowthAllowed(args: {
  sdk: OnchainSDK;
  suite: CreditSuite;
  market: MarketSuite;
  before: readonly Asset[];
  after: readonly Asset[];
}): void {
  const { sdk, suite, market, before, after } = args;
  const forbidden = suite.forbiddenTokens;
  const underlying = market.pool.underlying;

  for (const { token, balance } of after) {
    const held = before.find(a => eq(a.token, token))?.balance ?? 0n;
    if (balance <= held) {
      continue;
    }
    if (forbidden.some(f => eq(f, token))) {
      throw new IntentPreviewError(
        "forbiddenToken",
        { token },
        `${token} is forbidden in this market and the plan buys more of it`,
      );
    }
    if (eq(token, underlying) || isPhantomToken(sdk, token)) {
      continue;
    }
    if (!market.pool.pqk.hasActiveQuota(token)) {
      throw new IntentPreviewError(
        "quotaLimitReached",
        // No ceiling was measured: the market opened none for this token, so
        // there is nothing the plan's appetite could be weighed against.
        {
          token,
          requested: undefined,
          available: { token: underlying, balance: 0n },
        },
        `${token} takes no quota in this market, so it counts as no collateral`,
      );
    }
  }
}

/**
 * The facade weighs the account against its debt at the end of every multicall
 * and reverts if the collateral does not cover it, so a plan that lands the
 * account below water is refused here.
 *
 * The bar is the facade's own `1.0`, because this guard answers one question:
 * would the transaction revert. It is deliberately not `MIN_HF_LIMITED`, and
 * the three bars in this codebase are three different jobs:
 *
 * - here, `1.0` — what the facade enforces, so what a plan must clear to land;
 * - `maxWithdrawCollateral` sizes at `MIN_HF_LIMITED + 2` — a *sizing* helper
 *   leaving headroom, which is not the same as a validity check;
 * - `validateHF` refuses at or below `MIN_HF_LIMITED` — a form's own caution.
 *
 * Raising this one to `MIN_HF_LIMITED` was tried and reverted: it made
 * `maxWithdraw` hand back a ceiling this guard then refused, and it blocked
 * small top-ups of an account sitting in `[1.0, 1.01)` — the very operations
 * that rescue it. A form wanting the stricter bar has `validateHF`.
 *
 * Note that a position already underwater cannot be nursed back one step at a
 * time — the check is on where the transaction ends, not on whether it
 * improved things.
 *
 * @remarks
 * The caller decides the pricing the factor was computed at: main prices, or
 * the safe ones the facade switches to when the call hands funds over. A token
 * whose reserve feed the SDK cannot read keeps its main price, so a plan can
 * still be refused on-chain after passing here.
 */
export function assertCollateralised(
  healthFactorBps: number,
  safePrices: boolean,
): void {
  const required = Number(PERCENTAGE_FACTOR);
  if (healthFactorBps < required) {
    throw new IntentPreviewError(
      "insufficientCollateral",
      { healthFactor: healthFactorBps, required, safePrices },
      `the account would end at a health factor of ${healthFactorBps}, below ${required}`,
    );
  }
}

/**
 * A quota can only be raised as far as the market still has room for: past the
 * token's limit the keeper takes nothing more, whoever is asking.
 */
export function assertQuotaHeadroom(
  market: MarketSuite,
  increases: readonly Asset[],
): void {
  const underlying = market.pool.underlying;
  for (const { token, balance } of increases) {
    if (balance <= 0n) {
      continue;
    }
    const quota = market.pool.pqk.quotas.get(token);
    if (!quota) {
      continue;
    }
    const left = quota.limit - quota.totalQuoted;
    if (balance > left) {
      throw new IntentPreviewError(
        "quotaLimitReached",
        // A quota is denominated in the underlying, not in the token it is
        // held against, so `token` and the two amounts name different things.
        {
          token,
          requested: { token: underlying, balance },
          available: { token: underlying, balance: left },
        },
        `${token} has ${left} of quota left, the plan needs ${balance}`,
      );
    }
  }
}
