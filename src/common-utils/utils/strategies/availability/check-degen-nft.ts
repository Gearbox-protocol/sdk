import { ADDRESS_0X0 } from "../../../../sdk/index.js";

import type { CreditManagerSlice } from "../strategy-info/types.js";

export function checkDegenNFT(
  creditManager: Pick<CreditManagerSlice, "isDegenMode" | "degenNFT">,
) {
  const nftAddress = creditManager.isDegenMode
    ? creditManager.degenNFT
    : ADDRESS_0X0;

  return {
    nftAddress,
    freeOfNFT: nftAddress === ADDRESS_0X0,
  };
}
