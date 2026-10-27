import { describe, expect, it } from "vitest";
import { CreditAccountOperationsService } from "../index.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  type MarketSdkExtras,
  POS,
  RWA_ASSET,
  UND,
  WALLET,
} from "../testing/market.js";

const DEBT = 20_000_000_000n;
const AMOUNT = 10_000_000_000n;
const TOKENS = [
  caToken(POS, 100_000_000_000n, 92_000_000_000n),
  caToken(UND, 123n),
  caToken(RWA_ASSET, 10_000_000n),
];

function run(amount = AMOUNT, extras?: MarketSdkExtras, debt = DEBT) {
  const sdk = buildMarketSdk(extras);
  return new CreditAccountOperationsService(sdk).startIntent({
    sdk,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: debt,
      tokens: TOKENS,
    }),
    intent: { type: "BORROW_AND_WITHDRAW", amount, to: WALLET },
    quotaReserve: undefined,
    slippage: undefined,
  });
}

describe("borrow and withdraw", () => {
  it.each([DEBT, 0n])(
    "preserves existing balances and pays only the new loan with debt %s",
    async debt => {
      const result = await run(AMOUNT, undefined, debt);
      if (!result.ok) throw new Error(result.error.code);
      expect(result.state.totalDebt.value).toBe(debt + AMOUNT);
      for (const token of TOKENS) {
        expect(
          result.state.assets.find(
            a => a.token.address.toLowerCase() === token.token.toLowerCase(),
          )?.value,
        ).toBe(token.balance);
      }
      expect(
        result.operations.find(o => o.type === "withdrawCollateral"),
      ).toMatchObject({ token: UND, amount: AMOUNT, to: WALLET });
      expect(result.operations.some(o => o.type === "swap")).toBe(false);
    },
  );

  it("unwraps the new RWA debt and preserves the existing wrapper and payout balances", async () => {
    const result = await run(AMOUNT, { rwaAssets: { [UND]: RWA_ASSET } });
    if (!result.ok) throw new Error(result.error.code);
    expect(result.operations.slice(0, 3).map(o => o.type)).toEqual([
      "increaseDebt",
      "unwrapRwaCollateral",
      "withdrawCollateral",
    ]);
    expect(result.operations[2]).toMatchObject({
      token: RWA_ASSET,
      amount: AMOUNT,
      to: WALLET,
    });
    for (const token of TOKENS) {
      expect(
        result.state.assets.find(
          a => a.token.address.toLowerCase() === token.token.toLowerCase(),
        )?.value,
      ).toBe(token.balance);
    }
  });

  it("rescales payout decimals into debt units", async () => {
    const payout = 100_000_000n;
    const result = await run(payout, {
      rwaAssets: { [UND]: RWA_ASSET },
      extraDecimals: { [RWA_ASSET]: 6 },
    });
    if (!result.ok) throw new Error(result.error.code);
    expect(result.state.totalDebt.value).toBe(DEBT + AMOUNT);
    expect(result.operations[2]).toMatchObject({ amount: payout });
  });

  it("refuses an unrepresentable RWA payout without spending existing payout tokens", async () => {
    const result = await run(AMOUNT * 100n + 1n, {
      rwaAssets: { [UND]: RWA_ASSET },
      extraDecimals: { [RWA_ASSET]: 10 },
    });
    expect(result).toMatchObject({
      ok: false,
      error: { code: "insufficientBalance" },
    });
  });

  it.each([0n, -1n, 100_000_000_000_000n])(
    "refuses invalid or excessive payout %s",
    async amount => {
      expect((await run(amount)).ok).toBe(false);
    },
  );

  it("refuses a loan the existing collateral cannot back", async () => {
    const result = await run(90_000_000_000n);
    expect(result).toMatchObject({
      ok: false,
      error: { code: "insufficientCollateral" },
    });
  });
});
