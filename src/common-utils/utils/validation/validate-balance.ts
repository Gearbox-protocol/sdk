import type { Address } from "viem";
import { EMPTY_ADDRESS } from "../constants.js";
import { isZeroBalance } from "./is-zero-balance.js";

export interface ValidateBalanceProps {
  amount: bigint;
  tokenAddress: Address;
  maxAmount: bigint | undefined;
  zeroCheck?: boolean;
  single?: boolean;
}

export type ValidateBalanceResult =
  | { message: "unknownToken"; token: Address }
  | { message: "insufficientFunds"; token: Address }
  | { message: "zeroBalance"; token: Address }
  | { message: "enterAmount"; token: Address };

export function validateBalance({
  amount,
  tokenAddress,
  maxAmount = 0n,
  zeroCheck = true,
  single,
}: ValidateBalanceProps): ValidateBalanceResult | null {
  const safeAddress = tokenAddress || EMPTY_ADDRESS;

  if (!safeAddress) return { message: "unknownToken", token: safeAddress };

  if (maxAmount < amount)
    return { message: "insufficientFunds", token: safeAddress };

  if (zeroCheck && isZeroBalance(amount))
    return {
      message: single ? "enterAmount" : "zeroBalance",
      token: safeAddress,
    };

  return null;
}
