import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { buildCreditManager, buildTokenData } from "../../../test-utils";
import { isCollateralToken } from "./is-collateral-token.js";

const buildAllPrices = (
  _: any,
  token: Address,
  value = 100n,
): Record<Address, bigint> => {
  return {
    [token]: value,
  };
};

describe("isCollateralToken", () => {
  const underlying: Address = "0xunderlying";
  const token: Address = "0xtoken";
  const tokensList = {
    [token]: buildTokenData(token, "TOKEN"),
  };

  const baseCM = buildCreditManager({
    underlyingToken: underlying,
    quotas: {},
  });

  it("returns true for underlying token", () => {
    const result = isCollateralToken({
      address: underlying,
      tokensList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: undefined,
      prices: undefined,
    });
    expect(result).toBe(true);
  });

  it("returns false when zeroDebt is true", () => {
    const result = isCollateralToken({
      address: token,
      tokensList,
      creditManager: baseCM,
      zeroDebt: true,
      delayedPhantoms: {},
      extraCollateralConfigs: undefined,
      prices: undefined,
    });
    expect(result).toBe(false);
  });

  it("returns false when cm check fails", () => {
    // token not in supportedTokens -> isUsableToken returns false -> isObtainableToken returns false
    const result = isCollateralToken({
      address: token,
      tokensList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: undefined,
      prices: undefined,
    });
    expect(result).toBe(false);
  });

  it("returns true when not obtainable but listed as extra collateral for cm and has price", () => {
    const result = isCollateralToken({
      address: token,
      tokensList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: [{ token, cm: baseCM.address }],
      prices: buildAllPrices(baseCM, token),
    });
    expect(result).toBe(true);
  });

  it("returns false when not obtainable but listed as extra collateral for cm and has no price", () => {
    const zeroPriceResult = isCollateralToken({
      address: token,
      tokensList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: [{ token, cm: baseCM.address }],
      prices: buildAllPrices(baseCM, token, 0n),
    });
    expect(zeroPriceResult).toBe(false);

    const undefinedPriceResult = isCollateralToken({
      address: token,
      tokensList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: [{ token, cm: baseCM.address }],
      prices: undefined,
    });
    expect(undefinedPriceResult).toBe(false);
  });

  it("returns false when extra collateral config targets different credit manager", () => {
    const result = isCollateralToken({
      address: token,
      tokensList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: [{ token, cm: "0xother" as Address }],
      prices: buildAllPrices(baseCM, token),
    });
    expect(result).toBe(false);
  });

  it("returns false when token is phantom", () => {
    const phantomTokenList = {
      [token]: buildTokenData(token, "TOKEN", 18, true),
    };
    const result = isCollateralToken({
      address: token,
      tokensList: phantomTokenList,
      creditManager: baseCM,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: undefined,
      prices: undefined,
    });
    expect(result).toBe(false);
  });

  it("returns true when obtainable, non-phantom, not underlying", () => {
    // Make token supported so isObtainableToken returns true
    const cmWithSupportedToken = buildCreditManager({
      underlyingToken: underlying,
      supportedTokens: { [token]: true },
      liquidationThresholds: { [token]: 8000n },
      quotas: {},
    });
    const result = isCollateralToken({
      address: token,
      tokensList,
      creditManager: cmWithSupportedToken,
      zeroDebt: false,
      delayedPhantoms: {},
      extraCollateralConfigs: undefined,
      prices: undefined,
    });
    expect(result).toBe(true);
  });
});
