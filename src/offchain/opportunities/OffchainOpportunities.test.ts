import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chains } from "../../sdk/index.js";
import { OffchainOpportunities } from "./OffchainOpportunities.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

let fetchMock: MockInstance<typeof fetch>;

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ data: [], meta: { chains: [] } }), {
      headers: { "content-type": "application/json" },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function opportunities(): OffchainOpportunities {
  return new OffchainOpportunities({
    baseUrl: "https://api.gearbox.fi",
    chainIds: [MAINNET, PLASMA],
  });
}

/**
 * Query the one request of a test was issued with.
 **/
function requested(): URLSearchParams {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams;
}

/**
 * Answers the next read with a bundle the model accepts, so a chart test can
 * assert on the request it issued rather than on the decode.
 **/
function answerWithBundle(metrics: string[], range = "1m"): void {
  const timestamps = [1_719_792_000, 1_719_795_600];
  fetchMock.mockResolvedValue(
    new Response(
      JSON.stringify({
        data: {
          window: { range, from: timestamps[0], to: timestamps[1] },
          timestamps,
          sampling: { kind: "grid", intervalSeconds: 3_600 },
          series: Object.fromEntries(
            metrics.map(metric => [
              metric,
              { status: "ok", unit: "bps", values: [512, 530] },
            ]),
          ),
        },
        meta: { chains: [] },
      }),
      { headers: { "content-type": "application/json" } },
    ),
  );
}

/** Path of the one request of a test. **/
function requestedPath(): string {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0])).pathname;
}

describe("a chart request names its subject, its metrics and its window", () => {
  const pool = {
    kind: "pool",
    chainId: MAINNET,
    pool: "0xda00000000000000000000000000000000000000",
  } as const;
  const strategy = {
    kind: "strategy",
    chainId: MAINNET,
    creditManager: "0x3eb9000000000000000000000000000000000000",
  } as const;

  it("names one metric in the query, not in the path", async () => {
    // one metric is a bundle of one, not a route of its own
    answerWithBundle(["depositApy"]);

    await opportunities().getCharts(pool, ["depositApy"], "1m");

    expect(requestedPath()).toBe(
      `/v2/opportunities/pools/${MAINNET}/${pool.pool}/charts`,
    );
    expect(requested().get("metrics")).toBe("depositApy");
    expect(requested().get("range")).toBe("1m");
  });

  it("asks for several metrics of one subject in one request", async () => {
    // one read, one grid: the alignment the bundle promises is only meaningful
    // if the series were produced together
    answerWithBundle(["quotaRate", "borrowApyAvg7d"], "1y");

    await opportunities().getCharts(
      strategy,
      ["quotaRate", "borrowApyAvg7d"],
      "1y",
    );

    expect(requestedPath()).toBe(
      `/v2/opportunities/strategies/${MAINNET}/${strategy.creditManager}/charts`,
    );
    expect(requested().get("metrics")).toBe("quotaRate,borrowApyAvg7d");
    expect(requested().get("range")).toBe("1y");
  });

  it("rejects a bundle that answers a question it was not asked", async () => {
    answerWithBundle(["borrowApy"]);

    await expect(
      opportunities().getCharts(pool, ["depositApy"], "1m"),
    ).rejects.toThrow(/read model/);
  });
});

describe("every list request names the chains the client covers", () => {
  it("names all of them when the caller narrows nothing", async () => {
    await opportunities().list();

    expect(requested().get("chainIds")).toBe(`${MAINNET},${PLASMA}`);
  });

  it("narrows to the chains the filter names, alongside its other conditions", async () => {
    await opportunities().list({ chainIds: [PLASMA], kind: "pool" });

    const query = requested();
    expect(query.get("chainIds")).toBe(`${PLASMA}`);
    expect(query.get("kind")).toBe("pool");
  });

  it("drops a chain the client does not cover", async () => {
    // a filter narrows a read, it does not extend it
    await opportunities().list({ chainIds: [PLASMA, 424_242] });

    expect(requested().get("chainIds")).toBe(`${PLASMA}`);
  });
});
