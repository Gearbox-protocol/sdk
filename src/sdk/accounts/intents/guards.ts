import type { Address } from "viem";
import { PERCENTAGE_FACTOR } from "../../constants/index.js";
import type { Asset, OnchainSDK } from "../../index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import type { MarketSuite } from "../../market/MarketSuite.js";
import { IntentPreviewError } from "./types.js";
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
 */

/**
 * The facade takes no multicall while it is paused or past its expiration, so
 * every intent the engine previews would revert on arrival.
 */
export function assertMarketOperable(suite: CreditSuite): void {
  if (suite.isPaused) {
    throw new IntentPreviewError(
      "marketPaused",
      `${suite.creditManager.address} is paused`,
    );
  }
  if (suite.isExpired) {
    throw new IntentPreviewError(
      "marketExpired",
      `${suite.creditManager.address} expired at ${suite.creditFacade.expirationDate}`,
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
    throw new IntentPreviewError(
      "insufficientPoolLiquidity",
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
  const forbidden = forbiddenTokens(suite);
  const underlying = market.pool.underlying;

  for (const { token, balance } of after) {
    const held = before.find(a => eq(a.token, token))?.balance ?? 0n;
    if (balance <= held) {
      continue;
    }
    if (forbidden.some(f => eq(f, token))) {
      throw new IntentPreviewError(
        "forbiddenToken",
        `${token} is forbidden in this market and the plan buys more of it`,
      );
    }
    if (eq(token, underlying) || isPhantomToken(sdk, token)) {
      continue;
    }
    if (!market.pool.pqk.hasActiveQuota(token)) {
      throw new IntentPreviewError(
        "quotaLimitReached",
        `${token} takes no quota in this market, so it counts as no collateral`,
      );
    }
  }
}

/** Tokens the facade's mask flags, which is indexed by collateral position. */
function forbiddenTokens(suite: CreditSuite): Address[] {
  const mask = suite.creditFacade.forbiddenTokensMask;
  if (mask === 0n) {
    return [];
  }
  return suite.creditManager.collateralTokens.filter(
    (_, i) => (mask & (1n << BigInt(i))) !== 0n,
  );
}

/**
 * The facade weighs the account against its debt at the end of every multicall
 * and reverts if the collateral does not cover it, so a plan that lands the
 * account below water is refused here.
 *
 * The bar is the health factor of the state the plan projects: collateral under
 * liquidation thresholds, capped by quota, against the debt. Note that a
 * position already underwater cannot be nursed back one step at a time — the
 * check is on where the transaction ends, not on whether it improved things.
 *
 * @remarks
 * The caller decides the pricing the factor was computed at: main prices, or
 * the safe ones the facade switches to when the call hands funds over. A token
 * whose reserve feed the SDK cannot read keeps its main price, so a plan can
 * still be refused on-chain after passing here.
 */
export function assertCollateralised(healthFactorBps: number): void {
  if (healthFactorBps < Number(PERCENTAGE_FACTOR)) {
    throw new IntentPreviewError(
      "insufficientCollateral",
      `the account would end at a health factor of ${healthFactorBps}, below 1.0`,
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
        `${token} has ${left} of quota left, the plan needs ${balance}`,
      );
    }
  }
}
