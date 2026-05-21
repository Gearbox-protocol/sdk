import type { Address } from "viem";
import { isUsableToken } from "../../strategies/tokens/is-usable-token.js";
import type { CreditManagerSlice } from "../strategy-info/types.js";
export interface IsObtainableTokenProps {
  address: Address;
  creditManager: Pick<
    CreditManagerSlice,
    | "quotas"
    | "isQuoted"
    | "forbiddenTokens"
    | "liquidationThresholds"
    | "supportedTokens"
  >;
  delayedPhantoms: Record<Address, boolean>;
}

export function isObtainableToken({
  address,
  creditManager,
  delayedPhantoms,
}: IsObtainableTokenProps) {
  const {
    isActive,
    limit = 0n,
    totalQuoted = 0n,
  } = creditManager.quotas[address] || {};
  const realLimit = isActive ? limit || 0n : 0n;
  const quotaLeft = realLimit - totalQuoted;
  return (
    (creditManager.isQuoted(address) ? quotaLeft > 0 : true) &&
    isUsableToken({ address, creditManager }) &&
    !delayedPhantoms[address]
  );
}
