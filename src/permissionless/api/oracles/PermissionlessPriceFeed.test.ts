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
const ORACLE = "0x0000000000000000000000000000000000000e01" as Address;
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
      quotaUsed: null,
      priceOracle: ORACLE,
    },
  ],
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

    expect(details).toMatchObject(DETAILS);
    expect(details.markets[0]?.reserve).toBe(true);
    expect(details.markets[0]?.isUnderlying).toBe(true);
  });

  it("reports no staleness period for a chain it cannot reach", async () => {
    // The period lives on the market's own oracle and is not indexed, so a
    // client with no chain attached cannot have it. The indexed half of the
    // read is perfectly good and is answered rather than failed.
    const details = await client().oracles.feed({
      chainId: CHAIN,
      address: FEED,
    });

    expect(details.markets[0]?.marketStalenessPeriod).toBe(null);
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

describe("oracles.stores", () => {
  const STORE = {
    chainId: CHAIN,
    name: "Mainnet",
    isPublic: true,
    isActivated: true,
    explorerUrl: "https://etherscan.io",
    assets: [],
    priceFeeds: [],
  };

  it("reads every chain from the one route", async () => {
    respond([STORE, { ...STORE, chainId: 42_793, name: "Etherlink" }]);

    const stores = await client().oracles.stores();

    expect(requested().pathname).toBe("/pfs/stores");
    expect(requested().searchParams.get("chainId")).toBeNull();
    expect(stores.map(it => it.chainId)).toEqual([CHAIN, 42_793]);
  });

  it("narrows to one chain without changing the shape", async () => {
    respond([STORE]);

    const stores = await client().oracles.stores({ chainId: CHAIN });

    expect(requested().searchParams.get("chainId")).toBe(String(CHAIN));
    expect(stores).toHaveLength(1);
  });
});

describe("oracles.assets", () => {
  // Real addresses, because what the rows are classified as is read off this
  // package's own tables rather than taken from the payload.
  const MAINNET_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as Address;
  const MAINNET_RWA = "0x238a700ed6165261cf8b2e544ba797bc11e466ba" as Address;

  const summary = (overrides: Record<string, unknown> = {}) => ({
    chainId: CHAIN,
    address: MAINNET_WETH,
    symbol: "WETH",
    underlyingMarketCount: 2,
    marketQuotas: [],
    ...overrides,
  });

  it("classifies an asset the curated tables name", async () => {
    respond([summary()]);

    const assets = await client().oracles.assets();

    expect(assets[0]).toMatchObject({ assetType: "ETH", isRwa: false });
  });

  it("leaves an asset no table names unclassified", async () => {
    respond([summary({ address: WETH, symbol: "NOTHING" })]);

    const assets = await client().oracles.assets();

    expect(assets[0]).toMatchObject({ assetType: null, isRwa: false });
  });

  it("marks an asset the real-world list names", async () => {
    // Orthogonal to the type, which this one has none of.
    respond([summary({ address: MAINNET_RWA, symbol: "mF-ONE" })]);

    const assets = await client().oracles.assets();

    expect(assets[0]).toMatchObject({ assetType: null, isRwa: true });
  });

  it("serves a chain the tables do not cover rather than failing", async () => {
    respond([summary({ chainId: 999_999 })]);

    const assets = await client().oracles.assets();

    expect(assets[0]).toMatchObject({ assetType: null, isRwa: false });
  });

  it("classifies each chain of a list by its own tables", async () => {
    respond([summary(), summary({ chainId: 999_999 })]);

    const assets = await client().oracles.assets();

    expect(assets.map(it => it.assetType)).toEqual(["ETH", null]);
  });
});

describe("oracles.getMarketCap", () => {
  beforeEach(() => respond(DETAILS));

  it("enumerates one asset against each of its feeds", async () => {
    const caps = await client().oracles.getMarketCap({
      chainId: CHAIN,
      asset: WETH,
      priceFeeds: [FEED, CHILD],
    });

    expect(caps.map(it => [it.priceFeed, it.asset])).toEqual([
      [FEED, WETH],
      [CHILD, WETH],
    ]);
  });

  it("enumerates one feed against each of the assets it prices", async () => {
    const caps = await client().oracles.getMarketCap({
      chainId: CHAIN,
      priceFeed: FEED,
      assets: [WETH, CHILD],
    });

    expect(caps.map(it => [it.priceFeed, it.asset])).toEqual([
      [FEED, WETH],
      [FEED, CHILD],
    ]);
  });

  it("reports a pair it could not read as unpriced, not as worthless", async () => {
    const caps = await client().oracles.getMarketCap({
      chainId: CHAIN,
      asset: WETH,
      priceFeeds: [FEED],
    });

    expect(caps[0]?.cap).toBe(null);
  });

  it("reads nothing at all for a feed no asset uses", async () => {
    const caps = await client().oracles.getMarketCap({
      chainId: CHAIN,
      priceFeed: FEED,
      assets: [],
    });

    expect(caps).toEqual([]);
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
