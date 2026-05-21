import type { Address } from "viem";

import type { LocalPointsInfo } from "./points-slices.js";

export interface PricesRecord {
  [pool: Address]: {
    [token: Address]: bigint;
  };
}

export interface APYList {
  apyList: Record<Address, number> | undefined;
  extraCollateralAPYList:
    | Record<
        Address,
        Record<Address, { type: "relative" | "absolute"; value: number }>
      >
    | undefined;
  pointsList: Record<Address, LocalPointsInfo> | undefined;
  extraCollateralPointsList:
    | Record<Address, Record<Address, LocalPointsInfo>>
    | undefined;
}
