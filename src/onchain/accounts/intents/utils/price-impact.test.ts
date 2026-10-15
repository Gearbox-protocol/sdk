import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { TokenAmount } from "../../../../model/index.js";
import { WAD } from "../../../constants/math.js";
import type { Asset } from "../../../index.js";
import {
  MockTokens,
  type TestOracleToken,
  TestPriceOracle,
} from "../../../market/oracle/TestPriceOracle.mock.js";
import {
  collectPriceImpact,
  type LegProbe,
  lossRate,
  startProbe,
} from "./price-impact.js";

const A = MockTokens.WETH;
const B = MockTokens.cbETH;
const UND = MockTokens.DAI;

function probe(
  over: Partial<LegProbe> & Pick<LegProbe, "realAmount">,
): LegProbe {
  return {
    tokenOut: UND,
    basketWad: 1_000n * WAD,
    probeWad: 20n * WAD,
    probe: Promise.resolve(20n * WAD),
    ...over,
  };
}

/** The identity conversion: every leg already reports in the underlying. */
const same = (_from: Address, amount: bigint): bigint => amount;

const toUnderlyingAmount = (value: bigint): TokenAmount => ({
  token: { chainId: 1, address: UND, symbol: "DAI", name: "DAI", decimals: 18 },
  value,
  valueUsd: null,
});

describe("lossRate", () => {
  it("states the loss against each base, negative for a loss", () => {
    expect(
      lossRate({
        lossUnd: 10n,
        expectedUnd: 1_000n,
        totalValue: 2_000n,
        netValue: 500n,
      }),
    ).toEqual({
      // 1% of the routed output, 2% of the equity, 0.5% of the position
      pathPriceImpact: -10_000n,
      netValuePriceImpact: -20_000n,
      totalValuePriceImpact: -5_000n,
    });
  });

  it("falls back to the routed output where there is no equity to speak of", () => {
    const rate = lossRate({
      lossUnd: 10n,
      expectedUnd: 1_000n,
      totalValue: 0n,
      netValue: 0n,
    });

    expect(rate.netValuePriceImpact).toBe(rate.pathPriceImpact);
    expect(rate.totalValuePriceImpact).toBe(rate.pathPriceImpact);
  });

  it("reads positive where the route beat the marginal price", () => {
    const rate = lossRate({
      lossUnd: -10n,
      expectedUnd: 1_000n,
      totalValue: 2_000n,
      netValue: 500n,
    });

    expect(rate.pathPriceImpact).toBe(10_000n);
    expect(rate.netValuePriceImpact).toBe(20_000n);
  });
});

describe("collectPriceImpact", () => {
  it("measures nothing when the preview routed nothing", async () => {
    await expect(
      collectPriceImpact([], {
        totalValue: 1n,
        netValue: 1n,
        toUnderlying: same,
        toUnderlyingAmount,
      }),
    ).resolves.toBeUndefined();
  });

  it("extrapolates the probe to the real basket before comparing", async () => {
    // A probe of 20 returning 20 means the marginal price is 1:1, so a basket
    // worth 1000 should have returned 1000. It returned 990.
    const rate = await collectPriceImpact(
      [
        probe({
          realAmount: 990n * WAD,
          basketWad: 1_000n * WAD,
          probeWad: 20n * WAD,
          probe: Promise.resolve(20n * WAD),
        }),
      ],
      {
        totalValue: 2_000n * WAD,
        netValue: 500n * WAD,
        toUnderlying: same,
        toUnderlyingAmount,
      },
    );

    // 10 lost out of 1000 expected
    expect(rate?.pathPriceImpact).toBe(-10_000n);
    expect(rate?.netValuePriceImpact).toBe(-20_000n);
    expect(rate?.absolutePriceImpact).toEqual(toUnderlyingAmount(-10n * WAD));
  });

  it("adds legs up in the underlying, not in their own tokens", async () => {
    // Two legs of equal size in their own token, but the second's token is
    // worth ten underlying. Denominating wrongly would halve the answer.
    const rate = await collectPriceImpact(
      [
        probe({
          tokenOut: A,
          realAmount: 99n * WAD,
          basketWad: 100n * WAD,
          probeWad: 20n * WAD,
          probe: Promise.resolve(20n * WAD),
        }),
        probe({
          tokenOut: B,
          realAmount: 99n * WAD,
          basketWad: 100n * WAD,
          probeWad: 20n * WAD,
          probe: Promise.resolve(20n * WAD),
        }),
      ],
      {
        totalValue: 1_100n * WAD,
        netValue: 1_100n * WAD,
        toUnderlying: (from, amount) => (from === B ? amount * 10n : amount),
        toUnderlyingAmount,
      },
    );

    // expected: 100 + 1000 = 1100; lost: 1 + 10 = 11 — exactly 1% of it
    expect(rate?.pathPriceImpact).toBe(-10_000n);
  });

  it("measures nothing at all when one leg's probe failed", async () => {
    await expect(
      collectPriceImpact(
        [
          probe({ realAmount: 990n * WAD }),
          probe({ realAmount: 990n * WAD, probe: Promise.resolve(undefined) }),
        ],
        {
          totalValue: 2_000n * WAD,
          netValue: 500n * WAD,
          toUnderlying: same,
          toUnderlyingAmount,
        },
      ),
      // A partial sum would understate the loss and draw a better price than
      // the route offers.
    ).resolves.toBeUndefined();
  });

  it("keeps the sign when the loss has to be priced in another token", async () => {
    // `convert` answers 0 for a negative amount, so a leg that beat the
    // marginal price must be converted by magnitude and signed back.
    const rate = await collectPriceImpact(
      [
        probe({
          tokenOut: A,
          realAmount: 101n * WAD,
          basketWad: 100n * WAD,
          probeWad: 20n * WAD,
          probe: Promise.resolve(20n * WAD),
        }),
      ],
      {
        totalValue: 100n * WAD,
        netValue: 100n * WAD,
        toUnderlying: (_from, amount) => (amount < 0n ? 0n : amount),
        toUnderlyingAmount,
      },
    );

    expect(rate?.pathPriceImpact).toBe(10_000n);
    expect(rate?.absolutePriceImpact).toEqual(toUnderlyingAmount(WAD));
  });
});

