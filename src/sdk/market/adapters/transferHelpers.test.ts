import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { Transfers } from "./legacyAdapterOperations.js";
import {
  allTransfersAsTokenAmounts,
  classifyCurveOperation,
  curveAddLiquidityFromTransfers,
  curveRemoveLiquidityFromTransfers,
  parsePosNegAmount,
  rewardsFromTransfers,
  swapFromTransfers,
} from "./transferHelpers.js";

const ZERO = "0x0000000000000000000000000000000000000000" as Address;
const TOKEN_A = "0x000000000000000000000000000000000000000A" as Address;
const TOKEN_B = "0x000000000000000000000000000000000000000B" as Address;
const TOKEN_C = "0x000000000000000000000000000000000000000C" as Address;
const LP_TOKEN = "0x00000000000000000000000000000000000000Cc" as Address;

describe("parsePosNegAmount", () => {
  it("splits positive and negative entries, storing negatives as absolute", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -100n,
      [TOKEN_B]: 200n,
    };
    const { pos, neg } = parsePosNegAmount(transfers);
    expect(neg).toEqual([{ token: TOKEN_A, amount: "100" }]);
    expect(pos).toEqual([{ token: TOKEN_B, amount: "200" }]);
  });

  it("ignores zero amounts", () => {
    const transfers: Transfers = {
      [TOKEN_A]: 0n,
      [TOKEN_B]: 50n,
    };
    const { pos, neg } = parsePosNegAmount(transfers);
    expect(neg).toEqual([]);
    expect(pos).toEqual([{ token: TOKEN_B, amount: "50" }]);
  });

  it("handles empty transfers", () => {
    const { pos, neg } = parsePosNegAmount({});
    expect(pos).toEqual([]);
    expect(neg).toEqual([]);
  });

  it("handles multiple entries on each side", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -10n,
      [TOKEN_B]: -20n,
      [TOKEN_C]: 30n,
      [LP_TOKEN]: 40n,
    };
    const { pos, neg } = parsePosNegAmount(transfers);
    expect(neg).toHaveLength(2);
    expect(pos).toHaveLength(2);
  });
});

describe("swapFromTransfers", () => {
  it("parses a simple swap", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -1000n,
      [TOKEN_B]: 2000n,
    };
    const result = swapFromTransfers(transfers);
    expect(result).toEqual({
      from: TOKEN_A,
      fromAmount: "1000",
      to: TOKEN_B,
      toAmount: "2000",
    });
  });

  it("returns zero addresses for empty transfers", () => {
    const result = swapFromTransfers({});
    expect(result).toEqual({
      from: ZERO,
      fromAmount: "0",
      to: ZERO,
      toAmount: "0",
    });
  });

  it("handles single-sided transfers (deposit only)", () => {
    const transfers: Transfers = { [TOKEN_A]: -500n };
    const result = swapFromTransfers(transfers);
    expect(result.from).toBe(TOKEN_A);
    expect(result.fromAmount).toBe("500");
    expect(result.to).toBe(ZERO);
    expect(result.toAmount).toBe("0");
  });

  it("handles single-sided transfers (receive only)", () => {
    const transfers: Transfers = { [TOKEN_B]: 300n };
    const result = swapFromTransfers(transfers);
    expect(result.from).toBe(ZERO);
    expect(result.fromAmount).toBe("0");
    expect(result.to).toBe(TOKEN_B);
    expect(result.toAmount).toBe("300");
  });
});

describe("rewardsFromTransfers", () => {
  it("returns all positive entries", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -100n,
      [TOKEN_B]: 200n,
      [TOKEN_C]: 300n,
    };
    const rewards = rewardsFromTransfers(transfers);
    expect(rewards).toEqual([
      { token: TOKEN_B, amount: "200" },
      { token: TOKEN_C, amount: "300" },
    ]);
  });

  it("returns empty array when no positive entries", () => {
    const transfers: Transfers = { [TOKEN_A]: -100n };
    expect(rewardsFromTransfers(transfers)).toEqual([]);
  });
});

describe("allTransfersAsTokenAmounts", () => {
  it("returns absolute values for all entries", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -100n,
      [TOKEN_B]: 200n,
    };
    const result = allTransfersAsTokenAmounts(transfers);
    expect(result).toEqual([
      { token: TOKEN_A, amount: "100" },
      { token: TOKEN_B, amount: "200" },
    ]);
  });
});

