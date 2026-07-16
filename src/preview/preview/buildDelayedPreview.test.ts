import type { Address } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import { AssetsMap } from "../../sdk/index.js";
import { buildDelayedPreview, type ConvertFn } from "./buildDelayedPreview.js";
import { CreditAccountState } from "./CreditAccountState.js";
import type { DetectedDelayedOperation } from "./detectDelayedOperation.js";
import { ERROR_UNPRICEABLE_TOKEN } from "./types.js";

const CREDIT_ACCOUNT = getAddress("0x82900e2Ab20B6F60C159F1A141A6f2d3D810C4fA");
const CREDIT_MANAGER = getAddress("0x025512D771f778fad99aB30b7A7363E7C8DE078D");
// dcUSDC, the credit manager underlying (RWA vault share over USDC)
const UNDERLYING = getAddress("0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
// Securitize redemption phantom token
const PHANTOM = getAddress("0xF126EaCAcf6B14C8985fC195768A55E886Af4208");
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const OWNER = getAddress("0xC32FEB4DBd127a1993478Ad6E5250710f838b908");

/**
 * Oracle stub: USDC and the underlying are 1:1 (dcUSDC is a USDC wrapper),
 * WETH is 2000 underlying per unit; anything else is unpriceable.
 */
const convert: ConvertFn = (token, to, amount) => {
  const rates: Record<Address, bigint> = {
    [UNDERLYING]: 1n,
    [USDC]: 1n,
    [PHANTOM]: 1n,
    [WETH]: 2000n,
  };
  const from = rates[getAddress(token)];
  const target = rates[getAddress(to)];
  if (from === undefined || target === undefined) {
    throw new Error(`cannot price ${token}`);
  }
  return (amount * from) / target;
};

interface MakeAccountOptions {
  balances?: AssetsMap;
  debt?: bigint;
  totalDebt?: bigint;
  quotas?: AssetsMap;
}

function makeAccount(options: MakeAccountOptions = {}): CreditAccountState {
  return new CreditAccountState({
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    underlying: UNDERLYING,
    balances: options.balances,
    debt: options.debt,
    totalDebt: options.totalDebt,
    quotas: options.quotas,
  });
}

function detected(
  intent?: DetectedDelayedOperation["intent"],
): DetectedDelayedOperation {
  return {
    request: { phantomToken: PHANTOM, claimToken: USDC },
    intent,
  };
}

describe("buildDelayedPreview CLOSE_ACCOUNT", () => {
  // Post-instant state of the step-1 close tx from tmp/rwa/step1.json:
  // all ACRED redeemed into the phantom token, debt untouched
  const account = makeAccount({
    balances: new AssetsMap([
      { token: UNDERLYING, balance: 88300811096n },
      { token: PHANTOM, balance: 22070460800n },
    ]),
    debt: 88300811096n,
    // + accruedInterest 5379 + accruedFees 2689
    totalDebt: 88300819164n,
    quotas: new AssetsMap([{ token: PHANTOM, balance: 20861060000n }]),
  });
  // Pre-transaction state: the closure preview reports no changes, so only
  // the debt matters here
  const before = makeAccount({
    debt: 88300811096n,
    totalDebt: 88300819164n,
  });

  it("previews an account closure with the leftover after full repayment", () => {
    const preview = buildDelayedPreview(
      account,
      before,
      detected({ type: "CLOSE_ACCOUNT", to: OWNER }),
      convert,
    );
    expect(preview).toEqual({
      operation: "CloseCreditAccount",
      permanent: false,
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      // total value (underlying + claimed USDC at 1:1) minus total debt
      receivedAmount: 88300811096n + 22070460800n - 88300819164n,
      error: undefined,
    });
  });

  it("floors receivedAmount at zero when the debt exceeds the total value", () => {
    const indebted = account.clone();
    indebted.totalDebt = 999_999_999_999_999n;
    const preview = buildDelayedPreview(
      indebted,
      before,
      detected({ type: "CLOSE_ACCOUNT", to: OWNER }),
      convert,
    );
    expect(preview.operation).toBe("CloseCreditAccount");
    if (preview.operation === "CloseCreditAccount") {
      expect(preview.receivedAmount).toBe(0n);
    }
  });

  it("does not mutate the input account state", () => {
    buildDelayedPreview(
      account,
      before,
      detected({ type: "CLOSE_ACCOUNT", to: OWNER }),
      convert,
    );
    expect(account.balances.get(PHANTOM)).toBe(22070460800n);
    expect(account.quotas.get(PHANTOM)).toBe(20861060000n);
  });
});

describe("buildDelayedPreview DECREASE_LEVERAGE", () => {
  it("claims and repays the debt with the claimed amount", () => {
    // Post-instant state: everything was redeemed into the phantom token,
    // the pre-transaction state (the diff base) held nothing
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 1000n }]),
      debt: 500n,
      totalDebt: 600n,
      quotas: new AssetsMap([{ token: PHANTOM, balance: 900n }]),
    });
    const before = makeAccount({ debt: 500n, totalDebt: 600n });
    const preview = buildDelayedPreview(
      account,
      before,
      detected({ type: "DECREASE_LEVERAGE" }),
      convert,
    );
    expect(preview).toEqual({
      operation: "AdjustCreditAccount",
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      collateralAdded: [],
      collateralWithdrawn: [],
      // 1000 claimed - 600 repaid
      totalValue: 400n,
      debt: 0n,
      debtChange: -500n,
      quotas: [],
      // relative to the pre-transaction state: the transient phantom token
      // (minted by the instant part, burned by the claim) nets out to nothing
      quotasChange: [],
      assets: [{ token: UNDERLYING, balance: 400n }],
      assetsChange: [{ token: UNDERLYING, balance: 400n }],
      error: undefined,
    });
  });

  it("caps the repayment at the total debt", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 100n }]),
      debt: 1000n,
      totalDebt: 1500n,
    });
    const before = makeAccount({ debt: 1000n, totalDebt: 1500n });
    const preview = buildDelayedPreview(
      account,
      before,
      detected({ type: "DECREASE_LEVERAGE" }),
      convert,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      // 100 repays accrued interest/fees first, principal is unchanged
      expect(preview.debt).toBe(1000n);
      expect(preview.debtChange).toBe(0n);
      expect(preview.assets).toEqual([]);
    }
  });
});

