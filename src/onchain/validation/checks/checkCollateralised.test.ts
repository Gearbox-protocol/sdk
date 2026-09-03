import { describe, expect, it } from "vitest";
import {
  MIN_HEALTH_FACTOR_FACADE,
  MIN_HEALTH_FACTOR_FORM,
} from "../helpers/index.js";
import { checkCollateralised } from "./checkCollateralised.js";

describe("checkCollateralised", () => {
  const at = (
    healthFactor: number | undefined,
    healthFactorThreshold: number,
  ) =>
    checkCollateralised({
      healthFactor,
      healthFactorThreshold,
      safePrices: false,
    });

  it("accepts a factor exactly at the threshold, at either threshold", () => {
    expect(at(MIN_HEALTH_FACTOR_FACADE, MIN_HEALTH_FACTOR_FACADE)).toEqual([]);
    expect(at(MIN_HEALTH_FACTOR_FORM, MIN_HEALTH_FACTOR_FORM)).toEqual([]);
  });

  it("keeps the two thresholds apart", () => {
    // 10100 is what the legacy form validator refused and the facade allowed.
    expect(at(10_100, MIN_HEALTH_FACTOR_FACADE)).toEqual([]);
    expect(at(10_100, MIN_HEALTH_FACTOR_FORM)[0]?.code).toBe(
      "insufficientCollateral",
    );
  });

  it("treats an unread factor as failing", () => {
    expect(at(undefined, MIN_HEALTH_FACTOR_FACADE)).toEqual([
      {
        code: "insufficientCollateral",
        message: expect.any(String),
        healthFactor: 0,
        healthFactorThreshold: MIN_HEALTH_FACTOR_FACADE,
        safePrices: false,
      },
    ]);
  });

  it("passes the zero-debt sentinel at every threshold", () => {
    expect(at(65_535, MIN_HEALTH_FACTOR_FORM)).toEqual([]);
  });

  it("lets an operation that raises the factor through from under the required factor", () => {
    // The account is already below; the top-up that rescues it must not be
    // refused by the check meant to protect it.
    expect(
      checkCollateralised({
        healthFactor: 10_080,
        healthFactorThreshold: MIN_HEALTH_FACTOR_FORM,
        safePrices: false,
        improvesFrom: 10_050,
      }),
    ).toEqual([]);
  });

  it("still refuses when the operation does not raise it", () => {
    const at = (improvesFrom: number) =>
      checkCollateralised({
        healthFactor: 10_080,
        healthFactorThreshold: MIN_HEALTH_FACTOR_FORM,
        safePrices: false,
        improvesFrom,
      });

    expect(at(10_080)[0]?.code).toBe("insufficientCollateral");
    expect(at(10_090)[0]?.code).toBe("insufficientCollateral");
  });

  it("refuses an unread factor whatever the account stands at", () => {
    expect(
      checkCollateralised({
        healthFactor: undefined,
        healthFactorThreshold: MIN_HEALTH_FACTOR_FORM,
        safePrices: false,
        improvesFrom: 1,
      })[0]?.code,
    ).toBe("insufficientCollateral");
  });

  it("records which pricing the factor was read at", () => {
    expect(
      checkCollateralised({
        healthFactor: 1,
        healthFactorThreshold: MIN_HEALTH_FACTOR_FACADE,
        safePrices: true,
      })[0],
    ).toMatchObject({ safePrices: true });
  });
});
