import type { Address } from "viem";
import { encodeFunctionData, getAddress } from "viem";
import { assert, describe, expect, it } from "vitest";
import { iCreditFacadeMulticallV310Abi } from "../../abi/310/generated.js";
import type { PriceUpdate } from "../market/index.js";
import type { MultiCall } from "../types/index.js";
import {
  extractPriceUpdates,
  extractQuotaTokens,
  mergePriceUpdates,
} from "./multicall-utils.js";

const FACADE: Address = "0xC78CF21A0f92929aC34ee86Cf94C15c9EE224adE";
const TOKEN_A: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const TOKEN_B: Address = "0xB908c9FE885369643adB5FBA4407d52bD726c72d";
const FEED_A: Address = "0x587660D2d2CCBA5eFD0594CCFdA03c5adc1A3Dc9";
const FEED_B: Address = "0x45B21851Ec20366C5965787C2Feb99FF3FEf7900";
const FEED_C: Address = "0x6578a7C543712a655812595Ddf4A00E931f5D4aF";

function makeOnDemandPriceUpdatesCall(
  updates: PriceUpdate[],
  target: Address = FACADE,
): MultiCall {
  return {
    target,
    callData: encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName: "onDemandPriceUpdates",
      args: [updates],
    }),
  };
}

function makeUpdateQuotaCall(
  token: Address,
  quotaChange: bigint,
  minQuota: bigint = 0n,
  target: Address = FACADE,
): MultiCall {
  return {
    target,
    callData: encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName: "updateQuota",
      args: [token, quotaChange, minQuota],
    }),
  };
}

function makeAddCollateralCall(
  token: Address,
  amount: bigint,
  target: Address = FACADE,
): MultiCall {
  return {
    target,
    callData: encodeFunctionData({
      abi: iCreditFacadeMulticallV310Abi,
      functionName: "addCollateral",
      args: [token, amount],
    }),
  };
}

describe("extractExistingPriceUpdates", () => {
  it("returns empty arrays for empty input", () => {
    const result = extractPriceUpdates([]);
    expect(result.priceUpdates).toEqual([]);
    expect(result.remainingCalls).toEqual([]);
  });

  it("extracts price updates from calls", () => {
    const updates: PriceUpdate[] = [
      { priceFeed: FEED_A, data: "0xaa" },
      { priceFeed: FEED_B, data: "0xbb" },
    ];
    const priceCall = makeOnDemandPriceUpdatesCall(updates);
    const quotaCall = makeUpdateQuotaCall(TOKEN_A, 100n);

    const result = extractPriceUpdates([priceCall, quotaCall]);

    expect(result.priceUpdates).toHaveLength(2);
    expect(result.priceUpdates[0].priceFeed).toBe(FEED_A);
    expect(result.priceUpdates[1].priceFeed).toBe(FEED_B);
    expect(result.remainingCalls).toEqual([quotaCall]);
  });

  it("merges price updates from multiple onDemandPriceUpdates calls", () => {
    const call1 = makeOnDemandPriceUpdatesCall([
      { priceFeed: FEED_A, data: "0xaa" },
    ]);
    const call2 = makeOnDemandPriceUpdatesCall([
      { priceFeed: FEED_B, data: "0xbb" },
    ]);
    const quotaCall = makeUpdateQuotaCall(TOKEN_A, 100n);

    const result = extractPriceUpdates([call1, quotaCall, call2]);

    expect(result.priceUpdates).toHaveLength(2);
    expect(result.priceUpdates[0].priceFeed).toBe(FEED_A);
    expect(result.priceUpdates[1].priceFeed).toBe(FEED_B);
    expect(result.remainingCalls).toEqual([quotaCall]);
  });

  it("returns all calls as remaining when no price updates exist", () => {
    const call1 = makeUpdateQuotaCall(TOKEN_A, 100n);
    const call2 = makeAddCollateralCall(TOKEN_B, 500n);

    const result = extractPriceUpdates([call1, call2]);

    expect(result.priceUpdates).toEqual([]);
    expect(result.remainingCalls).toEqual([call1, call2]);
  });
});

