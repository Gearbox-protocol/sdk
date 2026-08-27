import type { Address } from "viem";
import type { Token } from "../../../../model/index.js";
import type { Asset, PreviewIssue } from "../../../../onchain/index.js";
import {
  checkBorrowLimit,
  checkCollateralised,
  checkCreditManagerPaused,
  checkDebtInBand,
  checkForbiddenToken,
  checkFunding,
  checkQuotaCount,
  checkQuotaLimit,
  MIN_HEALTH_FACTOR_FORM,
} from "../../../../onchain/index.js";
import { BigIntMath } from "../../../../onchain/utils/bigint-math.js";
import type { CreditManagerSlice, PoolSlice } from "./types.js";

/**
 * The ladders below are the order the strategy lists report in, which is theirs
 * to decide — the engine weighs the same ceilings differently and says so.
 */

/**
 * The lists hold no token registry, so only the address is real here — these
 * issues are read as a reason, not rendered as an amount.
 */
function tokenOf(chainId: number, address: Address): Token {
  return { chainId, address, symbol: address, name: "", decimals: 0 };
}

/**
 * The debt ceilings an account opening runs into, in the order a form reports
 * them. The minimum debt is what is weighed — asking for less does not make it
 * fit.
 */
export function checkOpenAccountCeilings(args: {
  creditManager: Pick<
    CreditManagerSlice,
    | "minDebt"
    | "totalDebtLimit"
    | "totalDebt"
    | "availableToBorrow"
    | "quotas"
    | "underlyingToken"
    | "chainId"
  >;
  pool: Pick<PoolSlice, "totalDebtLimit" | "totalBorrowed"> | undefined | null;
  debt: bigint;
  targetToken: Address | null;
}): PreviewIssue | null {
  const { creditManager, pool, debt, targetToken } = args;
  const underlying = tokenOf(
    creditManager.chainId,
    creditManager.underlyingToken,
  );
  const effectiveDebt = BigIntMath.max(creditManager.minDebt, debt);

  const debtLimitLeft = BigIntMath.max(
    creditManager.totalDebtLimit - creditManager.totalDebt,
    0n,
  );
  const { totalDebtLimit = 0n, totalBorrowed = 0n } = pool || {};
  const poolDebtLimitLeft = totalDebtLimit - totalBorrowed;

  const canOpenMinDebt =
    creditManager.minDebt <= debtLimitLeft &&
    creditManager.minDebt <= poolDebtLimitLeft &&
    creditManager.minDebt <= creditManager.availableToBorrow;
  const minPositionSize = BigIntMath.min(
    BigIntMath.min(debtLimitLeft, poolDebtLimitLeft),
    creditManager.availableToBorrow,
  );

  const ceilings = [
    // `-1n` is the read model's "no limit configured", so a manager ceiling is
    // only weighed when one exists — unlike a pool's, which is absent at zero.
    ...(creditManager.totalDebtLimit >= 0n
      ? [{ available: debtLimitLeft, binding: "managerDebtAvailable" as const }]
      : []),
    // A pool limit of zero means none was configured, which is why it is
    // skipped rather than reported as a ceiling nothing clears.
    ...(totalDebtLimit > 0n
      ? [{ available: poolDebtLimitLeft, binding: "poolDebtLimit" as const }]
      : []),
    {
      available: creditManager.availableToBorrow,
      binding: "poolAvailableLiquidity" as const,
    },
  ];

  // First exceeded wins, which is the order a form reports them in.
  for (const { available, binding } of ceilings) {
    const issue = checkBorrowLimit({
      requested: effectiveDebt,
      available,
      binding,
      underlying,
      solutionAmount: canOpenMinDebt ? minPositionSize : undefined,
    });
    if (issue) {
      return issue;
    }
  }

  if (targetToken !== null) {
    return quotaIssue(creditManager, targetToken, effectiveDebt, underlying);
  }
  return null;
}

/** The room the keeper has left for a token, read off a slice. */
function quotaIssue(
  creditManager: Pick<CreditManagerSlice, "quotas" | "chainId">,
  token: Address,
  requested: bigint,
  underlying: Token,
): PreviewIssue | null {
  const quota = creditManager.quotas[token];
  if (!quota) {
    return null;
  }
  const realLimit = quota.isActive ? quota.limit : 0n;
  return checkQuotaLimit({
    token: tokenOf(creditManager.chainId, token),
    requested,
    available: realLimit - quota.totalQuoted,
    underlying,
  });
}

/** Everything the lists weigh before calling a manager usable, in their order. */
export function checkCreditManagerUsable(args: {
  creditManager: CreditManagerSlice;
  pool: PoolSlice | undefined;
  debt: bigint;
  healthFactor: number | undefined;
  targetToken: Address | null;
  /** What the account would obtain, refused outright if the market forbids it. */
  tokenToObtain: Address | null;
  /** What the wallet puts in, against the balances it holds. */
  collateral: readonly Asset[];
  balances: Record<Address, bigint>;
  desiredQuota: Record<Address, Asset>;
  quotaUpdate: readonly Asset[];
}): PreviewIssue | null {
  const { creditManager, pool, debt, targetToken } = args;
  const { chainId } = creditManager;
  const underlying = tokenOf(chainId, creditManager.underlyingToken);

  return (
    checkCreditManagerPaused({
      isPaused: creditManager.isPaused,
      creditManager: creditManager.address,
    }) ||
    checkOpenAccountCeilings({ creditManager, pool, debt, targetToken }) ||
    (args.tokenToObtain === null
      ? null
      : checkForbiddenToken({
          token: tokenOf(chainId, args.tokenToObtain),
          isForbidden: creditManager.isForbidden(args.tokenToObtain),
        })) ||
    fundingIssue(chainId, args.collateral, args.balances) ||
    // An account being opened has to carry a real loan, so zero debt is not
    // exempt here — unlike the band the engine checks on an adjustment.
    checkDebtInBand({
      debt,
      minDebt: creditManager.minDebt,
      maxDebt: creditManager.maxDebt,
      underlying,
      allowZero: false,
    }) ||
    checkQuotaCount({
      count: Object.values(args.desiredQuota).filter(a => a.balance > 0n)
        .length,
      max: creditManager.maxEnabledTokensLength,
    }) ||
    quotaUpdateIssue(creditManager, args.quotaUpdate, underlying) ||
    checkCollateralised({
      healthFactor: args.healthFactor,
      required: MIN_HEALTH_FACTOR_FORM,
      safePrices: false,
    })
  );
}

/**
 * The first asset the wallet cannot fund.
 *
 * The lookup lowercases because the balance map is keyed that way while a
 * market names its tokens as it spells them.
 */
function fundingIssue(
  chainId: number,
  collateral: readonly Asset[],
  balances: Record<Address, bigint>,
): PreviewIssue | null {
  for (const { token, balance } of collateral) {
    const held = balances[token.toLowerCase() as Address] || 0n;
    const issue = checkFunding({
      token: tokenOf(chainId, token),
      required: balance,
      held,
    });
    if (issue) {
      return issue;
    }
  }
  return null;
}

function quotaUpdateIssue(
  creditManager: Pick<CreditManagerSlice, "quotas" | "chainId">,
  quotaUpdate: readonly Asset[],
  underlying: Token,
): PreviewIssue | null {
  for (const { token, balance: updateBy } of quotaUpdate) {
    if (updateBy <= 0n) {
      continue;
    }
    const issue = quotaIssue(creditManager, token, updateBy, underlying);
    if (issue) {
      return issue;
    }
  }
  return null;
}
