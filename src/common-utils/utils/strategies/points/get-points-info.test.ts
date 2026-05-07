import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type {
  LocalPointsInfo,
  PointsList,
  StrategyCreditManagerLike,
} from "../types.js";
import { getPointsInfo } from "./get-points-info.js";

vi.mock("axios");

describe("getPointsInfo", () => {
  const token: Address = "0x0000000000000000000000000000000000000abc";
  const otherToken: Address = "0x0000000000000000000000000000000000000def";
  const cmAddress: Address = "0x0000000000000000000000000000000000000c01";
  const otherCmAddress: Address = "0x0000000000000000000000000000000000000c02";

  const basePoints: LocalPointsInfo = {
    symbol: "TOKEN",
    address: token,
    rewards: [
      {
        name: "pts",
        units: "pts",
        multiplier: 1_000n,
        type: "test",
      },
    ],
    debtRewards: [
      {
        name: "allowed",
        units: "pts",
        multiplier: 5_000n,
        type: "debt",
        cm: cmAddress,
      },
      {
        name: "any",
        units: "pts",
        multiplier: 9_000n,
        type: "debt",
        cm: "any",
      },
      {
        name: "filtered",
        units: "pts",
        multiplier: 7_000n,
        type: "debt",
        cm: otherCmAddress,
      },
    ],
  };

  const pointsList: PointsList = {
    [token]: basePoints,
    [otherToken]: {
      ...basePoints,
      address: otherToken,
    },
  } as unknown as PointsList;

  const creditManagers: Record<Address, StrategyCreditManagerLike> = {
    [cmAddress]: { address: cmAddress },
  };

  it("returns undefined when chainId or inputs are missing", () => {
    expect(
      getPointsInfo({
        chainId: undefined,
        pointsList,
        token,
        creditManagers,
      }),
    ).toBeUndefined();

    expect(
      getPointsInfo({
        chainId: 1,
        pointsList: undefined,
        token,
        creditManagers,
      }),
    ).toBeUndefined();
  });

  it("filters debt rewards to available credit managers and keeps 'any'", () => {
    const result = getPointsInfo({
      chainId: 1,
      pointsList,
      token,
      creditManagers,
    });

    expect(result?.debtRewards).toEqual([
      basePoints.debtRewards?.[0],
      basePoints.debtRewards?.[1],
    ]);
  });

  it("returns full info when credit managers list is missing", () => {
    const result = getPointsInfo({
      chainId: 1,
      pointsList,
      token,
      creditManagers: undefined,
    });

    expect(result?.debtRewards).toEqual(basePoints.debtRewards);
  });
});
