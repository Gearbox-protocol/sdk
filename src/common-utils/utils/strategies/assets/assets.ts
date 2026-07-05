import type { Address } from "viem";
import type { Asset } from "../../../../sdk/index.js";

export function getDefaultAsset(token: Address): Omit<Asset, "balance"> {
  return { token };
}
