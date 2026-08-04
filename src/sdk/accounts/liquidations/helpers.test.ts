import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { CreditAccountData, TokenInfo } from "../../base/index.js";
import { ADDRESS_0X0 } from "../../constants/index.js";
import {
  calcEstimatedProfit,
  calcRepaymentAmount,
  DUST_THRESHOLD,
  pickMainAsset,
  toLiquidationApproval,
  toReceivedAssets,
} from "./helpers.js";

const UNDERLYING: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TOKEN_A: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const TOKEN_B: Address = "0xB908c9FE885369643adB5FBA4407d52bD726c72d";
const REDEEMER: Address = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const CREDIT_FACADE: Address = "0x5C3e2Bb0c93E1E9EA0eD68E4C2c1e8Bc45C7fA0e";
const CREDIT_MANAGER: Address = "0x3EB0e7Ac2fFcA6E7ec26bB3b0e4f5A1D07F2Aa19";
const LIQUIDATOR_CONTRACT: Address =
  "0x9aA6dE1B2C3f4e5D6a7B8c9D0e1F2a3B4c5D6e7F";

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

describe("toReceivedAssets", () => {
  it("maps instant outputs without redeemer data", () => {
    const assets = toReceivedAssets([
      {
        token: TOKEN_A,
        amount: 1_000n,
        delayed: false,
        redeemerAddress: ADDRESS_0X0,
        claimableAt: 0n,
      },
    ]);
    expect(assets).toEqual([
      { isDelayed: false, token: TOKEN_A, amount: 1_000n },
    ]);
  });

  it("maps delayed outputs with redeemer and claim timestamp", () => {
    const assets = toReceivedAssets([
      {
        token: TOKEN_A,
        amount: 1_000n,
        delayed: true,
        redeemerAddress: REDEEMER,
        claimableAt: 1_700_000_000n,
      },
    ]);
    expect(assets).toEqual([
      {
        isDelayed: true,
        token: TOKEN_A,
        amount: 1_000n,
        redeemerAddress: REDEEMER,
        claimableAt: 1_700_000_000n,
      },
    ]);
  });

  it("treats zero redeemer and zero timestamp of a delayed output as absent", () => {
    const [asset] = toReceivedAssets([
      {
        token: TOKEN_B,
        amount: 5n,
        delayed: true,
        redeemerAddress: ADDRESS_0X0,
        claimableAt: 0n,
      },
    ]);
    expect(asset).toEqual({ isDelayed: true, token: TOKEN_B, amount: 5n });
  });
});

describe("toLiquidationApproval", () => {
  const props = {
    creditFacade: CREDIT_FACADE,
    creditManager: CREDIT_MANAGER,
    token: UNDERLYING,
    amount: 1_000n,
  };

  it("approves the credit manager when the call targets the credit facade", () => {
    expect(toLiquidationApproval({ ...props, target: CREDIT_FACADE })).toEqual({
      spender: CREDIT_MANAGER,
      token: UNDERLYING,
      amount: 1_005n,
    });
  });

  it("approves the liquidator contract when the call targets one", () => {
    expect(
      toLiquidationApproval({ ...props, target: LIQUIDATOR_CONTRACT }),
    ).toEqual({
      spender: LIQUIDATOR_CONTRACT,
      token: UNDERLYING,
      amount: 1_005n,
    });
  });

  it("adds 0.5% of headroom to the pulled amount", () => {
    const approval = toLiquidationApproval({
      ...props,
      target: CREDIT_FACADE,
      amount: 1_000_000_000n,
    });
    expect(approval?.amount).toBe(1_005_000_000n);
  });

  it("returns undefined when the liquidation pulls nothing", () => {
    expect(
      toLiquidationApproval({ ...props, target: CREDIT_FACADE, amount: 0n }),
    ).toBeUndefined();
  });

  it("matches the credit facade regardless of address casing", () => {
    const approval = toLiquidationApproval({
      ...props,
      target: CREDIT_FACADE.toLowerCase() as Address,
    });
    expect(approval?.spender).toBe(CREDIT_MANAGER);
  });
});