describe("buildDelayedPreview WITHDRAW_COLLATERAL", () => {
  it("withdraws the recorded amount and repays with the rest of the claim", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 1000n }]),
      debt: 500n,
      totalDebt: 600n,
    });
    const before = makeAccount({ debt: 500n, totalDebt: 600n });
    const preview = buildDelayedPreview(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: USDC,
        withdrawAmount: 300n,
      }),
      convert,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toEqual([
        { token: USDC, balance: 300n },
      ]);
      // 700 remaining claim repays 600 total debt, 100 underlying is left
      expect(preview.debt).toBe(0n);
      expect(preview.debtChange).toBe(-500n);
      expect(preview.assets).toEqual([{ token: UNDERLYING, balance: 100n }]);
    }
  });

  it("caps the withdrawal at the running balance", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 100n }]),
    });
    const preview = buildDelayedPreview(
      account,
      makeAccount(),
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: USDC,
        withdrawAmount: 500n,
      }),
      convert,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      // only the claimed 100 is there to withdraw, nothing left to repay
      expect(preview.collateralWithdrawn).toEqual([
        { token: USDC, balance: 100n },
      ]);
      expect(preview.assets).toEqual([]);
    }
  });

  it("withdraws a non-claim token from the existing balance and repays with the full claim", () => {
    const account = makeAccount({
      balances: new AssetsMap([
        { token: PHANTOM, balance: 1000n },
        { token: WETH, balance: 50n },
      ]),
      debt: 500n,
      totalDebt: 600n,
    });
    // WETH was already on the account before the transaction
    const before = makeAccount({
      balances: new AssetsMap([{ token: WETH, balance: 50n }]),
      debt: 500n,
      totalDebt: 600n,
    });
    const preview = buildDelayedPreview(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: WETH,
        withdrawAmount: 30n,
      }),
      convert,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toEqual([
        { token: WETH, balance: 30n },
      ]);
      // full 1000 claim repays 600, 400 underlying + 20 WETH remain
      expect(preview.debt).toBe(0n);
      expect(preview.assets).toEqual(
        expect.arrayContaining([
          { token: UNDERLYING, balance: 400n },
          { token: WETH, balance: 20n },
        ]),
      );
      expect(preview.totalValue).toBe(400n + 20n * 2000n);
    }
  });
});

describe("buildDelayedPreview claim-only", () => {
  const account = makeAccount({
    balances: new AssetsMap([
      { token: PHANTOM, balance: 1000n },
      { token: UNDERLYING, balance: 200n },
    ]),
    debt: 500n,
    totalDebt: 600n,
    quotas: new AssetsMap([{ token: PHANTOM, balance: 900n }]),
  });
  // Pre-transaction state: the underlying was already there, the phantom
  // token was minted by the instant part
  const before = makeAccount({
    balances: new AssetsMap([{ token: UNDERLYING, balance: 200n }]),
    debt: 500n,
    totalDebt: 600n,
  });

  const claimOnlyExpectation = {
    operation: "AdjustCreditAccount",
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    collateralAdded: [],
    collateralWithdrawn: [],
    totalValue: 1200n,
    debt: 500n,
    debtChange: 0n,
    quotas: [],
    // the phantom token round trip nets out to nothing vs the pre-state
    quotasChange: [],
    assets: expect.arrayContaining([
      { token: UNDERLYING, balance: 200n },
      { token: USDC, balance: 1000n },
    ]),
    assetsChange: [{ token: USDC, balance: 1000n }],
    error: undefined,
  };

  it("applies only the claim step for resume intents with an unrecoverable swap target", () => {
    const preview = buildDelayedPreview(
      account,
      before,
      detected({ type: "DEPOSIT" }),
      convert,
    );
    expect(preview).toEqual(claimOnlyExpectation);
  });

  it("applies only the claim step when the intent is undefined (Mellow, legacy txs)", () => {
    const preview = buildDelayedPreview(
      account,
      before,
      detected(undefined),
      convert,
    );
    expect(preview).toEqual(claimOnlyExpectation);
  });
});

describe("buildDelayedPreview unpriceable tokens", () => {
  it("sets ERROR_UNPRICEABLE_TOKEN and counts only priceable tokens", () => {
    const UNPRICEABLE = getAddress(
      "0x1111111111111111111111111111111111111111",
    );
    const account = makeAccount({
      balances: new AssetsMap([
        { token: PHANTOM, balance: 1000n },
        // must exceed PREVIEW_DUST to be priced at all
        { token: UNPRICEABLE, balance: 50n },
      ]),
    });
    const preview = buildDelayedPreview(
      account,
      makeAccount(),
      detected(undefined),
      convert,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.totalValue).toBe(1000n);
      expect(preview.error).toEqual({
        code: ERROR_UNPRICEABLE_TOKEN,
        message: expect.stringContaining(UNPRICEABLE),
      });
    }
  });
});
