import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { AccountSnapshot } from "../../positions/types.js";
import { maxWithdrawCollateral } from "./maxWithdrawCollateral.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_MANAGER,
  caToken,
  type MarketSdkExtras,
  POS,
  UND,
} from "./testing/market.js";
import type { CreditAccountSlice } from "./types.js";

/** The fixture prices `POS` and `UND` at $2, both with 8 decimals. */
const toBN = (whole: string, decimals: number): bigint =>
  BigInt(whole) * 10n ** BigInt(decimals);

const TARGET_HF = 10_102n;

function account(
  tokens: CreditAccountSlice["tokens"],
  accountDebt: bigint,
): CreditAccountSlice {
  return buildFixtureCreditAccount({ accountDebt, tokens });
}

function ceiling(
  creditAccount: CreditAccountSlice,
  token: Address,
  extras?: MarketSdkExtras,
): bigint {
  return maxWithdrawCollateral({
    creditAccount,
    sdk: buildMarketSdk({ creditAccounts: [creditAccount], ...extras }),
    token,
    targetHF: TARGET_HF,
  });
}

/**
 * The health factor the collateral check reports once `amount` of `token` has
 * left — the invariant every answer below is judged on, read off the same
 * service the check itself calls.
 */
function hfAfter(
  creditAccount: CreditAccountSlice,
  token: Address,
  amount: bigint,
  extras?: MarketSdkExtras,
): number {
  const sdk = buildMarketSdk({ creditAccounts: [creditAccount], ...extras });
  const tokens = creditAccount.tokens.map(t =>
    t.token === token ? { ...t, balance: t.balance - amount } : t,
  );
  const snapshot: AccountSnapshot = {
    creditManager: CREDIT_MANAGER,
    assets: tokens.map(t => ({ token: t.token, balance: t.balance })),
    // the simulation ledger quotes only what a quota was bought for
    quotas: tokens
      .filter(t => t.quota > 0n)
      .map(t => ({ token: t.token, balance: t.quota })),
    totalDebt: creditAccount.accountDebt,
    totalValue: 0n,
  };
  return sdk.positions.healthFactor(snapshot, { safePrices: true });
}

describe("maxWithdrawCollateral", () => {
  it("frees the whole balance when the account owes nothing", () => {
    const ca = account([caToken(POS, toBN("100", 8), toBN("100", 8))], 0n);
    expect(ceiling(ca, POS)).toBe(toBN("100", 8));
  });

  it("leaves behind what the debt leans on", () => {
    const ca = account(
      [caToken(POS, toBN("100", 8), toBN("1000", 8))],
      toBN("50", 8),
    );

    const amount = ceiling(ca, POS);
    expect(amount).toBeGreaterThan(0n);
    expect(amount).toBeLessThan(toBN("100", 8));
    expect(hfAfter(ca, POS, amount)).toBeGreaterThanOrEqual(Number(TARGET_HF));
  });

  it("offers one wei less than the account cannot support", () => {
    const ca = account(
      [caToken(POS, toBN("100", 8), toBN("1000", 8))],
      toBN("50", 8),
    );

    const amount = ceiling(ca, POS);
    // the ceiling is a ceiling: a wei more and the check stops clearing
    expect(hfAfter(ca, POS, amount + 1n)).toBeLessThan(Number(TARGET_HF));
  });

  it("counts the underlying, which no quota backs, at its threshold", () => {
    const ca = account(
      [
        caToken(POS, toBN("100", 8), toBN("1000", 8)),
        caToken(UND, toBN("100", 8), 0n),
      ],
      toBN("50", 8),
    );

    // the underlying covers the debt on its own, so the target is free to go
    expect(ceiling(ca, POS)).toBe(toBN("100", 8));
  });

  it("reads a quota as a bar to clear, not as a share of the balance", () => {
    // A quota does not shrink with the balance, so it either covers what the
    // debt needs or it does not: past that bar a larger one buys nothing.
    const barelyEnough = account(
      [caToken(POS, toBN("100", 8), toBN("60", 8))],
      toBN("50", 8),
    );
    const generous = account(
      [caToken(POS, toBN("100", 8), toBN("1000", 8))],
      toBN("50", 8),
    );

    expect(ceiling(barelyEnough, POS)).toBe(ceiling(generous, POS));
    expect(
      hfAfter(barelyEnough, POS, ceiling(barelyEnough, POS)),
    ).toBeGreaterThanOrEqual(Number(TARGET_HF));
  });

  it("offers nothing when the target's quota cannot cover the debt", () => {
    // $200 of collateral at 92%, but a $20 quota caps what it backs
    const ca = account(
      [caToken(POS, toBN("100", 8), toBN("10", 8))],
      toBN("50", 8),
    );

    expect(hfAfter(ca, POS, 0n)).toBeLessThan(Number(TARGET_HF));
    expect(ceiling(ca, POS)).toBe(0n);
  });

  it("values collateral at the lower of its two feeds", () => {
    const ca = account(
      [caToken(POS, toBN("100", 8), toBN("1000", 8))],
      toBN("50", 8),
    );

    const atMain = ceiling(ca, POS);
    const atSafe = ceiling(ca, POS, {
      reservePrices: { [POS]: toBN("1", 8), [UND]: toBN("2", 8) },
    });

    // the check runs at the lower feed, so the ceiling has to as well
    expect(atSafe).toBeLessThan(atMain);
  });

  it("refuses to answer when the debt has no price", () => {
    const NO_FEED = "0x9999999999999999999999999999999999999999" as Address;
    const ca = account([caToken(NO_FEED, toBN("100", 18), 0n)], toBN("50", 8));

    // an unpriceable balance is worth nothing to the check, and a ceiling that
    // read the debt as free would hand the whole balance over
    expect(ceiling(ca, NO_FEED)).toBe(0n);
  });

  it("answers zero for a token the account does not hold", () => {
    const ca = account([caToken(POS, toBN("100", 8), 0n)], toBN("50", 8));
    expect(ceiling(ca, UND)).toBe(0n);
  });

  it("matches the target whatever case the caller spells it in", () => {
    const ca = account(
      [caToken(POS, toBN("100", 8), toBN("1000", 8))],
      toBN("50", 8),
    );

    expect(ceiling(ca, POS.toUpperCase().replace("0X", "0x") as Address)).toBe(
      ceiling(ca, POS),
    );
  });
});
