import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chains } from "../../onchain/index.js";
import { GearboxSDK } from "../../sdk/GearboxSDK.js";
import { GearboxAPI } from "../GearboxAPI.js";
import { OffchainAnalytics } from "./OffchainAnalytics.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;

/** One `1d` grid: the step is 300 s, so three points span ten minutes. */
const STEP = 300;
const TO = 1_700_006_400;
const FROM = TO - 2 * STEP;

function bundle(values: Array<number | null>): string {
  return JSON.stringify({
    data: {
      window: { range: "1d", from: FROM, to: TO },
      sampling: { kind: "grid", intervalSeconds: STEP },
      timestamps: [FROM, FROM + STEP, TO],
      series: { tvlUsd: { status: "ok", unit: "usd", values } },
    },
    meta: { chains: [] },
  });
}

let fetchMock: MockInstance<typeof fetch>;

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(bundle([1, 2, 3]), {
      headers: { "content-type": "application/json" },
    }),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

function analytics(): OffchainAnalytics {
  return new OffchainAnalytics({
    baseUrl: "https://api.gearbox.fi",
    chainIds: [MAINNET, PLASMA],
  });
}

function requested(): URL {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0]));
}

describe("protocol-wide analytics charts", () => {
  it("is exposed by both the raw backend client and GearboxSDK", async () => {
    const api = new GearboxAPI({
      baseUrl: "https://api.gearbox.fi",
      chainIds: [MAINNET],
    });
    const sdk = new GearboxSDK({
      mode: "offchain",
      networks: ["Mainnet"],
      offchain: api,
    });

    await sdk.analytics.charts(["tvlUsd"], "1d");

    expect(requested().pathname).toBe("/v2/analytics/charts");
  });

  it("is absent from an onchain-only SDK", () => {
    const sdk = new GearboxSDK({
      mode: "onchain",
      networks: [],
      onchain: { chains: {} },
    });

    expect(sdk.analytics).toBeUndefined();
  });

  it("uses the analytics route and always scopes it to the client's chains", async () => {
    await analytics().getCharts(["tvlUsd"], "1d");

    expect(requested().pathname).toBe("/v2/analytics/charts");
    expect(Object.fromEntries(requested().searchParams)).toEqual({
      metrics: "tvlUsd",
      range: "1d",
      chainIds: `${MAINNET},${PLASMA}`,
    });
  });

  it("does not let a filter extend the client's chain scope", async () => {
    await analytics().getCharts(["tvlUsd"], "1d", {
      chainIds: [PLASMA, 424_242],
    });

    expect(requested().searchParams.get("chainIds")).toBe(`${PLASMA}`);
  });

  it("returns the series keyed by the metric it asked for", async () => {
    const { data } = await analytics().getCharts(["tvlUsd"], "1d");

    expect(data.timestamps).toEqual([FROM, FROM + STEP, TO]);
    expect(data.series.tvlUsd).toEqual({
      status: "ok",
      unit: "usd",
      values: [1, 2, 3],
    });
  });

  it("keeps a gap a gap rather than reading it as a zero", async () => {
    fetchMock.mockResolvedValue(
      new Response(bundle([null, 2, 3]), {
        headers: { "content-type": "application/json" },
      }),
    );

    const { data } = await analytics().getCharts(["tvlUsd"], "1d");

    expect(
      data.series.tvlUsd.status === "ok" && data.series.tvlUsd.values[0],
    ).toBeNull();
  });

  it("rejects a response that quotes TVL in anything but dollars", async () => {
    fetchMock.mockResolvedValue(
      new Response(bundle([1, 2, 3]).replace('"unit":"usd"', '"unit":"bps"'), {
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(analytics().getCharts(["tvlUsd"], "1d")).rejects.toThrow();
  });

  it("rejects a response that answers a different range", async () => {
    await expect(analytics().getCharts(["tvlUsd"], "1w")).rejects.toThrow();
  });
});
