import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";
import type { ValidateBalanceResult } from "./validate-balance.js";
import { validateBalance } from "./validate-balance.js";
export interface ValidateBalancesProps {
  balances: Record<Address, bigint>;
  assets: Array<Asset>;
  zeroCheck?: boolean;
}

export function validateBalances({
  balances,
  assets,
  zeroCheck = true,
}: ValidateBalancesProps): ValidateBalanceResult | null {
  for (const { token: tokenAddress, balance: amount } of assets) {
    const e = validateBalance({
      tokenAddress,
      amount,
      maxAmount: balances[(tokenAddress || "").toLowerCase() as Address] || 0n,
      zeroCheck,
    });
    if (e !== null) return e;
  }

  return null;
}
