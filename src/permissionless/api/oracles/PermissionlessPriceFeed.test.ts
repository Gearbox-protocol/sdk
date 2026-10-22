import type { Address } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GearboxPermissionless } from "../GearboxPermissionless.js";

const BASE_URL = "https://api.gear-dev.dev";
const CHAIN = 1;
const FEED = "0x0000000000000000000000000000000000000001" as Address;
const CHILD = "0x0000000000000000000000000000000000000002" as Address;
const WETH = "0x00000000000000000000000000000000000000aa" as Address;
const MARKET = "0x0000000000000000000000000000000000000f01" as Address;
const CONFIGURATOR = "0x0000000000000000000000000000000000000c01" as Address;
const DEPLOYER = "0x0000000000000000000000000000000000000d01" as Address;

const DETAILS = {
  chainId: CHAIN,
  priceFeed: {
    address: FEED,
    contractType: "PRICE_FEED::COMPOSITE",
    version: 310,
    deployedBy: DEPLOYER,
    stalenessPeriod: 3600,
    name: "Composite WETH / USD",
  },
  assets: [
    { address: WETH, symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  ],
  markets: [
    {
      market: MARKET,
      marketConfigurator: CONFIGURATOR,
      curatorName: "kpk",
      marketName: "WETH Market",
      token: WETH,
      tokenSymbol: "WETH",
      underlyingSymbol: "WETH",
      reserve: true,
      isUnderlying: true,
      // The market's own underlying, which is never quota-managed.
      quotaLimit: null,
    },
  ],
};

/**
 * A cap no market would report, on purpose.
 *
 * What is worth pinning is that the figure arrives as the string the backend
 * sent and is not routed through a number on the way, so the fixture is wider
 * than a double can hold rather than whatever the chain happens to say today.
 */
const CAP = "12345678901234567890.123456789";

const MARKET_CAPS = {
  marketCaps: {
    [WETH]: CAP,
    // An asset the backend could price neither off its index nor off the
    // chain. Distinct from a cap of zero.
    [CHILD]: null,
  },
  time: 1_700_000_000_000,
};

const GRAPH = {
  name: "Composite WETH / USD",
  type: "PRICE_FEED::COMPOSITE",
  feedAddress: FEED,
  dependencies: [
    {
      name: "WETH / USD",
      type: "EXTERNAL",
      feedAddress: CHILD,
      dependencies: [],
    },
  ],
};

const CHART = {
  range: "1w",
  from: 1_700_000_000,
  to: 1_700_604_800,
  intervalSeconds: 1800,
  points: [
    { timestamp: 1_700_000_000, value: 2500.5 },
    { timestamp: 1_700_001_800, value: 2501.25 },
  ],
};

let fetchMock: MockInstance<typeof fetch>;

function respond(payload: unknown): void {
  fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ data: payload }), {
      headers: { "content-type": "application/json" },
    }),
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

function client(): GearboxPermissionless {
  return new GearboxPermissionless({ baseUrl: BASE_URL });
}

function requested(): URL {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0]));
}

describe("oracles.feed", () => {
  beforeEach(() => respond(DETAILS));

  it("reads the singular path of the one feed", async () => {
    await client().oracles.feed({ chainId: CHAIN, address: FEED });

    expect(requested().pathname).toBe(`/pfs/${CHAIN}/price-feed/${FEED}`);
  });

  it("decodes the identity, the assets and both market roles", async () => {
    const details = await client().oracles.feed({
      chainId: CHAIN,
      address: FEED,
    });

    expect(details).toEqual(DETAILS);
    expect(details.markets[0]?.reserve).toBe(true);
    expect(details.markets[0]?.isUnderlying).toBe(true);
  });

  it("keeps a token the backend has no metadata for", async () => {
    respond({
      ...DETAILS,
      markets: [{ ...DETAILS.markets[0], tokenSymbol: null }],
    });

    const details = await client().oracles.feed({
      chainId: CHAIN,
      address: FEED,
    });

    expect(details.markets[0]?.tokenSymbol).toBe(null);
  });

  it("keeps a market the backend can name neither of", async () => {
    respond({
      ...DETAILS,
      markets: [{ ...DETAILS.markets[0], curatorName: null, marketName: null }],
    });

    const details = await client().oracles.feed({
      chainId: CHAIN,
      address: FEED,
    });

    expect(details.markets[0]?.curatorName).toBe(null);
    expect(details.markets[0]?.marketName).toBe(null);
  });

  it("tells a quota limit of zero from an absent one", async () => {
    // A curator who has set the limit to zero has said something; a token the
    // quota keeper holds no entry for has not. Both must survive decoding as
    // themselves.
    respond({
      ...DETAILS,
      markets: [{ ...DETAILS.markets[0], quotaLimit: 0 }],
    });

    const details = await client().oracles.feed({
      chainId: CHAIN,
      address: FEED,
    });

    expect(details.markets[0]?.quotaLimit).toBe(0);
  });

  it("survives a field the read model does not declare", async () => {
    // The schemas are loose on purpose: the backend reports more about a feed
    // than these types name, and dropping the read would be stricter than the
    // payload warrants.
    respond({ ...DETAILS, indexedAtBlock: 123 });

    await expect(
      client().oracles.feed({ chainId: CHAIN, address: FEED }),
    ).resolves.toMatchObject({ chainId: CHAIN });
  });

  it("reports a payload that is not a feed at all", async () => {
    respond({ chainId: CHAIN });

    await expect(
      client().oracles.feed({ chainId: CHAIN, address: FEED }),
    ).rejects.toThrow();
  });
});

