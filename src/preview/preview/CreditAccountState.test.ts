import { getAddress, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import {
  AssetsMap,
  type CreditAccountData,
  MIN_INT96,
} from "../../sdk/index.js";
import { CreditAccountState } from "./CreditAccountState.js";

const CREDIT_ACCOUNT = getAddress("0x4444444444444444444444444444444444444444");
const CREDIT_MANAGER = getAddress("0x5555555555555555555555555555555555555555");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const WSTETH = getAddress("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0");

function makeState(
  props: Partial<
    Pick<CreditAccountState, "balances" | "quotas" | "debt" | "totalDebt">
  > = {},
): CreditAccountState {
  return new CreditAccountState({
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    underlying: USDC,
    ...props,
  });
}

describe("CreditAccountState.beforeOpen", () => {
  it("creates a zeroed state with the zero credit account address", () => {
    const state = CreditAccountState.beforeOpen(CREDIT_MANAGER, USDC);
    expect(state.creditAccount).toBe(zeroAddress);
    expect(state.creditManager).toBe(CREDIT_MANAGER);
    expect(state.underlying).toBe(USDC);
    expect(state.balances.size).toBe(0);
    expect(state.quotas.size).toBe(0);
    expect(state.debt).toBe(0n);
    expect(state.totalDebt).toBe(0n);
  });
});

describe("CreditAccountState.fromCreditAccountData", () => {
  it("takes identity and debt from the account data and filters out dust", () => {
    const ca = {
      creditAccount: CREDIT_ACCOUNT,
      creditManager: CREDIT_MANAGER,
      underlying: USDC,
      debt: 1000n,
      accruedInterest: 30n,
      accruedFees: 20n,
      tokens: [
        { token: USDC, balance: 1200n, quota: 0n },
        // 1-wei dust in both balance and quota is dropped
        { token: WETH, balance: 1n, quota: 1n },
        { token: WSTETH, balance: 0n, quota: 500n },
      ],
    } as unknown as CreditAccountData;

    const state = CreditAccountState.fromCreditAccountData(ca);
    expect(state.creditAccount).toBe(CREDIT_ACCOUNT);
    expect(state.creditManager).toBe(CREDIT_MANAGER);
    expect(state.underlying).toBe(USDC);
    expect(state.balances.toAssets()).toEqual([
      { token: USDC, balance: 1200n },
    ]);
    expect(state.quotas.toAssets()).toEqual([{ token: WSTETH, balance: 500n }]);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1050n);
  });
});

describe("CreditAccountState.clone", () => {
  it("creates an independent copy", () => {
    const state = makeState({
      balances: new AssetsMap([{ token: USDC, balance: 100n }]),
      quotas: new AssetsMap([{ token: WETH, balance: 50n }]),
      debt: 10n,
      totalDebt: 12n,
    });
    const copy = state.clone();
    copy.balances.inc(USDC, 1n);
    copy.quotas.inc(WETH, 1n);
    copy.debt = 0n;
    expect(state.balances.get(USDC)).toBe(100n);
    expect(state.quotas.get(WETH)).toBe(50n);
    expect(state.debt).toBe(10n);
  });
});

describe("CreditAccountState.increaseDebt", () => {
  it("increases debt, total debt and the underlying balance", () => {
    const state = makeState();
    state.increaseDebt(1000n);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1000n);
    expect(state.balances.get(USDC)).toBe(1000n);
  });
});

describe("CreditAccountState.repay", () => {
  it("repays interest and fees before principal", () => {
    const state = makeState({
      balances: new AssetsMap([{ token: USDC, balance: 1200n }]),
      debt: 1000n,
      totalDebt: 1100n,
    });
    // amount <= accrued: principal unchanged
    expect(state.repay(80n)).toBe(80n);
    expect(state.debt).toBe(1000n);
    expect(state.totalDebt).toBe(1020n);
    expect(state.balances.get(USDC)).toBe(1120n);
    // amount > accrued: remainder reduces principal
    expect(state.repay(220n)).toBe(220n);
    expect(state.debt).toBe(800n);
    expect(state.totalDebt).toBe(800n);
    expect(state.balances.get(USDC)).toBe(900n);
  });

  it("clamps the repaid amount at the total debt", () => {
    const state = makeState({
      balances: new AssetsMap([{ token: USDC, balance: 1200n }]),
      debt: 1000n,
      totalDebt: 1100n,
    });
    expect(state.repay(999999n)).toBe(1100n);
    expect(state.debt).toBe(0n);
    expect(state.totalDebt).toBe(0n);
    // underlying drops by totalDebt, not by the requested amount
    expect(state.balances.get(USDC)).toBe(100n);
  });
});

describe("CreditAccountState.updateQuota", () => {
  it("creates a quota on an unquoted token", () => {
    const state = makeState();
    state.updateQuota(WETH, 100n);
    expect(state.quotas.toAssets()).toEqual([{ token: WETH, balance: 100n }]);
  });

  it("adds a positive change to an existing quota", () => {
    const state = makeState({
      quotas: new AssetsMap([{ token: WETH, balance: 100n }]),
    });
    state.updateQuota(WETH, 50n);
    expect(state.quotas.get(WETH)).toBe(150n);
  });

  it("clamps at zero when the negative change exceeds the current quota", () => {
    const state = makeState({
      quotas: new AssetsMap([{ token: WETH, balance: 100n }]),
    });
    state.updateQuota(WETH, -1000n);
    expect(state.quotas.get(WETH)).toBe(0n);
  });

  it("MIN_INT96 disables the quota regardless of its current value", () => {
    const state = makeState({
      quotas: new AssetsMap([
        { token: WETH, balance: 12345n },
        { token: USDC, balance: 500n },
      ]),
    });
    state.updateQuota(WETH, MIN_INT96);
    expect(state.quotas.get(WETH)).toBe(0n);
    expect(state.quotas.get(USDC)).toBe(500n);
  });

  it("folded quota diff equals post-clamp final minus initial", () => {
    const before = makeState({
      quotas: new AssetsMap([
        { token: WETH, balance: 100n },
        { token: USDC, balance: 200n },
      ]),
    });
    const after = before.clone();
    after.updateQuota(WETH, -300n);
    after.updateQuota(WSTETH, 40n);
    expect(after.quotas.toAssets(0n)).toEqual(
      expect.arrayContaining([
        { token: USDC, balance: 200n },
        { token: WSTETH, balance: 40n },
      ]),
    );
    expect(after.quotas.toAssets(0n)).toHaveLength(2);
    const change = after.quotas.difference(before.quotas).toAssets();
    expect(change).toEqual(
      expect.arrayContaining([
        { token: WETH, balance: -100n },
        { token: WSTETH, balance: 40n },
      ]),
    );
    expect(change).toHaveLength(2);
  });
});
