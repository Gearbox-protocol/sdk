import { describe, expect, it, vi } from "vitest";
import { LEVERAGE_DECIMALS } from "../../../constants/math.js";
import { toBN } from "../../../utils/index.js";
import { CreditAccountOperationsService } from "../index.js";
import { calcLeverageBand } from "../leverage-band.js";
import { assertDebtInBand, debtForLeverage } from "../math.js";
import {
  ANY,
  buildMarketSdk,
  CREDIT_MANAGER,
  MAX_DEBT,
  UND,
  UND_DECIMALS,
} from "../testing/market.js";

/** The fixture market's threshold is 9200 bps, so `calcMaxLeverage` gives 11. */
const THRESHOLD_CEILING = 11;

const und = (whole: string) => toBN(whole, UND_DECIMALS);

function band(
  extras: { minDebt?: bigint; debtLimitAvailable?: bigint },
  collateral: { token: `0x${string}`; balance: bigint }[],
  targetHF?: number,
) {
  return calcLeverageBand({
    sdk: buildMarketSdk(extras),
    creditManager: CREDIT_MANAGER,
    collateral,
    targetHF,
  });
}

describe("calcLeverageBand", () => {
  it("inverts debt = netValue x (leverage - 1)", () => {
    // 10k of net value carries the 1k minimum at 1.1x; the threshold cuts the
    // top long before the 200k facade limit does
    expect(
      band({ minDebt: und("1000") }, [{ token: UND, balance: und("10000") }]),
    ).toEqual({ min: 1.1, max: THRESHOLD_CEILING });
  });

  it("takes the ceiling from a named target health factor", () => {
    // 9200 bps gives 11x at 1.01 as well, so only a target that moves the
    // answer proves it is read at all
    expect(
      band(
        { minDebt: und("1000") },
        [{ token: UND, balance: und("10000") }],
        12_000,
      ),
    ).toEqual({ min: 1.1, max: 4 });
  });

  it("stays quiet about a market it cannot resolve yet", () => {
    // a form asks on every keystroke, including while the SDK is still
    // attaching; an unanswerable question is not a crash
    const sdk = buildMarketSdk();
    vi.spyOn(sdk.marketRegister, "findCreditManager").mockImplementation(() => {
      throw new Error("unknown credit manager");
    });
    expect(
      calcLeverageBand({
        sdk,
        creditManager: CREDIT_MANAGER,
        collateral: [{ token: UND, balance: und("10000") }],
      }),
    ).toBeUndefined();
  });

  it("offers the whole track before a deposit is named", () => {
    expect(band({ minDebt: und("1000") }, [])).toEqual({
      min: 1,
      max: THRESHOLD_CEILING,
    });
    expect(
      band({ minDebt: und("1000") }, [{ token: UND, balance: 0n }]),
    ).toEqual({ min: 1, max: THRESHOLD_CEILING });
  });

  it("stops at what the manager may still borrow", () => {
    // 50k of allowance against 10k of net value is 6x, well under the ceiling
    expect(
      band({ minDebt: und("1000"), debtLimitAvailable: und("50000") }, [
        { token: UND, balance: und("10000") },
      ]),
    ).toEqual({ min: 1.1, max: 6 });
  });

  it("rounds the floor up and the ceiling down", () => {
    // 1k/30k is 0.0333.. and 100k/30k is 3.333..
    expect(
      band({ minDebt: und("1000"), debtLimitAvailable: und("100000") }, [
        { token: UND, balance: und("30000") },
      ]),
    ).toEqual({ min: 1.04, max: 4.33 });
  });

  it("prices collateral that is not the underlying", () => {
    // ANY is worth half of UND and carries ten more decimals, so 20k of it is
    // the 10k of net value the first case deposits directly
    expect(
      band({ minDebt: und("1000") }, [
        { token: ANY, balance: toBN("20000", 18) },
      ]),
    ).toEqual({ min: 1.1, max: THRESHOLD_CEILING });
  });

  it("offers nothing when the deposit cannot carry the minimum debt", () => {
    // 90 of net value needs 12.12x to owe 1k, and the threshold allows 11
    expect(
      band({ minDebt: und("1000") }, [{ token: UND, balance: und("90") }]),
    ).toBeUndefined();
  });

  it("offers nothing when the manager has no room left", () => {
    expect(
      band({ minDebt: und("1000"), debtLimitAvailable: und("500") }, [
        { token: UND, balance: und("10000") },
      ]),
    ).toBeUndefined();
  });

  it("keeps a band that is exactly one leverage wide", () => {
    // floor and ceiling meet at 2x: one setting is legal, and it is drawn
    expect(
      band({ minDebt: und("10000"), debtLimitAvailable: und("10000") }, [
        { token: UND, balance: und("10000") },
      ]),
    ).toEqual({ min: 2, max: 2 });
  });

  it("names no leverage the debt band would refuse", () => {
    // the trip a dialog makes: a leverage the slider reports, scaled the way
    // the client scales it, turned back into debt, checked by the guard that
    // refuses operations
    const scaleLeverage = (l: number): bigint =>
      BigInt(Math.round(l * Number(LEVERAGE_DECIMALS)));

    const cases = [
      {
        minDebt: und("1000"),
        available: MAX_DEBT,
        deposits: ["10000", "30000", "123457"],
      },
      { minDebt: und("1"), available: und("7"), deposits: ["2", "7"] },
      {
        minDebt: und("333"),
        available: und("999999"),
        deposits: ["1000", "250000"],
      },
      { minDebt: 0n, available: MAX_DEBT, deposits: ["10000"] },
    ];

    let checked = 0;
    for (const c of cases) {
      const sdk = buildMarketSdk({
        minDebt: c.minDebt,
        debtLimitAvailable: c.available,
      });
      const facade = { minDebt: c.minDebt, maxDebt: MAX_DEBT };
      for (const whole of c.deposits) {
        const netValue = und(whole);
        const reachable = calcLeverageBand({
          sdk,
          creditManager: CREDIT_MANAGER,
          collateral: [{ token: UND, balance: netValue }],
        });
        expect(reachable).toBeDefined();
        if (!reachable) continue;
        for (const leverage of [reachable.min, reachable.max]) {
          const debt = debtForLeverage(netValue, scaleLeverage(leverage));
          expect(() => assertDebtInBand(sdk, debt, facade, UND)).not.toThrow();
          checked += 1;
        }
      }
    }
    // every row must contribute, or the table has drifted out of reach
    expect(checked).toBe(cases.reduce((n, c) => n + c.deposits.length * 2, 0));
  });
});

describe("CreditAccountOperationsService.leverageBand", () => {
  it("is the same answer, reached the way a form reaches it", () => {
    const sdk = buildMarketSdk({ minDebt: und("1000") });
    const collateral = [{ token: UND, balance: und("10000") }];
    const props = { sdk, creditManager: CREDIT_MANAGER, collateral };

    expect(new CreditAccountOperationsService(sdk).leverageBand(props)).toEqual(
      calcLeverageBand(props),
    );
  });
});