describe("extractQuotaTokens", () => {
  it("returns empty array for empty input", () => {
    expect(extractQuotaTokens([]).asArray()).toEqual([]);
  });

  it("extracts tokens from positive quotaChange calls", () => {
    const calls = [
      makeUpdateQuotaCall(TOKEN_A, 100n),
      makeUpdateQuotaCall(TOKEN_B, 200n),
    ];
    const tokens = extractQuotaTokens(calls);
    assert.includeMembers(tokens.asArray(), [TOKEN_A, TOKEN_B]);
  });

  it("ignores negative quotaChange calls", () => {
    const calls = [
      makeUpdateQuotaCall(TOKEN_A, 100n),
      makeUpdateQuotaCall(TOKEN_B, -50n),
    ];
    const tokens = extractQuotaTokens(calls);
    expect(tokens.asArray()).toEqual([TOKEN_A]);
  });

  it("ignores zero quotaChange calls", () => {
    const calls = [
      makeUpdateQuotaCall(TOKEN_A, 0n),
      makeUpdateQuotaCall(TOKEN_B, 100n),
    ];
    const tokens = extractQuotaTokens(calls);
    expect(tokens.asArray()).toEqual([TOKEN_B]);
  });

  it("deduplicates tokens", () => {
    const calls = [
      makeUpdateQuotaCall(TOKEN_A, 100n),
      makeUpdateQuotaCall(TOKEN_A, 200n),
    ];
    const tokens = extractQuotaTokens(calls);
    expect(tokens.asArray()).toEqual([TOKEN_A]);
  });

  it("ignores non-updateQuota calls", () => {
    const calls = [
      makeAddCollateralCall(TOKEN_A, 500n),
      makeOnDemandPriceUpdatesCall([]),
      makeUpdateQuotaCall(TOKEN_B, 100n),
    ];
    const tokens = extractQuotaTokens(calls);
    expect(tokens.asArray()).toEqual([TOKEN_B]);
  });
});

describe("mergePriceUpdates", () => {
  it("returns empty array when both inputs are empty", () => {
    expect(mergePriceUpdates([], [])).toEqual([]);
  });

  it("returns existing when generated is empty", () => {
    const existing: PriceUpdate[] = [{ priceFeed: FEED_A, data: "0xaa" }];
    expect(mergePriceUpdates(existing, [])).toEqual(existing);
  });

  it("returns generated when existing is empty", () => {
    const generated: PriceUpdate[] = [{ priceFeed: FEED_A, data: "0xaa" }];
    expect(mergePriceUpdates([], generated)).toEqual(generated);
  });

  it("deduplicates by priceFeed, existing takes priority", () => {
    const existing: PriceUpdate[] = [{ priceFeed: FEED_A, data: "0xexisting" }];
    const generated: PriceUpdate[] = [
      { priceFeed: FEED_A, data: "0xgenerated" },
      { priceFeed: FEED_B, data: "0xbb" },
    ];

    const result = mergePriceUpdates(existing, generated);

    expect(result).toHaveLength(2);
    const feedAUpdate = result.find(
      u => u.priceFeed.toLowerCase() === FEED_A.toLowerCase(),
    );
    expect(feedAUpdate?.data).toBe("0xexisting");
    const feedBUpdate = result.find(
      u => u.priceFeed.toLowerCase() === FEED_B.toLowerCase(),
    );
    expect(feedBUpdate?.data).toBe("0xbb");
  });

  it("deduplicates case-insensitively", () => {
    const existing: PriceUpdate[] = [
      { priceFeed: FEED_A.toLowerCase() as Address, data: "0xexisting" },
    ];
    const generated: PriceUpdate[] = [
      { priceFeed: getAddress(FEED_A), data: "0xgenerated" },
    ];

    const result = mergePriceUpdates(existing, generated);

    expect(result).toHaveLength(1);
    expect(result[0].data).toBe("0xexisting");
  });

  it("preserves all entries when no overlap", () => {
    const existing: PriceUpdate[] = [{ priceFeed: FEED_A, data: "0xaa" }];
    const generated: PriceUpdate[] = [
      { priceFeed: FEED_B, data: "0xbb" },
      { priceFeed: FEED_C, data: "0xcc" },
    ];

    const result = mergePriceUpdates(existing, generated);

    expect(result).toHaveLength(3);
  });
});
