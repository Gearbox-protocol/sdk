import type { Address } from "viem";

import type { Asset } from "../../../sdk/index.js";
export interface ValidateTokenToObtainProps {
  targetToken: Address | Array<Asset> | null;
  creditManager: { forbiddenTokens: Record<Address, boolean> };
}

export interface ValidateTokenToObtainResult {
  message: "tokenIsForbidden";
  token: Address;
}

export function validateTokenToObtain({
  creditManager,
  targetToken,
}: ValidateTokenToObtainProps): ValidateTokenToObtainResult | null {
  if (Array.isArray(targetToken)) {
    for (const asset of targetToken) {
      if (creditManager.forbiddenTokens[asset.token])
        return { message: "tokenIsForbidden", token: asset.token };
    }
    return null;
  }

  if (targetToken !== null && creditManager.forbiddenTokens[targetToken])
    return { message: "tokenIsForbidden", token: targetToken };

  return null;
}