describe("curveAddLiquidityFromTransfers", () => {
  it("parses added liquidity and LP token", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -100n,
      [TOKEN_B]: -200n,
      [LP_TOKEN]: 500n,
    };
    const result = curveAddLiquidityFromTransfers(transfers);
    expect(result.operation).toBe("CurveAddLiquidity");
    expect(result.addedLiquidity).toHaveLength(2);
    expect(result.lpToken).toBe(LP_TOKEN);
    expect(result.lpAmount).toBe("500");
  });

  it("handles empty transfers gracefully", () => {
    const result = curveAddLiquidityFromTransfers({});
    expect(result.operation).toBe("CurveAddLiquidity");
    expect(result.addedLiquidity).toEqual([]);
    expect(result.lpToken).toBe(ZERO);
    expect(result.lpAmount).toBe("0");
  });
});

describe("curveRemoveLiquidityFromTransfers", () => {
  it("parses received tokens and LP token", () => {
    const transfers: Transfers = {
      [LP_TOKEN]: -500n,
      [TOKEN_A]: 100n,
      [TOKEN_B]: 200n,
    };
    const result = curveRemoveLiquidityFromTransfers(transfers);
    expect(result.operation).toBe("CurveRemoveLiquidity");
    expect(result.tokenReceived).toHaveLength(2);
    expect(result.lpToken).toBe(LP_TOKEN);
    expect(result.lpAmount).toBe("500");
  });
});

describe("classifyCurveOperation", () => {
  const swapTransfers: Transfers = {
    [TOKEN_A]: -100n,
    [TOKEN_B]: 200n,
  };

  it("classifies exchange as CurveExchange", () => {
    const result = classifyCurveOperation("exchange", swapTransfers);
    expect(result?.operation).toBe("CurveExchange");
  });

  it("classifies exchange_underlying as CurveExchange", () => {
    const result = classifyCurveOperation("exchange_underlying", swapTransfers);
    expect(result?.operation).toBe("CurveExchange");
  });

  it("classifies exchange_diff as CurveExchange", () => {
    const result = classifyCurveOperation("exchange_diff", swapTransfers);
    expect(result?.operation).toBe("CurveExchange");
  });

  it("classifies add_liquidity as CurveAddLiquidity", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -100n,
      [LP_TOKEN]: 500n,
    };
    const result = classifyCurveOperation("add_liquidity", transfers);
    expect(result?.operation).toBe("CurveAddLiquidity");
  });

  it("classifies add_liquidity_one_coin as CurveAddLiquidity", () => {
    const transfers: Transfers = {
      [TOKEN_A]: -100n,
      [LP_TOKEN]: 500n,
    };
    const result = classifyCurveOperation("add_liquidity_one_coin", transfers);
    expect(result?.operation).toBe("CurveAddLiquidity");
  });

  it("classifies remove_liquidity_one_coin as CurveRemoveLiquidityOneCoin", () => {
    const result = classifyCurveOperation(
      "remove_liquidity_one_coin",
      swapTransfers,
    );
    expect(result?.operation).toBe("CurveRemoveLiquidityOneCoin");
  });

  it("classifies remove_liquidity as CurveRemoveLiquidity", () => {
    const transfers: Transfers = {
      [LP_TOKEN]: -500n,
      [TOKEN_A]: 100n,
      [TOKEN_B]: 200n,
    };
    const result = classifyCurveOperation("remove_liquidity", transfers);
    expect(result?.operation).toBe("CurveRemoveLiquidity");
  });

  it("classifies remove_liquidity_imbalance as CurveRemoveLiquidity", () => {
    const transfers: Transfers = {
      [LP_TOKEN]: -500n,
      [TOKEN_A]: 100n,
    };
    const result = classifyCurveOperation(
      "remove_liquidity_imbalance",
      transfers,
    );
    expect(result?.operation).toBe("CurveRemoveLiquidity");
  });

  it("returns undefined for unknown function names", () => {
    expect(classifyCurveOperation("unknown", swapTransfers)).toBeUndefined();
  });
});
