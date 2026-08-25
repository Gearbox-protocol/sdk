import type { Address } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CHART_METRIC_UNITS, type ChartMetric } from "../../model/charts.js";
import { chains } from "../../onchain/index.js";
import { OffchainPositions } from "./OffchainPositions.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

const WALLET = "0x1111111111111111111111111111111111111111" as Address;
const POOL = "0x2222222222222222222222222222222222222222" as Address;
const USDC = "0x3333333333333333333333333333333333333333" as Address;
const CREDIT_MANAGER = "0x4444444444444444444444444444444444444444" as Address;
const CREDIT_ACCOUNT = "0x5555555555555555555555555555555555555555" as Address;

let fetchMock: MockInstance<typeof fetch>;

/**
 * The backend's answer to one read, as it arrives over the wire.
 **/
function respondWith(body: unknown): void {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify(body), {
      headers: { "content-type": "application/json" },
    }),
  );
}

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, "fetch");
  respondWith({ data: [], meta: { chains: [] } });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function positions(): OffchainPositions {
  return new OffchainPositions({
    baseUrl: "https://api.gearbox.fi",
    chainIds: [MAINNET, PLASMA],
  });
}

/**
 * The one URL a test's request was issued to.
 **/
function requested(): URL {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0]));
}

describe("every list request names the wallet and the chains the client covers", () => {
  it("puts the wallet in the path", async () => {
    await positions().list({ wallet: WALLET });

    expect(requested().pathname).toBe(`/v2/positions/${WALLET}`);
  });

  it("names all the covered chains when the caller narrows nothing", async () => {
    await positions().list({ wallet: WALLET });

    expect(requested().searchParams.get("chainIds")).toBe(
      `${MAINNET},${PLASMA}`,
    );
  });

  it("narrows to the chains the filter names, alongside its other conditions", async () => {
    await positions().list({
      wallet: WALLET,
      filter: {
        chainIds: [PLASMA],
        kind: "strategy",
        isZeroDebt: false,
        underlyingType: "Stable",
      },
    });

    const query = requested().searchParams;
    expect(query.get("chainIds")).toBe(`${PLASMA}`);
    expect(query.get("kind")).toBe("strategy");
    expect(query.get("isZeroDebt")).toBe("false");
    expect(query.get("underlyingType")).toBe("Stable");
  });

  it("drops a chain the client does not cover", async () => {
    // a filter narrows a read, it does not extend it
    await positions().list({
      wallet: WALLET,
      filter: { chainIds: [PLASMA, 424_242] },
    });

    expect(requested().searchParams.get("chainIds")).toBe(`${PLASMA}`);
  });

  it("leaves out a condition that does not narrow", async () => {
    await positions().list({
      wallet: WALLET,
      filter: { kind: "all", isZeroDebt: "all", underlyingType: "all" },
    });

    const query = requested().searchParams;
    expect(query.has("kind")).toBe(false);
    expect(query.has("isZeroDebt")).toBe(false);
    expect(query.has("underlyingType")).toBe(false);
  });
});