describe("the probe basket", () => {
  /** Reaches `probeBasket` through the only door that exposes it. */
  async function scaled(
    basket: Asset[],
    tokens: Record<Address, TestOracleToken>,
  ) {
    const { startProbe } = await import("./price-impact.js");
    let seen: Asset[] | undefined;
    const started = startProbe({
      basket,
      tokenOut: UND,
      oracle: new TestPriceOracle(tokens),
      route: async balances => {
        seen = balances;
        return 1n;
      },
    });
    await started?.probe;
    return { started, seen };
  }

  it("keeps the basket's proportions", async () => {
    const { started, seen } = await scaled(
      [
        { token: A, balance: 100_000n * WAD },
        { token: B, balance: 100_000n * WAD },
      ],
      { [A]: { price: 1 }, [B]: { price: 3 } },
    );

    expect(started).toBeDefined();
    // Scaled by value, so two equal balances stay equal even though the second
    // token is worth three times the first.
    expect(seen?.[0]?.balance).toBe(seen?.[1]?.balance);
    expect(seen?.[0]?.balance).toBeLessThan(100_000n * WAD);
  });

  it("probes a small basket rather than refusing it", async () => {
    const { started } = await scaled([{ token: A, balance: 5n * WAD }], {
      [A]: { price: 1 },
    });

    // Keep measuring small baskets; the fixed probe can exceed their value.
    expect(started).toBeDefined();
  });

  it("quotes a hundred-dollar probe", async () => {
    const { started, seen } = await scaled(
      [{ token: A, balance: 100n * WAD }],
      { [A]: { price: 1 } },
    );

    // Both the quote and its valuation use the larger probe.
    expect(started?.probeWad).toBe(100n * WAD);
    expect(seen?.[0]?.balance).toBe(100n * WAD);
  });

  it("leaves an unpriceable component out of the total, but still sells it", async () => {
    const { started, seen } = await scaled(
      [
        { token: A, balance: 100_000n * WAD },
        { token: B, balance: 1n * WAD },
      ],
      // No price for B.
      { [A]: { price: 1 } },
    );

    // The reference implementation adds only what it can price, and scales the
    // whole basket by that total — the unpriced leg still goes to the router.
    expect(started).toBeDefined();
    expect(seen?.map(a => a.token)).toEqual([A, B]);
  });

  it("declines only a basket that is worth nothing", async () => {
    const { started } = await scaled([{ token: A, balance: 1n * WAD }], {});

    expect(started).toBeUndefined();
  });

  it("declines an empty basket", async () => {
    const { started } = await scaled([{ token: A, balance: 0n }], {
      [A]: { price: 1 },
    });

    expect(started).toBeUndefined();
  });
});

describe("price impact on a market with no depth", () => {
  it("reads zero when scaling rounds the probe input down", async () => {
    // $60k a unit at 8 decimals: scaling the input down loses a fraction
    // of a base unit, so use the actual probe value for extrapolation.
    const BTC = "0x00000000000000000000000000000000000000b7" as Address;
    const oracle = new TestPriceOracle({
      [BTC]: { decimals: 8, price: 60_000 },
      [UND]: { price: 1 },
    });
    const toUnderlying = (from: Address, amount: bigint): bigint =>
      oracle.safeConvert(from, UND, amount).value;
    const balance = 123_456_789n;

    const started = startProbe({
      basket: [{ token: BTC, balance }],
      tokenOut: UND,
      oracle,
      route: async ([only]) => only && toUnderlying(only.token, only.balance),
    });
    if (!started) throw new Error("expected a probe");

    const rate = await collectPriceImpact(
      [{ ...started, realAmount: toUnderlying(BTC, balance) }],
      { totalValue: WAD, netValue: WAD, toUnderlying, toUnderlyingAmount },
    );

    expect(rate?.pathPriceImpact).toBe(0n);
  });
});

