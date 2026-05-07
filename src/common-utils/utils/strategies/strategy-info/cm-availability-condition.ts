import type { Address } from "viem";

import {
  checkBoolean,
  checkDegenNFT,
  validateOpenAccountPoolStatus,
} from "../availability/index.js";
import type { CreditManagerSlice, PoolSlice } from "./types.js";

export function cmAvailabilityCondition(
  targetToken: Address,
  cmA: CreditManagerSlice,
  cmB: CreditManagerSlice,
  pools: Record<Address, PoolSlice> | null | undefined,
): number {
  const aHasMinError = validateOpenAccountPoolStatus({
    pool: pools?.[cmA.pool],
    debt: cmA.minDebt,
    creditManager: cmA,
    targetToken,
  });
  const bHasMinError = validateOpenAccountPoolStatus({
    pool: pools?.[cmB.pool],
    debt: cmB.minDebt,
    creditManager: cmB,
    targetToken,
  });

  const minSort = checkBoolean(!aHasMinError, !bHasMinError);
  if (minSort !== 0) return minSort;

  // cms with no degen nft have priority
  const { freeOfNFT: aFreeOfNFT } = checkDegenNFT(cmA);
  const { freeOfNFT: bFreeOfNFT } = checkDegenNFT(cmB);

  const nftSort = checkBoolean(aFreeOfNFT, bFreeOfNFT);
  if (nftSort !== 0) return nftSort;

  // check if max debt cn be opened
  const aHasMaxError = validateOpenAccountPoolStatus({
    pool: pools?.[cmA.pool],
    debt: cmA.maxDebt,
    creditManager: cmA,
    targetToken,
  });
  const bHasMaxError = validateOpenAccountPoolStatus({
    pool: pools?.[cmB.pool],
    debt: cmB.maxDebt,
    creditManager: cmB,
    targetToken,
  });

  const maxSort = checkBoolean(!aHasMaxError, !bHasMaxError);
  if (maxSort !== 0) return maxSort;

  return 0;
}
