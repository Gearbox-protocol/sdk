import type { Address } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { Curator } from "../../model/index.js";
import { ERROR_UNPRICEABLE_TOKEN } from "../../model/index.js";
import {
  AssetsMap,
  type ConvertFn,
  type OnchainSDK,
} from "../../onchain/index.js";
import { PositionsService } from "../../onchain/positions/PositionsService.js";
import { buildDelayedStrategyVerify } from "./buildDelayedStrategyVerify.js";
import { CreditAccountState } from "./CreditAccountState.js";
import type { DetectedDelayedOperation } from "./detectDelayedOperation.js";

const CREDIT_ACCOUNT = getAddress("0x82900e2Ab20B6F60C159F1A141A6f2d3D810C4fA");
const CREDIT_MANAGER = getAddress("0x025512D771f778fad99aB30b7A7363E7C8DE078D");
const CURATOR: Curator = {
  address: getAddress("0x00000000000000000000000000000000000C0F16"),
  name: undefined,
  url: null,
};
// dcUSDC, the credit manager underlying (RWA vault share over USDC)
const UNDERLYING = getAddress("0x50A9C808cd114E8fEA72f03aE2B1A8825677D56D");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
// Securitize redemption phantom token
const PHANTOM = getAddress("0xF126EaCAcf6B14C8985fC195768A55E886Af4208");
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const OWNER = getAddress("0xC32FEB4DBd127a1993478Ad6E5250710f838b908");
const UNPRICEABLE = getAddress("0x1111111111111111111111111111111111111111");

/**
 * An underlying-denominated amount, as the projection reports one: USDC, the
 * asset the dcUSDC share wraps one-for-one, not the share itself.
 */
const und = (value: unknown) => ({
  token: expect.objectContaining({ address: USDC }),
  value,
});

/**
 * Market stub for the position metrics: USDC, the underlying and the phantom
 * token at $1, WETH at $2000, no quota rates, no borrow rate. The tests only
 * care that the metrics are present, not about their values.
 */
const metricsSdk = (() => {
  const decimals: Record<Address, number> = {
    [UNDERLYING]: 6,
    [USDC]: 6,
    [PHANTOM]: 6,
    [WETH]: 18,
    [UNPRICEABLE]: 18,
  };
  const prices: Record<Address, bigint> = {
    [UNDERLYING]: 10n ** 8n,
    [USDC]: 10n ** 8n,
    [PHANTOM]: 10n ** 8n,
    [WETH]: 2000n * 10n ** 8n,
  };
  const lts: Record<Address, number> = {
    [UNDERLYING]: 9800,
    [USDC]: 9800,
    [PHANTOM]: 9200,
    [WETH]: 8500,
  };
  const tokenOf = (token: Address) => {
    const addr = getAddress(token);
    const d = decimals[addr];
    if (d === undefined) {
      return undefined;
    }
    return {
      chainId: 1,
      address: addr,
      symbol: "TOKEN",
      name: "TOKEN",
      decimals: d,
    };
  };
  const mustGetToken = (token: Address) => {
    const meta = tokenOf(token);
    if (!meta) {
      throw new Error(`token ${token} not found`);
    }
    return meta;
  };
  const safeUsdValue = (token: Address, amount: bigint) => {
    const addr = getAddress(token);
    const price = prices[addr];
    if (price === undefined) {
      return null;
    }
    const d = decimals[addr] ?? 18;
    return Number((amount * price) / 10n ** BigInt(d)) / 1e8;
  };
  const toAmount = (token: Address, value: bigint) => ({
    value,
    valueUsd: safeUsdValue(token, value),
  });
  const sdk = {
    chainId: 1,
    chain: { nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 } },
    tokensMeta: {
      get: (token: Address) => {
        const d = decimals[getAddress(token)];
        return d === undefined ? undefined : { decimals: d };
      },
      getToken: tokenOf,
      mustGetToken,
    },
    marketRegister: {
      findByCreditManager: () => ({
        underlying: UNDERLYING,
        // {@inheritDoc MarketSuite.toUnderlyingAmount} — an underlying-denominated
        // figure names USDC, the asset the dcUSDC share wraps one-for-one
        toUnderlyingAmount: (value: bigint) => ({
          token: mustGetToken(USDC),
          value,
          valueUsd: null,
        }),
        pool: {
          underlying: UNDERLYING,
          pool: { baseInterestRate: 0n },
          pqk: { quotaRate: () => 0, hasActiveQuota: () => false },
        },
        priceOracle: {
          convertToUSD: (token: Address, amount: bigint) => {
            const addr = getAddress(token);
            const price = prices[addr];
            if (price === undefined) {
              throw new Error(`no answer found for token ${token}`);
            }
            const d = decimals[addr] ?? 18;
            return (amount * price) / 10n ** BigInt(d);
          },
          // what `PositionsService` collects the metrics from; a token with no
          // price throws, as the real oracle does, and is left out of the sum
          mainPrice: (token: Address) => {
            const price = prices[getAddress(token)];
            if (price === undefined) {
              throw new Error(`no answer found for token ${token}`);
            }
            return price;
          },
          // the stub has one feed per token, so safe prices are the main ones
          reservePrice: (token: Address) => {
            const price = prices[getAddress(token)];
            if (price === undefined) {
              throw new Error(`no answer found for token ${token}`);
            }
            return price;
          },
          safeConvertToUSD: (token: Address, amount: bigint) => {
            const addr = getAddress(token);
            const price = prices[addr];
            if (price === undefined) {
              return null;
            }
            const d = decimals[addr] ?? 18;
            return (amount * price) / 10n ** BigInt(d);
          },
          safeUsdValue,
          toAmount,
          toTokenAmount: (token: Address, value: bigint) => ({
            token: mustGetToken(token),
            ...toAmount(token, value),
          }),
        },
      }),
      findCreditManager: () => ({
        name: "TestCreditManager",
        market: { curator: CURATOR },
        liquidationFees: () => ({
          feeLiquidation: 150,
          liquidationDiscount: 9700,
        }),
        creditManager: {
          address: CREDIT_MANAGER,
          feeInterest: 0,
          liquidationThresholds: {
            get: (token: Address) => lts[getAddress(token)],
          },
        },
      }),
    },
  } as unknown as OnchainSDK;

  // The real service over the stub, so the metrics under test are the ones
  // shipped rather than a second implementation of the same formulas.
  Object.assign(sdk, { positions: new PositionsService(sdk) });
  return sdk;
})();

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

