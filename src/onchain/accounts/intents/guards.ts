import type { Asset, OnchainSDK } from "../../index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import type { MarketSuite } from "../../market/MarketSuite.js";
import {
  checkBorrowLimit,
  checkCreditManagerPaused,
  checkMarketExpired,
  checkQuotaLimit,
} from "../../validation/checks.js";
import { type BorrowLimitBinding, raise } from "../../validation/refusal.js";
import { toToken } from "../../validation/token.js";
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
  raise(
    checkCreditManagerPaused({ isPaused: suite.isPaused, creditManager }),
    `${creditManager} is paused`,
  );
  raise(
    checkMarketExpired({
      isExpired: suite.isExpired,
      creditManager,
      expirationDate: suite.creditFacade.expirationDate,
    }),
    `${creditManager} expired at ${suite.creditFacade.expirationDate}`,
  );
}

/**
 * What the pool will hand this manager in one transaction: the tightest of its
 * free liquidity, the manager's remaining debt limit and the per-block cap the
 * facade puts on a single borrow. A zero multiplier switches borrowing off
 * outright, which reads here as nothing being available.
 */
export function borrowable(suite: CreditSuite): {
  limit: bigint;
  binding: BorrowLimitBinding;
} {
  const { pool } = suite.market.pool;
  const { maxDebtPerBlockMultiplier, maxDebt } = suite.creditFacade;
  if (maxDebtPerBlockMultiplier === 0) {
    // Borrowing is switched off at the facade, so the cap is what stands in
    // the way even though no amount was weighed.
    return { limit: 0n, binding: "facadePerBlockCap" };
  }
  const available = pool.creditManagerDebtParams.get(
    suite.creditManager.address,
  )?.available;

  // Ties keep the earlier term, as the previous `reduce` did.
  const terms: Array<{ limit: bigint; binding: BorrowLimitBinding }> = [
    { limit: pool.availableLiquidity, binding: "poolAvailableLiquidity" },
    ...(maxDebtPerBlockMultiplier === 255
      ? []
      : [
          {
            limit: maxDebt * BigInt(maxDebtPerBlockMultiplier),
            binding: "facadePerBlockCap" as const,
          },
        ]),
    ...(available === undefined
      ? []
      : [{ limit: available, binding: "managerDebtAvailable" as const }]),
  ];

  return terms.reduce((a, b) => (b.limit < a.limit ? b : a));
}

/** The pool has to be able to lend what the plan means to draw. */
export function assertCanBorrow(
  sdk: OnchainSDK,
  suite: CreditSuite,
  amount: bigint,
): void {
  // The tightest ceiling is the one reported: `borrowable` already weighed them
  // against each other, and the number a caller can act on is the smallest.
  const { limit, binding } = borrowable(suite);
  raise(
    checkBorrowLimit({
      requested: amount,
      available: limit,
      binding,
      // The same underlying `borrowable` counts in, read the same way.
      underlying: toToken(sdk, suite.market.pool.underlying),
    }),
    `borrow: ${amount} exceeds what the pool can lend now (${limit})`,
  );
}

/**
 * What the account is allowed to end up holding more of than it started with.
 *
 * Forbidden-token checks live in execution-constraints: they need the final
 * enabled mask and accumulated call flags, not just projected balances. A token
 * the market takes no quota for is worthless as collateral:
 * buying one builds a position the collateral check cannot count, so the plan
 * is refused before it is signed rather than after it reverts.
 *
 * The underlying answers to neither rule, and a phantom token is a redemption
 * in flight rather than a holding.
 */
export function assertGrowthAllowed(args: {
  sdk: OnchainSDK;
  market: MarketSuite;
  before: readonly Asset[];
  after: readonly Asset[];
}): void {
  const { sdk, market, before, after } = args;
  const underlying = market.pool.underlying;

  for (const { token, balance } of after) {
    const held = before.find(a => eq(a.token, token))?.balance ?? 0n;
    if (balance <= held) {
      continue;
    }
    if (eq(token, underlying) || isPhantomToken(sdk, token)) {
      continue;
    }
    if (!market.pool.pqk.hasActiveQuota(token)) {
      // No ceiling was measured: the market opened none for this token, so
      // there is nothing the plan's appetite could be weighed against.
      raise(
        checkQuotaLimit({
          token: toToken(sdk, token),
          requested: undefined,
          available: 0n,
          underlying: toToken(sdk, underlying),
        }),
        `${token} takes no quota in this market, so it counts as no collateral`,
      );
    }
  }
}

/**
 * A quota can only be raised as far as the market still has room for: past the
 * token's limit the keeper takes nothing more, whoever is asking.
 */
export function assertQuotaHeadroom(
  sdk: OnchainSDK,
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
    // A quota is denominated in the underlying, not in the token it is held
    // against, so `token` and the two amounts name different things.
    raise(
      checkQuotaLimit({
        token: toToken(sdk, token),
        requested: balance,
        available: left,
        underlying: toToken(sdk, underlying),
      }),
      `${token} has ${left} of quota left, the plan needs ${balance}`,
    );
  }
}
