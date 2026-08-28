import type { Address } from "viem";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { IPriceOracleContract, OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/index.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";

export interface MaxWithdrawCollateralProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /** Collateral to withdraw. */
  token: Address;
  /** Health factor the withdrawal has to leave behind, in basis points. */
  targetHF: bigint;
}

/**
 * Largest amount of one collateral the account can withdraw while its health
 * factor stays at or above `targetHF`.
 *
 * This is the collateral check solved for one balance, and it counts what that
 * check counts: a holding backed by a quota contributes the lesser of the
 * quota and its threshold-weighted value, an unquoted one — the underlying —
 * its weighted value alone, and dust or a disabled balance nothing at all.
 * Collateral is valued at the lower of its two feeds, the way the facade
 * values a call that hands funds over; the debt is valued at the main feed,
 * as the check does. Zero debt frees the whole balance.
 *
 * Rounding always favours the account, so the answer clears the check rather
 * than landing a wei short of it.
 *
 * @returns Amount in the token's units; `0n` when nothing can leave —
 * including when the account is already below `targetHF`, or the target or the
 * underlying has no price
 **/
export function maxWithdrawCollateral(
  props: MaxWithdrawCollateralProps,
): bigint {
  const { creditAccount, sdk, token, targetHF } = props;
  const { market, creditManager } = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const { priceOracle } = market;
  const { pqk } = market.pool;
  const underlying = market.pool.underlying;

  const target = creditAccount.tokens.find(t => eq(t.token, token));
  if (!target || target.balance <= DUST_THRESHOLD) {
    return 0n;
  }
  if (creditAccount.totalDebt === 0n) {
    return target.balance;
  }

  // A slice assembled for a simulation carries no mask, and that means
  // "unknown" rather than "everything disabled".
  const masked = creditAccount.enabledTokensMask !== 0n;
  const counts = (t: CreditAccountSlice["tokens"][number]): boolean =>
    t.balance > DUST_THRESHOLD &&
    (!masked || (t.mask & creditAccount.enabledTokensMask) !== 0n);

  /** What a holding backs, in the check's units: USD × PERCENTAGE_FACTOR. */
  const weigh = (t: CreditAccountSlice["tokens"][number]): bigint => {
    const lt = BigInt(creditManager.liquidationThresholds.get(t.token) ?? 0);
    const weighted = (safeUsd(priceOracle, t.token, t.balance) ?? 0n) * lt;
    // no quota bought is how an unquoted token reads, and the underlying is
    // the one every account holds
    if (t.quota === 0n) {
      return weighted;
    }
    return BigIntMath.min(quotaUsd(t) * PERCENTAGE_FACTOR, weighted);
  };

  /** A quota is underlying-denominated, and a closed market backs nothing. */
  const quotaUsd = (t: CreditAccountSlice["tokens"][number]): bigint =>
    pqk.hasActiveQuota(t.token)
      ? (usd(priceOracle, underlying, t.quota) ?? 0n)
      : 0n;

  let otherMoney = 0n;
  for (const t of creditAccount.tokens) {
    if (eq(t.token, token) || !counts(t)) {
      continue;
    }
    otherMoney += weigh(t);
  }

  // The debt is what the check divides by: without a price for it there is no
  // ceiling to offer, rather than an unbounded one.
  const borrowed = usd(priceOracle, underlying, creditAccount.totalDebt);
  if (borrowed === undefined || borrowed <= 0n) {
    return 0n;
  }

  const required = borrowed * targetHF;
  if (required <= otherMoney) {
    return target.balance;
  }
  const shortfall = required - otherMoney;

  // A quoted holding backs at most its quota, so a quota short of the
  // shortfall cannot be helped by keeping more of the token.
  if (target.quota > 0n && quotaUsd(target) * PERCENTAGE_FACTOR < shortfall) {
    return 0n;
  }

  const targetLt = BigInt(
    creditManager.liquidationThresholds.get(target.token) ?? 0,
  );
  const targetUsd = safeUsd(priceOracle, target.token, target.balance);
  if (targetLt === 0n || !targetUsd) {
    return 0n;
  }

  // USD is linear in the balance, so what has to stay is the same share of the
  // balance as it is of its value. Both steps round up: a wei too many stays
  // behind rather than being offered.
  const keptUsd = BigIntMath.ceilDiv(shortfall, targetLt);
  const kept = BigIntMath.ceilDiv(target.balance * keptUsd, targetUsd);

  return kept >= target.balance ? 0n : target.balance - kept;
}

/** USD value at the main feed, or `undefined` when the token has no price. */
function usd(
  oracle: IPriceOracleContract,
  token: Address,
  amount: bigint,
): bigint | undefined {
  try {
    return oracle.convertToUSD(token, amount);
  } catch {
    return undefined;
  }
}

/**
 * USD value at the lower of the token's two feeds — what a call handing funds
 * over is judged at. Falls back to the main feed where there is no second one.
 **/
function safeUsd(
  oracle: IPriceOracleContract,
  token: Address,
  amount: bigint,
): bigint | undefined {
  const main = usd(oracle, token, amount);
  if (main === undefined) {
    return undefined;
  }
  try {
    return BigIntMath.min(main, oracle.convertToUSD(token, amount, true));
  } catch {
    return main;
  }
}