function amt(token: Address, value: unknown) {
  return expect.objectContaining({
    token: expect.objectContaining({ address: token }),
    value,
  });
}

describe("buildDelayedStrategyVerify CLOSE_ACCOUNT", () => {
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
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({ type: "CLOSE_ACCOUNT", to: OWNER }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview).toMatchObject({
      operation: "CloseCreditAccount",
      permanent: false,
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      name: "TestCreditManager",
      // total value (underlying + claimed USDC at 1:1) minus total debt,
      // denominated in the unwrapped underlying (1:1 with the vault share)
      receivedAmount: amt(USDC, 88300811096n + 22070460800n - 88300819164n),
      error: undefined,
    });
  });

  it("floors receivedAmount at zero when the debt exceeds the total value", () => {
    const indebted = account.clone();
    indebted.totalDebt = 999_999_999_999_999n;
    const preview = buildDelayedStrategyVerify(
      indebted,
      before,
      detected({ type: "CLOSE_ACCOUNT", to: OWNER }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("CloseCreditAccount");
    if (preview.operation === "CloseCreditAccount") {
      expect(preview.receivedAmount).toMatchObject(amt(USDC, 0n));
    }
  });

  it("does not mutate the input account state", () => {
    buildDelayedStrategyVerify(
      account,
      before,
      detected({ type: "CLOSE_ACCOUNT", to: OWNER }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(account.balances.get(PHANTOM)).toBe(22070460800n);
    expect(account.quotas.get(PHANTOM)).toBe(20861060000n);
  });
});

describe("buildDelayedStrategyVerify DECREASE_LEVERAGE", () => {
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
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({ type: "DECREASE_LEVERAGE" }),
      convert,
      USDC,
      metricsSdk,
    );
    // toMatchObject: the preview also carries position metrics
    // (estHealthFactor, estBorrowRate, estTimeToLiquidation,
    // estLiquidationPrice), which this test does not pin down
    expect(preview).toMatchObject({
      operation: "AdjustCreditAccount",
      creditManager: CREDIT_MANAGER,
      creditAccount: CREDIT_ACCOUNT,
      name: "TestCreditManager",
      estLeverage: expect.any(Number),
      collateralAdded: [],
      collateralWithdrawn: [],
      // 1000 claimed - 600 repaid
      estTotalValue: und(400n),
      totalDebt: und(0n),
      totalDebtChange: und(-600n),
      quotas: [],
      // relative to the pre-transaction state: the transient phantom token
      // (minted by the instant part, burned by the claim) nets out to nothing
      quotasChange: [],
      estAssets: [amt(UNDERLYING, 400n)],
      assetsChange: [amt(UNDERLYING, 400n)],
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
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({ type: "DECREASE_LEVERAGE" }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      // 100 goes to the accrued interest and fees, which the principal sits
      // behind: the loan shrinks by the payment, the principal by nothing
      expect(preview.totalDebt.value).toBe(1400n);
      expect(preview.totalDebtChange.value).toBe(-100n);
      expect(preview.estAssets).toEqual([]);
    }
  });
});

describe("buildDelayedStrategyVerify WITHDRAW_COLLATERAL", () => {
  it("withdraws the claim token and repays with the rest of the claim, capped by debtRepaid", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 1000n }]),
      debt: 500n,
      totalDebt: 600n,
    });
    const before = makeAccount({ debt: 500n, totalDebt: 600n });
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: USDC,
        withdrawAmount: 300n,
        sourceToken: WETH,
        debtRepaid: 600n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toMatchObject([amt(USDC, 300n)]);
      // 700 remaining claim repays 600 total debt, 100 underlying is left
      expect(preview.totalDebt.value).toBe(0n);
      expect(preview.totalDebtChange.value).toBe(-600n);
      expect(preview.estAssets).toMatchObject([amt(UNDERLYING, 100n)]);
    }
  });

  it("caps the repayment at debtRepaid and keeps the excess as underlying", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 1000n }]),
      debt: 500n,
      totalDebt: 600n,
    });
    const before = makeAccount({ debt: 500n, totalDebt: 600n });
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: USDC,
        withdrawAmount: 300n,
        sourceToken: WETH,
        // only 200 of the 700 remaining claim goes to debt
        debtRepaid: 200n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toMatchObject([amt(USDC, 300n)]);
      // 200 repays interest/fees (100) then principal (100)
      expect(preview.totalDebt.value).toBe(400n);
      expect(preview.totalDebtChange.value).toBe(-200n);
      // 700 swept into underlying, 200 spent on the repayment
      expect(preview.estAssets).toMatchObject([amt(UNDERLYING, 500n)]);
    }
  });

  it("repays nothing when debtRepaid is zero (debt was repaid on start)", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 1000n }]),
      debt: 500n,
      totalDebt: 600n,
    });
    const before = makeAccount({ debt: 500n, totalDebt: 600n });
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: USDC,
        withdrawAmount: 300n,
        sourceToken: WETH,
        debtRepaid: 0n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.totalDebt.value).toBe(600n);
      expect(preview.totalDebtChange.value).toBe(0n);
      expect(preview.estAssets).toMatchObject([amt(UNDERLYING, 700n)]);
    }
  });

  it("caps the withdrawal at the running balance", () => {
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 100n }]),
    });
    const preview = buildDelayedStrategyVerify(
      account,
      makeAccount(),
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: USDC,
        withdrawAmount: 500n,
        sourceToken: WETH,
        debtRepaid: 0n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      // only the claimed 100 is there to withdraw, nothing left to repay
      expect(preview.collateralWithdrawn).toMatchObject([amt(USDC, 100n)]);
      expect(preview.estAssets).toEqual([]);
    }
  });

  it("funds a non-claim withdrawal token from claim proceeds at the oracle rate", () => {
    // RLUSD-style scenario: the withdrawal token is not on the account,
    // the claim funds both the withdrawal and the debt repayment
    const account = makeAccount({
      balances: new AssetsMap([{ token: PHANTOM, balance: 100_000n }]),
      debt: 50_000n,
      totalDebt: 60_000n,
    });
    const before = makeAccount({ debt: 50_000n, totalDebt: 60_000n });
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        // WETH is worth 2000 USDC: withdrawing 10 WETH costs 20_000 USDC
        withdrawToken: WETH,
        withdrawAmount: 10n,
        sourceToken: WETH,
        debtRepaid: 60_000n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toMatchObject([amt(WETH, 10n)]);
      // 100_000 claimed - 20_000 spent on the withdrawal = 80_000 swept
      // into the underlying; 60_000 repays the total debt in full
      expect(preview.totalDebt.value).toBe(0n);
      expect(preview.totalDebtChange.value).toBe(-60_000n);
      expect(preview.estAssets).toMatchObject([amt(UNDERLYING, 20_000n)]);
    }
  });

  it("withdraws a non-claim token from the existing balance first and sweeps the full claim", () => {
    // ACRED-style scenario: the withdrawal token (the intent's sourceToken)
    // is already on the account, the claim only repays debt
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
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: WETH,
        withdrawAmount: 30n,
        sourceToken: WETH,
        debtRepaid: 600n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toMatchObject([amt(WETH, 30n)]);
      // full 1000 claim repays 600, 400 underlying + 20 WETH remain
      expect(preview.totalDebt.value).toBe(0n);
      expect(preview.estAssets).toEqual(
        expect.arrayContaining([amt(UNDERLYING, 400n), amt(WETH, 20n)]),
      );
      expect(preview.estTotalValue.value).toBe(400n + 20n * 2000n);
    }
  });

  it("splits the withdrawal between the existing balance and claim proceeds", () => {
    const account = makeAccount({
      balances: new AssetsMap([
        { token: PHANTOM, balance: 10_000n },
        // covers only 3 of the 5 WETH to withdraw
        { token: WETH, balance: 3n },
      ]),
      debt: 4000n,
      totalDebt: 5000n,
    });
    const before = makeAccount({
      balances: new AssetsMap([{ token: WETH, balance: 3n }]),
      debt: 4000n,
      totalDebt: 5000n,
    });
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({
        type: "WITHDRAW_COLLATERAL",
        to: OWNER,
        withdrawToken: WETH,
        withdrawAmount: 5n,
        sourceToken: WETH,
        debtRepaid: 5000n,
      }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.collateralWithdrawn).toMatchObject([amt(WETH, 5n)]);
      // 2 WETH shortfall costs 4000 of the 10_000 claim; the remaining
      // 6000 sweeps into the underlying and repays the 5000 total debt
      expect(preview.totalDebt.value).toBe(0n);
      expect(preview.estAssets).toMatchObject([amt(UNDERLYING, 1000n)]);
    }
  });
});

