import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { positionTransactionSchema } from "./positions.schema.js";

const USDC = {
  chainId: 1,
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
};

const WETH = {
  chainId: 1,
  address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  symbol: "WETH",
  name: "Wrapped Ether",
  decimals: 18,
};

describe("position transaction schema", () => {
  it("decodes and encodes signed balance and debt changes", () => {
    const wire = {
      txHash:
        "0x000000000000000000000000000000000000000000000000000000000000feed",
      timestamp: 1_700_000_000,
      kind: "repay" as const,
      assets: [{ value: "1000000", valueUsd: null, token: USDC }],
      balanceChanges: [
        { value: "1000000", valueUsd: null, token: USDC },
        {
          value: "-500000000000000000",
          valueUsd: null,
          token: WETH,
        },
      ],
      debtChange: { value: "-750000", valueUsd: null, token: USDC },
    };

    const decoded = z.decode(positionTransactionSchema, wire);

    expect(decoded.balanceChanges.map(amount => amount.value)).toEqual([
      1_000_000n,
      -500_000_000_000_000_000n,
    ]);
    expect(decoded.debtChange.value).toBe(-750_000n);
    const encoded = z.encode(positionTransactionSchema, decoded);
    expect(encoded.balanceChanges.map(amount => amount.value)).toEqual([
      "1000000",
      "-500000000000000000",
    ]);
    expect(encoded.debtChange.value).toBe("-750000");
  });

  it.each(["repay", "rebalance", "composite", "unknown"] as const)(
    "accepts the %s classifier result",
    kind => {
      expect(
        positionTransactionSchema.parse({
          txHash: "0x01",
          timestamp: 1,
          kind,
          assets: [],
          balanceChanges: [],
          debtChange: { value: 0n, valueUsd: null, token: USDC },
        }).kind,
      ).toBe(kind);
    },
  );
});
