import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { PRICE_DECIMALS, WAD } from "../../../constants/math.js";
import type { Asset, IPriceOracleContract } from "../../../index.js";
import { collectPriceImpact, type LegProbe, lossRate } from "./price-impact.js";

const A = "0x1111111111111111111111111111111111111111" as Address;
const B = "0x2222222222222222222222222222222222222222" as Address;
const UND = "0x3333333333333333333333333333333333333333" as Address;

/** Prices every token at `usd` per whole unit, with 18-decimal balances. */
function oracle(usd: Record<Address, bigint>): IPriceOracleContract {
  return {
    safeConvertToUSD: (token: Address, amount: bigint) => {
      const price = usd[token];
      if (price === undefined) return null;
      return (amount * price * PRICE_DECIMALS) / WAD;
    },
  } as unknown as IPriceOracleContract;
}

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
      { totalValue: 2_000n * WAD, netValue: 500n * WAD, toUnderlying: same },
    );

    // 10 lost out of 1000 expected
    expect(rate?.pathPriceImpact).toBe(-10_000n);
    expect(rate?.netValuePriceImpact).toBe(-20_000n);
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
        { totalValue: 2_000n * WAD, netValue: 500n * WAD, toUnderlying: same },
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
      },
    );

    expect(rate?.pathPriceImpact).toBe(10_000n);
  });
});

describe("the probe basket", () => {
  /** Reaches `probeBasket` through the only door that exposes it. */
  async function scaled(basket: Asset[], usd: Record<Address, bigint>) {
    const { startProbe } = await import("./price-impact.js");
    let seen: Asset[] | undefined;
    const started = startProbe({
      basket,
      tokenOut: UND,
      oracle: oracle(usd),
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
      { [A]: 1n, [B]: 3n },
    );

    expect(started).toBeDefined();
    // Scaled by value, so two equal balances stay equal even though the second
    // token is worth three times the first.
    expect(seen?.[0]?.balance).toBe(seen?.[1]?.balance);
    expect(seen?.[0]?.balance).toBeLessThan(100_000n * WAD);
  });

  it("probes a small basket rather than refusing it", async () => {
    const { started } = await scaled([{ token: A, balance: 5n * WAD }], {
      [A]: 1n,
    });

    // A dollar of a five-dollar position is barely marginal, and the reference
    // implementation quotes it anyway. Refusing here would report nothing
    // where the old client reported a number.
    expect(started).toBeDefined();
  });

  it("probes a basket that leaves room for a unit of it", async () => {
    const { started, seen } = await scaled(
      [{ token: A, balance: 100n * WAD }],
      {
        [A]: 1n,
      },
    );

    // One dollar out of a hundred: the reference implementation's own anchor.
    expect(started?.probeWad).toBe(WAD);
    expect(seen?.[0]?.balance).toBe(WAD);
  });

  it("leaves an unpriceable component out of the total, but still sells it", async () => {
    const { started, seen } = await scaled(
      [
        { token: A, balance: 100_000n * WAD },
        { token: B, balance: 1n * WAD },
      ],
      // No price for B.
      { [A]: 1n },
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
    const { started } = await scaled([{ token: A, balance: 0n }], { [A]: 1n });

    expect(started).toBeUndefined();
  });
});
