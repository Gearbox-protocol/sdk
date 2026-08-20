import type { Address } from "viem";
import type {
  BorrowRateBreakdown,
  Bps,
  Token,
  TokenQuotaRate,
} from "../../model/index.js";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../constants/math.js";
import { calcBorrowApy } from "../market/math.js";
import { AddressMap } from "../utils/AddressMap.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Inputs of {@link calcBorrowRate}.
 **/
export interface CalcBorrowRateProps {
  snapshot: AccountSnapshot;
  /**
   * Pool base interest rate in ray.
   **/
  baseInterestRate: bigint;
  /**
   * Credit manager interest fee in basis points.
   **/
  feeInterest: number;
  /**
   * Active quota rates in basis points. Missing keys are treated as inactive
   * (zero contribution), but a per-token entry is still reported.
   **/
  quotaRates: Record<Address, Bps>;
  /**
   * Resolves full token metadata for a quota token address.
   **/
  resolveToken: (address: Address) => Token;
}

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
 **/
export function calcBorrowRate(
  props: CalcBorrowRateProps,
): BorrowRateBreakdown {
  const { snapshot, baseInterestRate, feeInterest, quotaRates, resolveToken } =
    props;
  const { quotas, totalDebt, totalValue } = snapshot;
  const rates = new AddressMap(Object.entries(quotaRates));

  const base = calcBorrowApy(baseInterestRate, feeInterest);
  const fee = PERCENTAGE_FACTOR + BigInt(feeInterest);

  // Σ balance * rate over active quotas, before the interest fee
  let quotaRateSum = 0n;
  const perQuota: TokenQuotaRate[] = [];
  for (const q of quotas) {
    if (q.balance <= DUST_THRESHOLD) {
      continue;
    }
    const rate = rates.get(q.token);
    const rateBalance = rate === undefined ? 0n : q.balance * BigInt(rate);
    quotaRateSum += rateBalance;
    // per-token contributions carry the fee per token
    // (`getSingleQuotaBorrowRate` parity)
    const withFee = (rateBalance * fee) / PERCENTAGE_FACTOR;
    perQuota.push({
      token: resolveToken(q.token),
      rate: totalValue > 0n ? Number(withFee / totalValue) : 0,
    });
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
