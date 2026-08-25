import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { CreditAccountData, TokenInfo } from "../base/index.js";
import { DUST_THRESHOLD } from "../constants/math.js";
import { accountSnapshotFromCreditAccountData } from "./types.js";

const CREDIT_MANAGER = getAddress("0x5555555555555555555555555555555555555555");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const ACRED = getAddress("0x1111111111111111111111111111111111111111");

const UNDERLYING_MASK = 1n;
const ACRED_MASK = 2n;

interface TokenInfoPartial extends Partial<TokenInfo> {
  token: TokenInfo["token"];
}

interface CreditAccountPartial extends Partial<CreditAccountData> {
  tokens: CreditAccountData["tokens"];
  enabledTokensMask: CreditAccountData["enabledTokensMask"];
}

function token(partial: TokenInfoPartial): TokenInfo {
  return {
    mask: 0n,
    balance: 0n,
    quota: 0n,
    success: true,
    ...partial,
  };
}

function account(partial: CreditAccountPartial): CreditAccountData {
  return {
    creditAccount: getAddress("0x4444444444444444444444444444444444444444"),
    creditManager: CREDIT_MANAGER,
    creditFacade: getAddress("0x6666666666666666666666666666666666666666"),
    underlying: USDC,
    owner: getAddress("0x7777777777777777777777777777777777777777"),
    expirationDate: 0,
    debt: 0n,
    accruedInterest: 0n,
    accruedFees: 0n,
    totalDebtUSD: 0n,
    totalValueUSD: 0n,
    twvUSD: 0n,
    totalValue: 0n,
    healthFactor: 0n,
    success: true,
    ...partial,
  };
}

describe("accountSnapshotFromCreditAccountData", () => {
  it("includes above-dust tokens even when they are not in enabledTokensMask", () => {
    const snapshot = accountSnapshotFromCreditAccountData(
      account({
        // full repayment: only underlying remains enabled
        enabledTokensMask: UNDERLYING_MASK,
        tokens: [
          token({
            token: USDC,
            mask: UNDERLYING_MASK,
            balance: 11n,
            quota: 0n,
          }),
          token({
            token: ACRED,
            mask: ACRED_MASK,
            balance: 1_000n,
            quota: 0n,
          }),
        ],
      }),
    );

    expect(snapshot.creditManager).toBe(CREDIT_MANAGER);
    expect(snapshot.assets).toEqual([
      { token: USDC, balance: 11n },
      { token: ACRED, balance: 1_000n },
    ]);
    expect(snapshot.quotas).toEqual([
      { token: USDC, balance: 0n },
      { token: ACRED, balance: 0n },
    ]);
  });

  it("excludes dust balances", () => {
    const snapshot = accountSnapshotFromCreditAccountData(
      account({
        enabledTokensMask: UNDERLYING_MASK | ACRED_MASK,
        tokens: [
          token({
            token: USDC,
            mask: UNDERLYING_MASK,
            balance: DUST_THRESHOLD,
            quota: 0n,
          }),
          token({
            token: ACRED,
            mask: ACRED_MASK,
            balance: DUST_THRESHOLD + 1n,
            quota: 50n,
          }),
        ],
      }),
    );

    expect(snapshot.assets).toEqual([
      { token: ACRED, balance: DUST_THRESHOLD + 1n },
    ]);
    expect(snapshot.quotas).toEqual([{ token: ACRED, balance: 50n }]);
  });

  it("sums debt, accrued interest and fees into totalDebt", () => {
    const snapshot = accountSnapshotFromCreditAccountData(
      account({
        enabledTokensMask: UNDERLYING_MASK,
        debt: 100n,
        accruedInterest: 30n,
        accruedFees: 20n,
        totalValue: 500n,
        tokens: [],
      }),
    );

    expect(snapshot.totalDebt).toBe(150n);
    expect(snapshot.totalValue).toBe(500n);
  });
});
