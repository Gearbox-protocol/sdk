import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { CreditAccountData, TokenInfo } from "../../base/index.js";
import {
  calcEstimatedProfit,
  calcRepaymentAmount,
  DUST_THRESHOLD,
  pickMainAsset,
} from "./helpers.js";

const UNDERLYING: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TOKEN_A: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const TOKEN_B: Address = "0xB908c9FE885369643adB5FBA4407d52bD726c72d";

function tokenInfo(
  token: Address,
  balance: bigint,
  mask = 1n,
  overrides?: Partial<TokenInfo>,
): TokenInfo {
  return { token, balance, mask, quota: 0n, success: true, ...overrides };
}

/**
 * Builds a stub with only the fields {@link pickMainAsset} reads.
 **/
function creditAccount(
  tokens: TokenInfo[],
  enabledTokensMask = ~0n,
): CreditAccountData {
  return {
    underlying: UNDERLYING,
    enabledTokensMask,
    tokens,
  } as unknown as CreditAccountData;
}

// value = balance (identity price)
const identityConvert = (_token: Address, balance: bigint) => balance;

describe("calcRepaymentAmount / calcEstimatedProfit", () => {
  it("splits total value into repayment and profit by liquidation discount", () => {
    const totalValue = 1_000_000n;
    const liquidationDiscount = 9600; // 96% in bps

    const repayment = calcRepaymentAmount(totalValue, liquidationDiscount);
    const profit = calcEstimatedProfit(totalValue, liquidationDiscount);

    expect(repayment).toBe(960_000n);
    expect(profit).toBe(40_000n);
    expect(repayment + profit).toBe(totalValue);
  });

  it("returns zero for zero total value", () => {
    expect(calcRepaymentAmount(0n, 9600)).toBe(0n);
    expect(calcEstimatedProfit(0n, 9600)).toBe(0n);
  });
});

describe("pickMainAsset", () => {
  it("picks the most valuable non-underlying token", () => {
    const asset = pickMainAsset(
      creditAccount([
        tokenInfo(TOKEN_A, 100n, 1n),
        tokenInfo(TOKEN_B, 200n, 2n),
        tokenInfo(UNDERLYING, 100_000n, 4n),
      ]),
      identityConvert,
    );
    expect(asset).toBe(TOKEN_B);
  });

  it("skips disabled tokens", () => {
    const asset = pickMainAsset(
      creditAccount(
        [tokenInfo(TOKEN_A, 100n, 1n), tokenInfo(TOKEN_B, 200n, 2n)],
        1n,
      ),
      identityConvert,
    );
    expect(asset).toBe(TOKEN_A);
  });

  it("skips dust balances", () => {
    const asset = pickMainAsset(
      creditAccount([
        tokenInfo(TOKEN_A, DUST_THRESHOLD, 1n),
        tokenInfo(TOKEN_B, DUST_THRESHOLD + 1n, 2n),
      ]),
      identityConvert,
    );
    expect(asset).toBe(TOKEN_B);
  });

  it("skips tokens without a price", () => {
    const asset = pickMainAsset(
      creditAccount([
        tokenInfo(TOKEN_A, 100n, 1n),
        tokenInfo(TOKEN_B, 200n, 2n),
      ]),
      (token, balance) => (token === TOKEN_B ? 0n : balance),
    );
    expect(asset).toBe(TOKEN_A);
  });

  it("returns undefined when the account holds only underlying or dust", () => {
    const asset = pickMainAsset(
      creditAccount([
        tokenInfo(UNDERLYING, 100_000n, 1n),
        tokenInfo(TOKEN_A, DUST_THRESHOLD, 2n),
      ]),
      identityConvert,
    );
    expect(asset).toBeUndefined();
  });
});
