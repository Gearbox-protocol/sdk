import { describe, expect, it } from "vitest";

import { mockToken1 } from "../../../test-utils/index.js";
import type { AppChains, NotValidatedStrategy } from "../types.js";
import { isStrategyEligible } from "./is-strategy-eligible.js";

describe("isStrategyEligible", () => {
  const chainId = 1;
  const appChains = { [chainId]: "Mainnet" } as unknown as AppChains;
  const tokenOut = mockToken1;
  const baseStrategy: NotValidatedStrategy = {
    chainId,
    network: "Mainnet",
    id: tokenOut,
    name: "strategy",
    tokenOutAddress: tokenOut,
    creditManagers: [],
    strategyType: ["stable"],
  };

  const sdkStateWithToken = {
    [chainId]: {
      tokens: {
        tokenDataList: {
          [tokenOut]: { address: tokenOut, decimals: 18, title: "TOK" },
        },
      },
    },
  } as any;

  it("returns eligible when network matches, token exists, and visible", () => {
    const result = isStrategyEligible(
      baseStrategy,
      appChains,
      false,
      sdkStateWithToken,
      undefined,
    );

    expect(result).toEqual({ isEligible: true, network: "Mainnet" });
  });

  it("returns ineligible when network missing or mismatched", () => {
    const badChains = {} as AppChains;
    const result = isStrategyEligible(
      baseStrategy,
      badChains,
      false,
      sdkStateWithToken,
      undefined,
    );

    expect(result).toEqual({ isEligible: false, network: undefined });
  });

  it("returns ineligible when hidden in prod", () => {
    const result = isStrategyEligible(
      { ...baseStrategy, hideInProd: true },
      appChains,
      false,
      sdkStateWithToken,
      undefined,
    );

    expect(result).toEqual({ isEligible: false, network: undefined });
  });

  it("ignores hideInProd when isDev is true", () => {
    const result = isStrategyEligible(
      { ...baseStrategy, hideInProd: true },
      appChains,
      true,
      sdkStateWithToken,
      undefined,
    );

    expect(result).toEqual({ isEligible: true, network: "Mainnet" });
  });

  it("returns ineligible when token is missing in sdk state", () => {
    const result = isStrategyEligible(
      baseStrategy,
      appChains,
      false,
      undefined,
      undefined,
    );

    expect(result).toEqual({ isEligible: false, network: undefined });
  });

  it("requires showInMainApp unless curator filter forces inclusion", () => {
    const hiddenResult = isStrategyEligible(
      { ...baseStrategy, showInMainApp: false },
      appChains,
      false,
      sdkStateWithToken,
      undefined,
    );
    const forcedResult = isStrategyEligible(
      { ...baseStrategy, showInMainApp: false },
      appChains,
      false,
      sdkStateWithToken,
      {},
    );

    expect(hiddenResult).toEqual({ isEligible: false, network: undefined });
    expect(forcedResult).toEqual({ isEligible: true, network: "Mainnet" });
  });
});
