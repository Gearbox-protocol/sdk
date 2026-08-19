import { describe, expect, it } from "vitest";

import {
  ANY,
  ANY2,
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  UND,
} from "../testing/market.js";
import { pickFattestNonPhantomToken, rankAccountTokens } from "./pick-token.js";

const PHANTOM = "0xcccccccccccccccccccccccccccccccccccccccc" as const;

describe("pickFattestNonPhantomToken", () => {
  it("ranks by value in underlying, not by raw balance", () => {
    // 2000 ANY (18 dec) is worth 1000 UND; 1500 UND (8 dec) is worth more,
    // even though its raw balance is numerically far smaller.
    const sdk = buildMarketSdk();
    const creditAccount = buildFixtureCreditAccount({
      accountDebt: 0n,
      tokens: [
        caToken(ANY, 2000000000000000000000n),
        caToken(UND, 150000000000n),
      ],
    });

    const ranked = rankAccountTokens({ creditAccount, sdk });
    expect(ranked.map(c => c.token)).toEqual([UND, ANY]);
    expect(pickFattestNonPhantomToken({ creditAccount, sdk })?.token).toBe(UND);
  });

  it("skips phantoms even when they are the largest balance", () => {
    const sdk = buildMarketSdk({
      phantoms: [PHANTOM],
      extraPrices: { [PHANTOM]: 100000000n },
      extraDecimals: { [PHANTOM]: 18 },
    });
    const creditAccount = buildFixtureCreditAccount({
      accountDebt: 0n,
      tokens: [
        caToken(PHANTOM, 999000000000000000000000n),
        caToken(ANY, 2000000000000000000000n),
      ],
    });

    expect(pickFattestNonPhantomToken({ creditAccount, sdk })?.token).toBe(ANY);
  });

  it("skips zero balances and excluded tokens", () => {
    const sdk = buildMarketSdk();
    const creditAccount = buildFixtureCreditAccount({
      accountDebt: 0n,
      tokens: [
        caToken(UND, 0n),
        caToken(ANY, 2000000000000000000000n),
        caToken(ANY2, 1000000000000000000000n),
      ],
    });

    expect(pickFattestNonPhantomToken({ creditAccount, sdk })?.token).toBe(ANY);
    expect(
      pickFattestNonPhantomToken({ creditAccount, sdk, exclude: [ANY] })?.token,
    ).toBe(ANY2);
  });

  it("returns undefined when nothing is spendable", () => {
    const sdk = buildMarketSdk();
    const creditAccount = buildFixtureCreditAccount({
      accountDebt: 0n,
      tokens: [caToken(UND, 0n)],
    });

    expect(pickFattestNonPhantomToken({ creditAccount, sdk })).toBeUndefined();
  });

  it("breaks ties on address so the pick is stable", () => {
    const sdk = buildMarketSdk();
    const creditAccount = buildFixtureCreditAccount({
      accountDebt: 0n,
      tokens: [
        caToken(ANY2, 1000000000000000000000n),
        caToken(ANY, 1000000000000000000000n),
      ],
    });

    // Equal value: ANY (0x1111…) sorts before ANY2 (0xbbbb…).
    expect(pickFattestNonPhantomToken({ creditAccount, sdk })?.token).toBe(ANY);
  });
});
