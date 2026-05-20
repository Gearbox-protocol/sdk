import type { Address } from "viem";
import type { Asset } from "../../../../sdk/router/types.js";

export function getDefaultAsset(token: Address): Omit<Asset, "balance"> {
  return { token };
}