describe("oracles.feedMarketCaps", () => {
  beforeEach(() => respond(MARKET_CAPS));

  it("reads the caps of the one feed, not of the whole chain", async () => {
    await client().oracles.feedMarketCaps({ chainId: CHAIN, address: FEED });

    expect(requested().pathname).toBe(
      `/pfs/${CHAIN}/price-feed/${FEED}/market-caps`,
    );
  });

  it("decodes the caps and the time they were read at", async () => {
    const caps = await client().oracles.feedMarketCaps({
      chainId: CHAIN,
      address: FEED,
    });

    expect(caps).toEqual(MARKET_CAPS);
  });

  it("keeps an asset nobody could price as unpriced", async () => {
    const { marketCaps } = await client().oracles.feedMarketCaps({
      chainId: CHAIN,
      address: FEED,
    });

    expect(marketCaps[CHILD]).toBe(null);
  });

  it("hands the figure over untouched, to its last digit", async () => {
    const { marketCaps } = await client().oracles.feedMarketCaps({
      chainId: CHAIN,
      address: FEED,
    });

    expect(marketCaps[WETH]).toBe(CAP);
  });

  it("answers an empty set for a feed no asset uses", async () => {
    respond({ marketCaps: {}, time: 1_700_000_000_000 });

    const { marketCaps } = await client().oracles.feedMarketCaps({
      chainId: CHAIN,
      address: FEED,
    });

    expect(marketCaps).toEqual({});
  });
});

describe("oracles.dependencies", () => {
  beforeEach(() => respond(GRAPH));

  it("reads the graph below the feed", async () => {
    await client().oracles.dependencies({ chainId: CHAIN, address: FEED });

    expect(requested().pathname).toBe(`/pfs/${CHAIN}/price-feed/${FEED}/graph`);
  });

  it("decodes the tree recursively", async () => {
    const tree = await client().oracles.dependencies({
      chainId: CHAIN,
      address: FEED,
    });

    expect(tree).toEqual(GRAPH);
    expect(tree.dependencies[0]?.dependencies).toEqual([]);
  });
});

describe("analytics.priceChart", () => {
  beforeEach(() => respond(CHART));

  it("reads the chart with its range in the query", async () => {
    await client().analytics.priceChart({
      chainId: CHAIN,
      address: FEED,
      range: "1w",
    });

    const url = requested();
    expect(url.pathname).toBe(`/pfs/${CHAIN}/price-feed/${FEED}/chart`);
    expect(url.searchParams.get("range")).toBe("1w");
  });

  it("echoes the window back, which `max` is not derivable without", async () => {
    const chart = await client().analytics.priceChart({
      chainId: CHAIN,
      address: FEED,
      range: "1w",
    });

    expect(chart).toEqual(CHART);
  });

  it("rejects a window the chart contract does not offer", async () => {
    respond({ ...CHART, range: "2w" });

    await expect(
      client().analytics.priceChart({
        chainId: CHAIN,
        address: FEED,
        range: "1w",
      }),
    ).rejects.toThrow();
  });

  it("is reachable without attaching, like every path-scoped read", async () => {
    // `attach()` builds chain clients, and this read needs none: the chain is
    // named in the path and the answer comes from the backend.
    const permissionless = client();
    expect(permissionless.isAttached).toBe(false);

    await expect(
      permissionless.analytics.priceChart({
        chainId: CHAIN,
        address: FEED,
        range: "1w",
      }),
    ).resolves.toMatchObject({ range: "1w" });
  });
});
