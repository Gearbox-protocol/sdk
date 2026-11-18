import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { classifySources, sourcesByFeed, type TreeNode } from "./classify.js";
import { groupOverride, perturb, rateStub, roundDataStub } from "./override.js";
import { scoreGroup, slotHarm } from "./score.js";
import type {
  GroupScenarioOutcome,
  SlotOutcome,
  StressSource,
} from "./types.js";

const addr = (n: number): Address =>
  `0x${n.toString(16).padStart(40, "0")}` as Address;

function node(over: Partial<TreeNode> & { address: Address }): TreeNode {
  return {
    contractType: "",
    version: 0,
    description: "",
    underlyingFeeds: [],
    ...over,
  };
}

const classify = (nodes: TreeNode[], rates = new Map<Address, Address>()) =>
  classifySources(1, nodes, rates, () => 100n);

describe("classifySources", () => {
  it("takes the Gearbox feed type over anything the description says", () => {
    // A Redstone feed describing itself as a Chainlink pair is still Redstone:
    // the type says who Gearbox built it to read.
    const [source] = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::REDSTONE",
        description: "ETH / USD",
        version: 6,
      }),
    ]).sources;

    expect(source?.group).toBe("Redstone");
    expect(source?.via).toBe("Gearbox feed type");
  });

  it("reads a Chainlink pair only at interface version 6", () => {
    const { sources } = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::EXTERNAL",
        description: "ETH / USD",
        version: 6,
      }),
      // The same shape at another version is one of the many imitators, and
      // calling it Chainlink would be the kind of guess this must not make.
      node({
        address: addr(2),
        contractType: "PRICE_FEED::EXTERNAL",
        description: "ETH / USD",
        version: 1,
      }),
    ]);

    expect(sources[0]?.group).toBe("Chainlink");
    expect(sources[0]?.identified).toBe(true);
    expect(sources[1]?.group).toBe("ETH / USD");
    expect(sources[1]?.identified).toBe(false);
  });

  it("groups a protocol's rate adapter under the token in front of the slash", () => {
    const [source] = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::EXTERNAL",
        description: "rETH/ETH exchange rate adapter",
        version: 1,
      }),
    ]).sources;

    expect(source?.group).toBe("rETH");
    expect(source?.kind).toBe("feed");
  });

  it("leaves an unrecognised feed as a group of one, flagged", () => {
    const [source] = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::EXTERNAL",
        description: "Surge tETH-Lido wstETH/USD",
        version: 0,
      }),
    ]).sources;

    expect(source?.group).toBe("Surge tETH-Lido wstETH/USD");
    expect(source?.identified).toBe(false);
  });

  it("reads one issuer's family as one group", () => {
    // Midas publishes mTBILL, mBASIS, mEDGE and the rest off one operation, so
    // they fail together and are one group rather than six of one.
    const { sources } = classify([
      node({ address: addr(1), description: "mF-ONE/USD", version: 1 }),
      node({ address: addr(2), description: "mGLOBAL/USD", version: 1 }),
      node({ address: addr(3), description: "mBASIS/USD", version: 1 }),
    ]);

    expect(sources.map(s => s.group)).toEqual(["Midas", "Midas", "Midas"]);
    expect(sources.every(s => s.identified)).toBe(true);
  });

  it("does not read an ordinary symbol beginning with an m as that family", () => {
    const [source] = classify([
      node({ address: addr(1), description: "mock / USD", version: 1 }),
    ]).sources;

    expect(source?.group).not.toBe("Midas");
  });

  it("reads an exchange-rate adapter whichever separator it uses", () => {
    const { sources } = classify([
      node({ address: addr(1), description: "rETH/ETH exchange rate adapter" }),
      node({ address: addr(2), description: "SAVUSD-AVUSD Exchange Rate" }),
    ]);

    expect(sources.map(s => s.group)).toEqual(["rETH", "SAVUSD"]);
  });

  it("marks a feed carrying its own answer as nothing to perturb", () => {
    const { sources } = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::CONSTANT",
        description: "$1 constant price feed",
      }),
    ]);

    expect(sources[0]?.group).toBe("Constant");
    // Nobody publishes to it, so there is no source to make lie — see
    // StressSource.perturbable.
    expect(sources[0]?.perturbable).toBe(false);
  });

  it("perturbs a rate-bearing feed at the contract it reads, not at itself", () => {
    const feed = addr(1);
    const vault = addr(99);
    const { sources } = classify(
      [
        node({
          address: feed,
          contractType: "PRICE_FEED::ERC4626",
          description: "sUSDS / USD LP price feed",
          // It reads a price feed too, which belongs to whoever publishes it.
          underlyingFeeds: [addr(2)],
        }),
      ],
      new Map([[feed, vault]]),
    );

    expect(sources[0]?.kind).toBe("rate");
    expect(sources[0]?.target).toBe(vault);
    expect(sources[0]?.feed).toBe(feed);
    expect(sources[0]?.group).toBe("Sky");
  });

  it("leaves a rate feed out, with a reason, when it will not name its contract", () => {
    const { sources, unresolved } = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::ERC4626",
        description: "whatever / USD LP price feed",
        underlyingFeeds: [addr(2)],
      }),
    ]);

    expect(sources).toHaveLength(0);
    expect(unresolved.map(n => n.address)).toEqual([addr(1)]);
  });

  it("is not a source for a composite feed, which has no opinion of its own", () => {
    const { sources } = classify([
      node({
        address: addr(1),
        contractType: "PRICE_FEED::COMPOSITE",
        description: "Composite feed",
        underlyingFeeds: [addr(2), addr(3)],
      }),
    ]);

    expect(sources).toHaveLength(0);
  });

  it("counts one contract two feeds read as one source", () => {
    const vault = addr(99);
    const { sources } = classify(
      [
        node({
          address: addr(1),
          contractType: "PRICE_FEED::WSTETH",
          description: "wstETH / USD LP price feed",
          underlyingFeeds: [addr(3)],
        }),
        node({
          address: addr(2),
          contractType: "PRICE_FEED::WSTETH",
          description: "wstETH / USD LP price feed",
          underlyingFeeds: [addr(3)],
        }),
      ],
      new Map([
        [addr(1), vault],
        [addr(2), vault],
      ]),
    );

    expect(sources).toHaveLength(1);
    expect(sources[0]?.group).toBe("Lido");
  });
});