describe("decoding what the backend answered", () => {
  const underlying = {
    chainId: MAINNET,
    address: USDC,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    assetType: "Stable",
  };

  it("reads amounts back as bigints and stamps the source", async () => {
    respondWith({
      data: [
        {
          kind: "pool",
          name: "USDC Pool",
          chainId: MAINNET,
          pool: POOL,
          underlyingToken: { ...underlying, wrappedAddress: null },
          netValue: { value: "1000000", valueUsd: 1, token: underlying },
          apy: { organicApy: 500 },
          apyAvg7D: { organicApy: 475 },
        },
        {
          kind: "strategy",
          name: "USDC Strategy",
          chainId: MAINNET,
          creditManager: CREDIT_MANAGER,
          creditAccount: CREDIT_ACCOUNT,
          underlyingToken: { ...underlying, wrappedAddress: null },
          targetCollateral: null,
          leverage: 3.5,
          borrowApy: 520,
          borrowApyAvg7D: 500,
          netApyAvg7D: { organicApy: 650 },
          borrowRateAvg7D: {
            total: 450,
            totalOnDebt: 500,
            base: 400,
            quotas: [],
          },
          totalDebt: { value: "7000000", valueUsd: 7, token: underlying },
          totalValue: { value: "9000000", valueUsd: 9, token: underlying },
          healthFactor: 12_500,
          collaterals: [],
        },
      ],
      meta: {
        chains: [
          {
            chainId: MAINNET,
            status: "success",
            blockNumber: 21_000_000,
            timestamp: 1_735_000_000,
          },
        ],
      },
    });

    const { data, meta } = await positions().list({ wallet: WALLET });

    expect(data).toHaveLength(2);
    const [pool, strategy] = data;
    expect(pool).toMatchObject({
      kind: "pool",
      name: "USDC Pool",
      apyAvg7D: { organicApy: 475 },
    });
    expect(pool?.kind === "pool" && pool.netValue.value).toBe(1_000_000n);
    expect(strategy?.kind === "strategy" && strategy.totalDebt.value).toBe(
      7_000_000n,
    );
    expect(strategy).toMatchObject({
      borrowApyAvg7D: 500,
      netApyAvg7D: { organicApy: 650 },
      borrowRateAvg7D: {
        total: 450,
        totalOnDebt: 500,
        base: 400,
        quotas: [],
      },
    });
    // the backend does not have to send `source`, so the client stamps it
    expect(meta.chains[0]).toMatchObject({
      chainId: MAINNET,
      status: "success",
      source: "offchain",
    });
  });

  it("passes through the empty answer of a liquidation-only read", async () => {
    // the backend does not serve liquidation rows yet, so it reports no chain
    // at all rather than failing the read
    const response = await positions().list({
      wallet: WALLET,
      filter: { kind: "liquidation" },
    });

    expect(response).toEqual({ data: [], meta: { chains: [] } });
  });
});

describe("a chart request names its subject, its metrics and its window", () => {
  const pool = {
    kind: "pool",
    chainId: MAINNET,
    pool: POOL,
    wallet: WALLET,
  } as const;
  const strategy = {
    kind: "strategy",
    chainId: MAINNET,
    creditAccount: CREDIT_ACCOUNT,
  } as const;

  /**
   * Answers the next read with a bundle the model accepts.
   **/
  function answerWithBundle(metrics: ChartMetric[], range = "1m"): void {
    const timestamps = [1_719_792_000, 1_719_795_600];
    const underlying = {
      chainId: MAINNET,
      address: USDC,
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      assetType: "Stable",
    };
    const seriesFor = (metric: ChartMetric) => {
      const values = [512, 530];
      const unit = CHART_METRIC_UNITS[metric];
      switch (unit) {
        case "bps":
          return { status: "ok" as const, unit, values };
        case "usd":
          return { status: "ok" as const, unit, values };
        case "token":
          return { status: "ok" as const, unit, base: underlying, values };
        case "ratio":
          return {
            status: "ok" as const,
            unit,
            base: underlying,
            quote: underlying,
            values,
          };
      }
    };
    respondWith({
      data: {
        window: { range, from: timestamps[0], to: timestamps[1] },
        timestamps,
        sampling: { kind: "grid", intervalSeconds: 3_600 },
        series: Object.fromEntries(
          metrics.map(metric => [metric, seriesFor(metric)]),
        ),
      },
      meta: { chains: [] },
    });
  }

  it("names one metric in the query, not in the path", async () => {
    answerWithBundle(["apy"]);

    await positions().getCharts(pool, ["apy"], "1m");

    expect(requested().pathname).toBe(
      `/v2/positions/pool/${MAINNET}/${POOL}/${WALLET}/charts`,
    );
    expect(requested().searchParams.get("metrics")).toBe("apy");
    expect(requested().searchParams.get("range")).toBe("1m");
  });

  it("asks for several metrics of one strategy position in one request", async () => {
    answerWithBundle(["totalValueUnderlying", "borrowApyAvg7d"], "1y");

    await positions().getCharts(
      strategy,
      ["totalValueUnderlying", "borrowApyAvg7d"],
      "1y",
    );

    expect(requested().pathname).toBe(
      `/v2/positions/strategy/${MAINNET}/${CREDIT_ACCOUNT}/charts`,
    );
    expect(requested().searchParams.get("metrics")).toBe(
      "totalValueUnderlying,borrowApyAvg7d",
    );
    expect(requested().searchParams.get("range")).toBe("1y");
  });

  it("rejects a bundle that answers a question it was not asked", async () => {
    answerWithBundle(["borrowApy"]);

    await expect(
      positions().getCharts(strategy, ["totalValueUnderlying"], "1m"),
    ).rejects.toThrow(/read model/);
  });
});