describe("buildDelayedStrategyVerify claim-only", () => {
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
    estTotalValue: und(1200n),
    totalDebt: und(600n),
    totalDebtChange: und(0n),
    quotas: [],
    // the phantom token round trip nets out to nothing vs the pre-state
    quotasChange: [],
    estAssets: expect.arrayContaining([
      amt(UNDERLYING, 200n),
      amt(USDC, 1000n),
    ]),
    assetsChange: [amt(USDC, 1000n)],
    error: undefined,
  };

  it("applies only the claim step for resume intents with an unrecoverable swap target", () => {
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected({ type: "DEPOSIT" }),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview).toMatchObject(claimOnlyExpectation);
  });

  it("applies only the claim step when the intent is undefined (Mellow, legacy txs)", () => {
    const preview = buildDelayedStrategyVerify(
      account,
      before,
      detected(undefined),
      convert,
      USDC,
      metricsSdk,
    );
    // toMatchObject: position metrics are present but not pinned down here
    expect(preview).toMatchObject(claimOnlyExpectation);
  });
});

describe("buildDelayedStrategyVerify unpriceable tokens", () => {
  it("sets ERROR_UNPRICEABLE_TOKEN and counts only priceable tokens", () => {
    const account = makeAccount({
      balances: new AssetsMap([
        { token: PHANTOM, balance: 1000n },
        // must exceed DUST_THRESHOLD to be priced at all
        { token: UNPRICEABLE, balance: 50n },
      ]),
    });
    const preview = buildDelayedStrategyVerify(
      account,
      makeAccount(),
      detected(undefined),
      convert,
      USDC,
      metricsSdk,
    );
    expect(preview.operation).toBe("AdjustCreditAccount");
    if (preview.operation === "AdjustCreditAccount") {
      expect(preview.estTotalValue.value).toBe(1000n);
      expect(preview.error).toEqual({
        code: ERROR_UNPRICEABLE_TOKEN,
        message: expect.stringContaining(UNPRICEABLE),
      });
    }
  });
});
