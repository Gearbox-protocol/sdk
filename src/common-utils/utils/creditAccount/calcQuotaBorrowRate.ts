import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";
import type { QuotaInfoSlice } from "./types.js";

export interface CalcQuotaBorrowRateProps {
  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, QuotaInfoSlice>;
}

export function calcQuotaBorrowRate({
  quotas,
  quotaRates,
}: CalcQuotaBorrowRateProps) {
  const totalRateBalance = Object.values(quotas).reduce(
    (acc, { token, balance }) => {
      const { rate = 0, isActive = false } = quotaRates?.[token] || {};

      const quotaBalance = isActive ? balance : 0n;
      const rateBalance = quotaBalance * BigInt(rate);

      return acc + rateBalance;
    },
    0n,
  );
  return totalRateBalance;
}
