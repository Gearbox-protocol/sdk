import { type Address, getAddress } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";
import type {
  AnalyticsContractOption,
  AnalyticsPositionFilterOptions,
} from "../../model/analytics.js";
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
const WRAPPER = "0x4444444444444444444444444444444444444444" as Address;
const RE7 = "0x5555555555555555555555555555555555555555" as Address;
const CHAOS = "0x6666666666666666666666666666666666666666" as Address;

const USDC = {
  chainId: MAINNET,
  address: TOKEN,
  name: "USD Coin",
  symbol: "USDC",
  decimals: 6,
  assetType: "Stable",
} as const;
const UNDERLYING = { ...USDC, wrappedAddress: null };
const CURATOR = {
  address: RE7,
  name: "Re7",
  url: "https://re7.capital",
} as const;

const EMPTY: AnalyticsPositionFilterOptions = {
  pools: [],
  creditManagers: [],
  assets: [],
  curators: [],
};

const OPTIONS: AnalyticsPositionFilterOptions = {
  pools: [
    {
      chainId: MAINNET,
      address: POOL,
      name: "Mainnet USDC Pool",
      underlyingToken: UNDERLYING,
      curator: CURATOR,
    },
    {
      chainId: PLASMA,
      address: POOL,
      name: "Plasma USDC Pool",
      underlyingToken: {
        ...UNDERLYING,
        chainId: PLASMA,
        wrappedAddress: WRAPPER,
      },
      curator: { address: CHAOS, url: null },
    },
  ],
  creditManagers: [
    {
      chainId: MAINNET,
      address: CREDIT_MANAGER,
      name: "wstETH / USDC",
      underlyingToken: UNDERLYING,
      curator: CURATOR,
    },
  ],
  assets: [USDC],
  curators: [
    { name: "Chaos Labs", url: null },
    { name: "Re7", url: "https://re7.capital" },
  ],
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

  it("returns named choices with market details, token metadata and curators", async () => {
    respondWith(OPTIONS, [
      {
        chainId: MAINNET,
        status: "success",
        blockNumber: 100,
        timestamp: 1_700_000_000,
      },
    ]);

    const { data, meta } = await positions().filterOptions();

    const contract = (option: AnalyticsContractOption) => ({
      ...option,
      address: getAddress(option.address),
      underlyingToken: {
        ...option.underlyingToken,
        address: getAddress(option.underlyingToken.address),
        wrappedAddress:
          option.underlyingToken.wrappedAddress &&
          getAddress(option.underlyingToken.wrappedAddress),
      },
      curator: {
        ...option.curator,
        address: getAddress(option.curator.address),
      },
    });
    expect(data).toEqual({
      pools: OPTIONS.pools.map(contract),
      creditManagers: OPTIONS.creditManagers.map(contract),
      assets: OPTIONS.assets.map(asset => ({
        ...asset,
        address: getAddress(asset.address),
      })),
      curators: OPTIONS.curators,
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
      value: [{ ...OPTIONS.pools[0], address: "invalid" }],
    },
    {
      field: "pools",
      value: [{ ...OPTIONS.pools[0], underlyingToken: USDC }],
    },
    {
      field: "creditManagers",
      value: [{ ...OPTIONS.creditManagers[0], chainId: 0 }],
    },
    {
      field: "creditManagers",
      value: [
        {
          ...OPTIONS.creditManagers[0],
          curator: { ...CURATOR, name: "Unknown curator" },
        },
      ],
    },
    { field: "assets", value: [{ ...OPTIONS.assets[0], decimals: -1 }] },
    { field: "curators", value: ["Re7"] },
    {
      field: "curators",
      value: [{ ...OPTIONS.curators[0], name: "Unknown curator" }],
    },
    {
      field: "curators",
      value: [{ ...OPTIONS.curators[0], url: undefined }],
    },
  ])("rejects invalid $field choices", async ({ field, value }) => {
    respondWith({ ...OPTIONS, [field]: value });

    await expect(positions().filterOptions()).rejects.toBeInstanceOf(
      OffchainValidationError,
    );
  });
});
