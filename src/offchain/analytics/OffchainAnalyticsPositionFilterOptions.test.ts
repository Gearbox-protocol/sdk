import { type Address, getAddress } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";
import type { AnalyticsPositionFilterOptions } from "../../model/analytics.js";
import { analyticsPositionFilterOptionsQuerySchema } from "../../model/analytics.schema.js";
import { chains } from "../../onchain/index.js";
import { GearboxSDK } from "../../sdk/GearboxSDK.js";
import { OffchainValidationError } from "../errors/index.js";
import { GearboxAPI } from "../GearboxAPI.js";
import { OffchainAnalyticsPositions } from "./OffchainAnalyticsPositions.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;
const POOL = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
const CREDIT_MANAGER = "0x2222222222222222222222222222222222222222" as Address;
const TOKEN = "0x3333333333333333333333333333333333333333" as Address;

const EMPTY: AnalyticsPositionFilterOptions = {
  pools: [],
  creditManagers: [],
  assets: [],
  curators: [],
};

const OPTIONS: AnalyticsPositionFilterOptions = {
  pools: [
    { chainId: MAINNET, address: POOL, name: "Mainnet USDC Pool" },
    { chainId: PLASMA, address: POOL, name: "Plasma USDC Pool" },
  ],
  creditManagers: [
    { chainId: MAINNET, address: CREDIT_MANAGER, name: "wstETH / USDC" },
  ],
  assets: [
    {
      chainId: MAINNET,
      address: TOKEN,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      assetType: "Stable",
    },
  ],
  curators: ["Re7", "Chaos Labs"],
};

let fetchMock: MockInstance<typeof fetch>;

function respondWith(data: unknown, chainMeta: unknown[] = []): void {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ data, meta: { chains: chainMeta } }), {
      headers: { "content-type": "application/json" },
    }),
  );
}

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, "fetch");
  respondWith(EMPTY);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function positions(): OffchainAnalyticsPositions {
  return new OffchainAnalyticsPositions({
    baseUrl: "https://api.gearbox.fi",
    chainIds: [MAINNET, PLASMA],
  });
}

function requested(): URL {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0]));
}

describe("analytics position filter options", () => {
  it("is exposed through GearboxSDK and the raw backend client", async () => {
    const api = new GearboxAPI({
      baseUrl: "https://api.gearbox.fi",
      chainIds: [MAINNET],
    });
    const sdk = new GearboxSDK({
      mode: "offchain",
      networks: ["Mainnet"],
      offchain: api,
    });

    expect(sdk.analytics.positions).toBe(api.analytics.positions);
    await expect(sdk.analytics.positions.filterOptions()).resolves.toEqual({
      data: EMPTY,
      meta: { chains: [] },
    });
    expect(requested().pathname).toBe("/v2/analytics/positions/filter-options");
  });

  it("requests choices for every configured chain without pagination", async () => {
    await positions().filterOptions();

    const url = requested();
    expect(url.pathname).toBe("/v2/analytics/positions/filter-options");
    const params = Object.fromEntries(url.searchParams);
    expect(params).toEqual({ chainIds: `${MAINNET},${PLASMA}` });
    expect(z.decode(analyticsPositionFilterOptionsQuerySchema, params)).toEqual(
      {
        chainIds: [MAINNET, PLASMA],
      },
    );
  });

  it("narrows the requested chains without extending the client's scope", async () => {
    await positions().filterOptions({ chainIds: [PLASMA, 424_242] });

    expect(Object.fromEntries(requested().searchParams)).toEqual({
      chainIds: `${PLASMA}`,
    });
  });

  it("preserves an empty chain selection", async () => {
    await positions().filterOptions({ chainIds: [] });

    const params = Object.fromEntries(requested().searchParams);
    expect(params).toEqual({ chainIds: "" });
    expect(z.decode(analyticsPositionFilterOptionsQuerySchema, params)).toEqual(
      {
        chainIds: [],
      },
    );
  });

  it("returns named choices, token metadata and curator names with chain identities", async () => {
    respondWith(OPTIONS, [
      {
        chainId: MAINNET,
        status: "success",
        blockNumber: 100,
        timestamp: 1_700_000_000,
      },
    ]);

    const { data, meta } = await positions().filterOptions();

    expect(data).toEqual({
      ...OPTIONS,
      pools: OPTIONS.pools.map(pool => ({
        ...pool,
        address: getAddress(pool.address),
      })),
    });
    expect(data.pools.map(pool => pool.chainId)).toEqual([MAINNET, PLASMA]);
    expect(meta.chains[0]).toMatchObject({
      chainId: MAINNET,
      status: "success",
      source: "offchain",
    });
  });

  it.each([
    {
      field: "pools",
      value: [{ chainId: MAINNET, address: "invalid", name: "USDC Pool" }],
    },
    {
      field: "creditManagers",
      value: [{ chainId: 0, address: CREDIT_MANAGER, name: "USDC Strategy" }],
    },
    { field: "assets", value: [{ ...OPTIONS.assets[0], decimals: -1 }] },
    { field: "curators", value: ["Unknown curator"] },
  ])("rejects invalid $field choices", async ({ field, value }) => {
    respondWith({ ...OPTIONS, [field]: value });

    await expect(positions().filterOptions()).rejects.toBeInstanceOf(
      OffchainValidationError,
    );
  });
});