describe("sourcesByFeed", () => {
  const leaf = addr(3);
  const nodes = new Map<Address, TreeNode>([
    [addr(1), node({ address: addr(1), underlyingFeeds: [addr(2)] })],
    [addr(2), node({ address: addr(2), underlyingFeeds: [leaf] })],
    [leaf, node({ address: leaf })],
  ]);
  const sources = [{ feed: leaf, target: leaf } as StressSource];

  it("reaches a source at any depth under the root", () => {
    const reach = sourcesByFeed([addr(1)], nodes, sources);
    expect([...(reach.get(addr(1)) ?? [])]).toEqual([leaf]);
  });

  it("ends a cycle at the branch rather than recursing forever", () => {
    const cyclic = new Map<Address, TreeNode>([
      [addr(1), node({ address: addr(1), underlyingFeeds: [addr(2)] })],
      [addr(2), node({ address: addr(2), underlyingFeeds: [addr(1), leaf] })],
      [leaf, node({ address: leaf })],
    ]);

    expect([
      ...(sourcesByFeed([addr(1)], cyclic, sources).get(addr(1)) ?? []),
    ]).toEqual([leaf]);
  });
});

describe("perturb", () => {
  it("keeps all of a multiplier twelve orders of magnitude up", () => {
    // The naive `BigInt(Math.round(m * 1e9))` loses the bottom of this.
    expect(perturb(228_130_000_000n, 1e12)).toBe(
      228_130_000_000_000_000_000_000n,
    );
  });

  it("keeps all of one twelve orders down", () => {
    expect(perturb(228_130_000_000n, 1e-12)).toBe(0n + 1n);
    expect(perturb(10n ** 30n, 1e-12)).toBe(10n ** 18n);
  });

  it("floors at one rather than at zero", () => {
    // Zero is the feed reporting nothing, which is a different scenario with a
    // different meaning, so a multiplier is never allowed to produce it.
    expect(perturb(1n, 1e-12)).toBe(1n);
  });

  it("is exact on a round multiplier", () => {
    expect(perturb(1_000n, 2)).toBe(2_000n);
    expect(perturb(1_000n, 0.5)).toBe(500n);
    expect(perturb(1_000_000n, 1.001)).toBe(1_001_000n);
  });
});

describe("the stubs", () => {
  it("answers round data in five words, with the decimals doubling as a round id", () => {
    const code = roundDataStub(42n, 1_700_000_000n);
    // PUSH32 <8> MSTORE(0) ... RETURN(0, 0xa0): a caller decoding one word off
    // the front reads 8, which is the decimals every Gearbox feed reports.
    expect(code.startsWith(`0x7f${"8".padStart(64, "0")}600052`)).toBe(true);
    expect(code.endsWith("60a06000f3")).toBe(true);
    expect(code).toContain(42n.toString(16).padStart(64, "0"));
  });

  it("answers a rate in one word", () => {
    expect(rateStub(7n)).toBe(
      `0x7f${7n.toString(16).padStart(64, "0")}60005260206000f3`,
    );
  });

  it("writes a negative answer as two's complement", () => {
    expect(roundDataStub(-1n, 0n)).toContain("f".repeat(64));
  });
});

