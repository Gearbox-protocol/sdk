import type { Address } from "viem";
import { isUsableToken } from "../../utils/strategies/tokens/is-usable-token.js";
import type { QuotaInfo } from "./types.js";
export interface IsObtainableTokenProps {
  address: Address;
  creditManager: {
    quotas: Record<Address, QuotaInfo | undefined>;
    isQuoted(token: Address): boolean;
    forbiddenTokens: Record<Address, true>;
    liquidationThresholds: Record<Address, bigint>;
    supportedTokens: Record<Address, true>;
  };
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
