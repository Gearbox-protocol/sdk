import type { Address } from "viem";
import { TypedObjectUtils } from "../../../sdk/index.js";

export function getComplexAPYList<T extends Address | undefined = undefined>(
  baseAPYList: Record<Address, number> | undefined,
  extraCollateralAPYList:
    | Record<
        Address,
        Record<Address, { type: "relative" | "absolute"; value: number }>
      >
    | undefined,
  pool: T | undefined,
): Record<Address, number> | undefined {
  if (!pool) return baseAPYList;

  const poolExtraCollateralAPY = extraCollateralAPYList?.[pool];
  if (!poolExtraCollateralAPY) return baseAPYList;

  const baseCopy = { ...baseAPYList };
  TypedObjectUtils.entries(poolExtraCollateralAPY).forEach(
    ([token, extraAPY]) => {
      const baseAPY = baseCopy[token];

      if (extraAPY.type === "relative" && baseAPY !== undefined) {
        baseCopy[token] = baseAPY + extraAPY.value;
      } else if (extraAPY.type === "absolute") {
        baseCopy[token] = extraAPY.value;
      }
    },
  );

  return baseCopy;
}
