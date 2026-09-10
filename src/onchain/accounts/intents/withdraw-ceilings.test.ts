import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { CreditAccountOperationsService } from "./index.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  type MarketSdkExtras,
  POS,
  UND,
  WALLET,
} from "./testing/market.js";
import type { CreditAccountSlice } from "./types.js";
import { safeWithdrawCeiling } from "./withdraw-ceilings.js";

/** Fixture prices `POS` and `UND` at $2, both with 8 decimals. */
const U = (whole: string): bigint => BigInt(whole) * 10n ** 8n;
const MAIN = 200000000n; // $2.00 at PRICE_DECIMALS
const LT = 9200n;
const quotaOf = (balance: bigint) => (balance * LT) / 10000n;

const FACADE_BAR = 10000n;

/**
 * The account both ceilings below are measured on: a marked-down `POS` holding
 * beside the underlying, which safe pricing exempts. Withdrawing spends the
 * underlying, so the safe-price factor really does fall as the amount grows —
 * the case a single-collateral account cannot show.
 */
function mixedAccount(): CreditAccountSlice {
  return buildFixtureCreditAccount({
    totalDebt: U("2000"),
    tokens: [
      caToken(POS, U("1000"), quotaOf(U("1000"))),
      caToken(UND, U("3000")),
    ],
  });
}

function sdkFor(creditAccount: CreditAccountSlice, extras?: MarketSdkExtras) {
  return buildMarketSdk({
    creditAccounts: [creditAccount],
    minDebt: U("100"),
    ...extras,
  });
}

/** Reserve feed map with `POS` marked down and the underlying left alone. */
const reserves = (pos: bigint): Record<Address, bigint> => ({
  [POS]: pos,
  [UND]: MAIN,
});

function ceiling(
  creditAccount: CreditAccountSlice,
  extras?: MarketSdkExtras,
  sourceToken: Address = UND,
): bigint {
  return safeWithdrawCeiling({
    creditAccount,
    sdk: sdkFor(creditAccount, extras),
    sourceToken,
    targetHF: FACADE_BAR,
  });
}

/**
 * The largest amount the engine itself accepts, found by bisection — the only
 * authority on what the ceiling should say, since it runs the very check the
 * ceiling is a closed form of.
 */
async function acceptedMax(
  creditAccount: CreditAccountSlice,
  extras: MarketSdkExtras | undefined,
  sourceToken: Address,
  upperBound: bigint,
): Promise<bigint> {
  const sdk = sdkFor(creditAccount, extras);
  const service = new CreditAccountOperationsService(sdk);
  const accepts = async (amount: bigint): Promise<boolean> => {
    const result = await service.startIntent({
      intent: { type: "WITHDRAW", amount, to: WALLET, sourceToken },
      creditAccount,
      sdk,
      quotaReserve: undefined,
      slippage: undefined,
    });
    return result.ok;
  };

  let lo = 0n;
  let hi = upperBound;
  while (lo < hi) {
    const mid = (lo + hi + 1n) / 2n;
    if (await accepts(mid)) {
      lo = mid;
    } else {
      hi = mid - 1n;
    }
  }
  return lo;
}

describe("safeWithdrawCeiling", () => {
  it("lands on the exact amount the engine accepts, feed by feed", async () => {
    const ca = mixedAccount();
    // $1.00 and $0.50 against a $2.00 main feed, then no reserve feed at all —
    // the three marks that pull the ceiling below the debt band.
    for (const reservePrices of [
      reserves(100000000n),
      reserves(50000000n),
      { [UND]: MAIN },
    ]) {
      const extras: MarketSdkExtras = { reservePrices };
      const answer = ceiling(ca, extras);
      const engine = await acceptedMax(ca, extras, UND, U("1900"));

      expect(answer).toBe(engine);
    }
  });

  it("stays out of the way when the reserve feed agrees with the main one", () => {
    const ca = mixedAccount();
    // Nothing is marked down, so the check still stops short of the whole net
    // value — thresholds alone see to that — but it stops later than the debt
    // band does, which is what "does not bind" means here.
    expect(ceiling(ca, { reservePrices: reserves(MAIN) })).toBeGreaterThan(
      U("1900"),
    );
  });

  it("falls as the reserve feed does", () => {
    const ca = mixedAccount();
    const at = (pos: bigint) => ceiling(ca, { reservePrices: reserves(pos) });

    expect(at(50000000n)).toBeLessThan(at(100000000n));
    expect(at(100000000n)).toBeLessThan(at(150000000n));
  });

  it("offers nothing when the account is already under the bar at safe prices", async () => {
    // Every dollar of collateral is the marked-down token, so the safe-price
    // factor is 0.92 and a proportional withdrawal cannot lift it.
    const ca = buildFixtureCreditAccount({
      totalDebt: U("1000"),
      tokens: [caToken(POS, U("2000"), quotaOf(U("2000")))],
    });
    const extras: MarketSdkExtras = { reservePrices: reserves(100000000n) };

    expect(ceiling(ca, extras, POS)).toBe(0n);
    expect(await acceptedMax(ca, extras, POS, U("900"))).toBe(0n);
  });

  it("frees the whole net value on an account that owes nothing", () => {
    const ca = buildFixtureCreditAccount({
      totalDebt: 0n,
      tokens: [caToken(POS, U("2000"))],
    });
    expect(ceiling(ca, { reservePrices: {} }, POS)).toBe(U("2000"));
  });
});

describe("CreditAccountOperationsService.maxWithdraw", () => {
  it("reports the safe ceiling below the band's, and the exit beside both", () => {
    const creditAccount = mixedAccount();
    const extras: MarketSdkExtras = {
      reservePrices: reserves(50000000n),
    };
    const sdk = sdkFor(creditAccount, extras);

    const ceilings = new CreditAccountOperationsService(sdk).maxWithdraw({
      creditAccount,
      sdk,
      sourceToken: UND,
    });

    expect(ceilings.safePartial).toBeLessThan(ceilings.partial);
    expect(ceilings.safePartial).toBe(
      safeWithdrawCeiling({
        creditAccount,
        sdk,
        sourceToken: UND,
        targetHF: FACADE_BAR,
      }),
    );
    // The exit answers to no collateral check, so it is untouched by any of it.
    expect(ceilings.exit).toBe(U("2000"));
  });

  it("never reports a safe ceiling above the band's", () => {
    const creditAccount = mixedAccount();
    const sdk = sdkFor(creditAccount, {
      reservePrices: reserves(MAIN),
    });

    const ceilings = new CreditAccountOperationsService(sdk).maxWithdraw({
      creditAccount,
      sdk,
      sourceToken: UND,
    });

    expect(ceilings.safePartial).toBe(ceilings.partial);
  });
});
