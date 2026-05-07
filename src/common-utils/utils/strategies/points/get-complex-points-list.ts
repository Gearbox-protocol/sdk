import type { Address } from "viem";
import { TypedObjectUtils } from "../../../../sdk/utils/mappers.js";

import type { LocalPointsInfo } from "../types.js";

// Override default points depending on selected pool.
export function getComplexPointsList<T extends Address | undefined = undefined>(
  baseList: Record<Address, LocalPointsInfo> | undefined,
  extraList: Record<Address, Record<Address, LocalPointsInfo>> | undefined,
  pool: T | undefined,
): Record<Address, LocalPointsInfo> | undefined {
  if (!pool) return baseList;

  const poolExtra = extraList?.[pool];
  if (!poolExtra) return baseList;

  const baseCopy = { ...baseList };
  TypedObjectUtils.entries(poolExtra).forEach(([token, extra]) => {
    baseCopy[token] = extra;
  });

  return baseCopy;
}
