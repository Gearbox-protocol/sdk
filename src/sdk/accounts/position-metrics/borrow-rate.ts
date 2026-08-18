import type { Address } from "viem";
import type { BorrowRateBreakdown, Bps } from "../../../model/index.js";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { calcBorrowApy } from "../../market/math.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Cost of an account state's debt, broken down into the pool's base rate and
 * per-token quota rates.
 *
 * The base rate is the market's current borrow APY (the pool's base rate plus
 * the credit manager's interest fee) — the same value `borrowApy` reports on
 * a position; it is not recomputed for the projected pool liquidity. Quota
 * contributions are `quotaBalance * quotaRate` with the interest fee on top,
 * normalized against the total value (`total`, `quotas`) and against the
 * debt (`totalOnDebt`, the rate the debt itself grows at). Formulas are in
 * parity with the frontend's `BorrowRateUtils`.
 *
 * @param sdk - Market data source.
 * @param snapshot - Account state to evaluate.
 **/
export function borrowRate(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
): BorrowRateBreakdown {
  const { creditManager, quotas, totalDebt, totalValue } = snapshot;
  const market = sdk.marketRegister.findByCreditManager(creditManager);
  const cm = sdk.marketRegister.findCreditManager(creditManager).creditManager;
  const { pqk } = market.pool;

  const base = calcBorrowApy(market.pool.pool.baseInterestRate, cm.feeInterest);
  const fee = PERCENTAGE_FACTOR + BigInt(cm.feeInterest);

  // Σ balance * rate over active quotas, before the interest fee
  let quotaRateSum = 0n;
  const perQuota: Record<Address, Bps> = {};
  for (const q of quotas) {
    if (q.balance <= DUST_THRESHOLD) {
      continue;
    }
    const rateBalance = pqk.hasActiveQuota(q.token)
      ? q.balance * BigInt(pqk.quotaRate(q.token))
      : 0n;
    quotaRateSum += rateBalance;
    // per-token contributions carry the fee per token
    // (`getSingleQuotaBorrowRate` parity)
    const withFee = (rateBalance * fee) / PERCENTAGE_FACTOR;
    perQuota[q.token] = totalValue > 0n ? Number(withFee / totalValue) : 0;
  }
  // the aggregate terms carry the fee once, on the sum
  // (`getAverageQuotaBorrowRate` parity)
  const quotaRateSumWithFee = (quotaRateSum * fee) / PERCENTAGE_FACTOR;

  const total =
    totalValue > 0n
      ? Number((totalDebt * BigInt(base)) / totalValue) +
        Number(quotaRateSumWithFee / totalValue)
      : 0;
  const totalOnDebt =
    totalDebt > 0n ? base + Number(quotaRateSumWithFee / totalDebt) : 0;

  return { total, totalOnDebt, base, quotas: perQuota };
}
