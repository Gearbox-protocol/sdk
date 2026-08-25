import type { Address } from "viem";
import type { Asset } from "../../../../onchain/index.js";

export function getDefaultAsset(token: Address): Omit<Asset, "balance"> {
  return { token };
}