describe("groupOverride", () => {
  const source = (over: Partial<StressSource>): StressSource =>
    ({
      chainId: 1,
      group: "g",
      kind: "feed",
      target: addr(1),
      feed: addr(1),
      contractType: "",
      description: "",
      identified: true,
      via: "",
      perturbable: true,
      baseline: 100n,
      ...over,
    }) as StressSource;

  it("leaves out a source nothing feeds", () => {
    expect(groupOverride([source({ perturbable: false })], 2, 0n)).toEqual([]);
  });

  it("leaves out a source that is not answering", () => {
    expect(groupOverride([source({ baseline: null })], 2, 0n)).toEqual([]);
  });

  it("stubs a rate source with one word and a feed source with five", () => {
    const [rate] = groupOverride([source({ kind: "rate" })], 2, 0n);
    const [feed] = groupOverride([source({ kind: "feed" })], 2, 0n);

    expect(rate?.code).toBe(rateStub(200n));
    expect(feed?.code).toBe(roundDataStub(200n, 0n));
  });
});

describe("slotHarm", () => {
  const slot = (over: Partial<SlotOutcome>): SlotOutcome =>
    ({
      market: addr(1),
      marketName: null,
      curatorName: null,
      token: addr(2),
      tokenSymbol: null,
      reserve: false,
      isUnderlying: false,
      feed: { feed: addr(3), base: 1n, stressed: 1n, factor: 1 },
      ratioFactor: 1,
      quotaUsedUsd: 0,
      ...over,
    }) as SlotOutcome;

  it("is nothing where the ratio did not move", () => {
    expect(slotHarm(slot({ ratioFactor: 1 }))).toBe(0);
  });

  it("is the same either side of one, because both ends are an attack", () => {
    expect(slotHarm(slot({ ratioFactor: 10 }))).toBeCloseTo(
      slotHarm(slot({ ratioFactor: 0.1 })),
    );
  });

  it("tops out at a hundredfold move", () => {
    expect(slotHarm(slot({ ratioFactor: 100 }))).toBe(1);
    expect(slotHarm(slot({ ratioFactor: 1e24 }))).toBe(1);
  });

  it("counts a feed that stopped answering as half a mispricing", () => {
    expect(
      slotHarm(
        slot({
          feed: { feed: addr(3), base: 1n, stressed: null, factor: null },
        }),
      ),
    ).toBe(0.5);
  });

  it("is nothing where the feed was not answering to begin with", () => {
    expect(
      slotHarm(
        slot({
          feed: { feed: addr(3), base: null, stressed: null, factor: null },
          ratioFactor: null,
        }),
      ),
    ).toBe(0);
  });
});

describe("scoreGroup", () => {
  const outcome = (slots: SlotOutcome[]): GroupScenarioOutcome =>
    ({
      scenario: { label: "s", multiplier: 2 },
      slots,
      worstInflation: null,
      worstDeflation: null,
      brokenSlots: 0,
      deadSlots: 0,
      valueAtRisk: 0,
    }) as GroupScenarioOutcome;

  const slot = (ratioFactor: number, quotaUsedUsd: number): SlotOutcome =>
    ({
      market: addr(1),
      marketName: null,
      curatorName: null,
      token: addr(2),
      tokenSymbol: null,
      reserve: false,
      isUnderlying: false,
      feed: { feed: addr(3), base: 1n, stressed: 2n, factor: 2 },
      ratioFactor,
      quotaUsedUsd,
    }) as SlotOutcome;

  it("gives ten to a group that moved nothing", () => {
    expect(scoreGroup([outcome([slot(1, 1_000)])])).toBe(10);
  });

  it("gives nought to a group that revalued everything", () => {
    expect(scoreGroup([outcome([slot(1e6, 1_000)])])).toBe(0);
  });

  it("still marks down a group that only reached a market with nothing in it", () => {
    // The 0.3 the worst slot carries regardless of its size: a market with no
    // quota today is where tomorrow's deposit goes.
    expect(scoreGroup([outcome([slot(1e6, 0)])])).toBe(7);
  });

  it("takes the worst scenario rather than the average of them", () => {
    const mild = outcome([slot(1, 1_000)]);
    const severe = outcome([slot(1e6, 1_000)]);
    expect(scoreGroup([mild, severe])).toBe(scoreGroup([severe]));
  });
});