describe("output rounding", () => {
  const STAC: Address = "0x00000000000000000000000000000000000057ac";
  const USDC = MockTokens.USDC;
  const oracle = new TestPriceOracle({
    [USDC]: { price: 1 },
    [STAC]: { decimals: 6, price: "1035.459296", symbol: "STAC" },
  });
  const usdcAmount = (value: bigint): TokenAmount => ({
    token: {
      chainId: 1,
      address: USDC,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
    },
    value,
    valueUsd: null,
  });

  async function stacImpact(retained: bigint) {
    // $100k collateral and $400k debt: the reported STAC opening case.
    const balance = 500_000n * 10n ** 6n;
    const started = startProbe({
      basket: [{ token: USDC, balance }],
      tokenOut: STAC,
      oracle,
      // Contract outputs truncate; safeConvert rounds up and hides the bug.
      route: async ([only]) =>
        only && oracle.convert(only.token, STAC, only.balance),
    });
    if (!started) throw new Error("expected a probe");
    const realAmount =
      (oracle.convert(USDC, STAC, balance) * retained) / 1_000_000n;
    return collectPriceImpact([{ ...started, realAmount }], {
      totalValue: balance,
      netValue: 100_000n * 10n ** 6n,
      toUnderlying: (from, amount) =>
        oracle.safeConvert(from, USDC, amount).value,
      toUnderlyingAmount: usdcAmount,
    });
  }

  it("retains a STAC loss larger than the probe's rounding error", async () => {
    const rate = await stacImpact(999_900n);
    expect(rate?.pathPriceImpact).toBeLessThan(0n);
  });

  it.each([1_000_000n, 999_999n])(
    "zeros a STAC gain that rounding can explain (%s retained)",
    async retained => {
      expect(await stacImpact(retained)).toEqual({
        pathPriceImpact: 0n,
        netValuePriceImpact: 0n,
        totalValuePriceImpact: 0n,
        absolutePriceImpact: usdcAmount(0n),
      });
    },
  );

  it("retains a STAC gain outside the rounding interval", async () => {
    const rate = await stacImpact(1_000_100n);
    expect(rate?.pathPriceImpact).toBeGreaterThan(0n);
    expect(rate?.absolutePriceImpact.value).toBeGreaterThan(0n);
  });

  const ctx = {
    totalValue: 1_000n,
    netValue: 100n,
    toUnderlying: same,
    toUnderlyingAmount,
  };

  it.each([999n, 1_000n, 1_010n])(
    "zeros an impact whose interval touches zero (%s real output)",
    async realAmount => {
      const rate = await collectPriceImpact(
        [
          probe({
            basketWad: 1_000n * WAD,
            probeWad: 100n * WAD,
            probe: Promise.resolve(100n),
            realAmount,
          }),
        ],
        ctx,
      );
      expect(rate).toEqual({
        pathPriceImpact: 0n,
        netValuePriceImpact: 0n,
        totalValuePriceImpact: 0n,
        absolutePriceImpact: toUnderlyingAmount(0n),
      });
    },
  );

  it.each([990n, 1_020n])(
    "keeps a certain sign (%s real output)",
    async realAmount => {
      const rate = await collectPriceImpact(
        [
          probe({
            basketWad: 1_000n * WAD,
            probeWad: 100n * WAD,
            probe: Promise.resolve(100n),
            realAmount,
          }),
        ],
        ctx,
      );
      expect(rate?.absolutePriceImpact.value).toBe(realAmount - 1_000n);
    },
  );

  it("checks the aggregate interval after converting different tokens", async () => {
    const rate = await collectPriceImpact(
      [
        probe({
          tokenOut: A,
          basketWad: 1_000n * WAD,
          probeWad: 100n * WAD,
          probe: Promise.resolve(100n),
          realAmount: 980n,
        }),
        probe({
          tokenOut: B,
          basketWad: 1_000n * WAD,
          probeWad: 100n * WAD,
          probe: Promise.resolve(100n),
          realAmount: 1_003n,
        }),
      ],
      {
        ...ctx,
        toUnderlying: (from, amount) => (from === B ? amount * 10n : amount),
      },
    );
    // A loses 20 underlying, B appears to gain 30; B's rounding can reverse the sum.
    expect(rate?.absolutePriceImpact.value).toBe(0n);
  });

  it("includes rounding outward when converting to the underlying", async () => {
    const rate = await collectPriceImpact(
      [
        probe({
          basketWad: 1_000n * WAD,
          probeWad: 100n * WAD,
          probe: Promise.resolve(100n),
          realAmount: 998n,
        }),
      ],
      { ...ctx, toUnderlying: (_from, amount) => (amount + 9n) / 10n },
    );
    expect(rate?.absolutePriceImpact.value).toBe(0n);
  });
});
