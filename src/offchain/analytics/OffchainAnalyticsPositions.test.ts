import type { Address } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";
import type { AnalyticsPositionListOptions } from "../../model/analytics.js";
import { analyticsPositionListQuerySchema } from "../../model/analytics.schema.js";
import { chains } from "../../onchain/index.js";
import { GearboxSDK } from "../../sdk/GearboxSDK.js";
import { GearboxAPI } from "../GearboxAPI.js";
import { OffchainAnalyticsPositions } from "./OffchainAnalyticsPositions.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;
const BORROWER = "0x1111111111111111111111111111111111111111" as Address;
const POOL = "0x2222222222222222222222222222222222222222" as Address;
const CREDIT_MANAGER = "0x3333333333333333333333333333333333333333" as Address;
const OTHER_POOL = "0x4444444444444444444444444444444444444444" as Address;
const OTHER_CREDIT_MANAGER =
  "0x5555555555555555555555555555555555555555" as Address;
const ASSET = "0x6666666666666666666666666666666666666666" as Address;
const OTHER_ASSET = "0x7777777777777777777777777777777777777777" as Address;

let fetchMock: MockInstance<typeof fetch>;

beforeEach(() => {
  fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(
      JSON.stringify({
        data: { items: [], total: 0, offset: 0, limit: 25 },
        meta: { chains: [] },
      }),
      { headers: { "content-type": "application/json" } },
    ),
  );
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

describe("protocol-wide analytics positions", () => {
  it("is exposed by both the raw backend client and GearboxSDK", () => {
    const api = new GearboxAPI({
      baseUrl: "https://api.gearbox.fi",
      chainIds: [MAINNET],
    });
    const sdk = new GearboxSDK({
      mode: "offchain",
      networks: ["Mainnet"],
      offchain: api,
    });

    expect(api.analytics.positions).toBeInstanceOf(OffchainAnalyticsPositions);
    expect(sdk.analytics.positions).toBe(api.analytics.positions);
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
    await positions().list();

    expect(requested().pathname).toBe("/v2/analytics/positions");
    expect(requested().searchParams.get("chainIds")).toBe(
      `${MAINNET},${PLASMA}`,
    );
  });

  it("encodes filtering, sorting and pagination in one request", async () => {
    const options: AnalyticsPositionListOptions = {
      borrower: BORROWER,
      pool: { chainId: PLASMA, address: POOL },
      creditManager: { chainId: PLASMA, address: CREDIT_MANAGER },
      asset: { chainId: PLASMA, address: ASSET },
      curator: "Re7",
      kind: "strategy",
      isZeroDebt: false,
      chainIds: [PLASMA],
      underlyingType: "Stable",
      sortBy: "healthFactor",
      sortDirection: "asc",
      offset: 50,
      limit: 50,
    };
    await positions().list(options);

    const params = Object.fromEntries(requested().searchParams);
    expect(params).toEqual({
      borrower: BORROWER,
      pool: `${PLASMA}:${POOL}`,
      creditManager: `${PLASMA}:${CREDIT_MANAGER}`,
      asset: `${PLASMA}:${ASSET}`,
      curator: "Re7",
      kind: "strategy",
      isZeroDebt: "false",
      chainIds: `${PLASMA}`,
      underlyingType: "Stable",
      sortBy: "healthFactor",
      sortDirection: "asc",
      offset: "50",
      limit: "50",
    });
    expect(z.decode(analyticsPositionListQuerySchema, params)).toEqual(options);
  });

  it("encodes multiple pool, credit manager, asset and curator choices", async () => {
    const options = {
      pool: [
        { chainId: MAINNET, address: POOL },
        { chainId: PLASMA, address: OTHER_POOL },
      ],
      creditManager: [
        { chainId: MAINNET, address: CREDIT_MANAGER },
        { chainId: PLASMA, address: OTHER_CREDIT_MANAGER },
      ],
      asset: [
        { chainId: MAINNET, address: ASSET },
        { chainId: PLASMA, address: OTHER_ASSET },
      ],
      curator: ["Re7", "Chaos Labs"],
    } as const;
    await positions().list(options);

    const params = Object.fromEntries(requested().searchParams);
    expect(params).toEqual({
      pool: `${MAINNET}:${POOL},${PLASMA}:${OTHER_POOL}`,
      creditManager: `${MAINNET}:${CREDIT_MANAGER},${PLASMA}:${OTHER_CREDIT_MANAGER}`,
      asset: `${MAINNET}:${ASSET},${PLASMA}:${OTHER_ASSET}`,
      curator: "Re7,Chaos Labs",
      chainIds: `${MAINNET},${PLASMA}`,
    });
    expect(z.decode(analyticsPositionListQuerySchema, params)).toEqual({
      ...options,
      chainIds: [MAINNET, PLASMA],
    });
  });

  it("encodes single-entry arrays like scalar filters", async () => {
    await positions().list({
      pool: [{ chainId: MAINNET, address: POOL }],
      creditManager: [{ chainId: MAINNET, address: CREDIT_MANAGER }],
      asset: [{ chainId: MAINNET, address: ASSET }],
      curator: ["Re7"],
    });

    const params = Object.fromEntries(requested().searchParams);
    expect(params).toEqual({
      pool: `${MAINNET}:${POOL}`,
      creditManager: `${MAINNET}:${CREDIT_MANAGER}`,
      asset: `${MAINNET}:${ASSET}`,
      curator: "Re7",
      chainIds: `${MAINNET},${PLASMA}`,
    });
    expect(z.decode(analyticsPositionListQuerySchema, params)).toEqual({
      pool: { chainId: MAINNET, address: POOL },
      creditManager: { chainId: MAINNET, address: CREDIT_MANAGER },
      asset: { chainId: MAINNET, address: ASSET },
      curator: "Re7",
      chainIds: [MAINNET, PLASMA],
    });
  });

  it.each(["pool", "creditManager", "asset"] as const)(
    "keeps the same %s address distinct on different chains",
    async field => {
      const refs = [
        { chainId: MAINNET, address: POOL },
        { chainId: PLASMA, address: POOL },
      ];
      await positions().list({ [field]: refs });

      const params = Object.fromEntries(requested().searchParams);
      expect(params).toEqual({
        [field]: `${MAINNET}:${POOL},${PLASMA}:${POOL}`,
        chainIds: `${MAINNET},${PLASMA}`,
      });
      expect(z.decode(analyticsPositionListQuerySchema, params)).toEqual({
        [field]: refs,
        chainIds: [MAINNET, PLASMA],
      });
    },
  );

  it.each(["pool", "creditManager", "asset"] as const)(
    "requires a chain ID with each %s address",
    async field => {
      await expect(
        positions().list({
          [field]: POOL,
        } as unknown as AnalyticsPositionListOptions),
      ).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(() =>
        z.decode(analyticsPositionListQuerySchema, { [field]: POOL }),
      ).toThrow();
    },
  );

  it.each([0, -1, 1.5])(
    "rejects the invalid contract chain ID %s",
    async chainId => {
      await expect(
        positions().list({ pool: { chainId, address: POOL } }),
      ).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(() =>
        z.decode(analyticsPositionListQuerySchema, {
          pool: `${chainId}:${POOL}`,
        }),
      ).toThrow();
    },
  );

  it.each(["pool", "creditManager", "asset", "curator"] as const)(
    "preserves an empty %s selection rather than omitting it",
    async field => {
      await positions().list({ [field]: [] });

      const params = Object.fromEntries(requested().searchParams);
      expect(params).toEqual({
        [field]: "",
        chainIds: `${MAINNET},${PLASMA}`,
      });
      expect(z.decode(analyticsPositionListQuerySchema, params)).toEqual({
        [field]: [],
        chainIds: [MAINNET, PLASMA],
      });
    },
  );

  it("omits an unrestricted curator filter", async () => {
    await positions().list({ curator: "all" });

    expect(Object.fromEntries(requested().searchParams)).toEqual({
      chainIds: `${MAINNET},${PLASMA}`,
    });
  });

  it.each([
    {
      field: "pool",
      valid: { chainId: MAINNET, address: POOL },
      invalid: { chainId: MAINNET, address: "invalid" },
      wire: `${MAINNET}:${POOL}`,
    },
    {
      field: "creditManager",
      valid: { chainId: MAINNET, address: CREDIT_MANAGER },
      invalid: { chainId: MAINNET, address: "invalid" },
      wire: `${MAINNET}:${CREDIT_MANAGER}`,
    },
    {
      field: "asset",
      valid: { chainId: MAINNET, address: ASSET },
      invalid: { chainId: MAINNET, address: "invalid" },
      wire: `${MAINNET}:${ASSET}`,
    },
    { field: "curator", valid: "Re7", invalid: "invalid", wire: "Re7" },
  ] as const)(
    "rejects invalid choices in $field lists",
    async ({ field, valid, invalid, wire }) => {
      await expect(
        positions().list({
          [field]: [valid, invalid],
        } as AnalyticsPositionListOptions),
      ).rejects.toThrow();
      expect(fetchMock).not.toHaveBeenCalled();
      expect(() =>
        z.decode(analyticsPositionListQuerySchema, {
          [field]: `${wire},invalid`,
        }),
      ).toThrow();
    },
  );

  it("does not let a query extend the client's chain scope", async () => {
    await positions().list({ chainIds: [PLASMA, 424_242] });

    expect(requested().searchParams.get("chainIds")).toBe(`${PLASMA}`);
  });

  it.each(["pool", "creditManager", "asset"] as const)(
    "does not let %s references extend the client's or query's chain scope",
    async field => {
      await positions().list({
        [field]: [
          { chainId: MAINNET, address: POOL },
          { chainId: PLASMA, address: POOL },
          { chainId: 424_242, address: POOL },
        ],
        chainIds: [PLASMA, 424_242],
      });

      const params = Object.fromEntries(requested().searchParams);
      expect(params).toEqual({
        [field]: `${MAINNET}:${POOL},${PLASMA}:${POOL},424242:${POOL}`,
        chainIds: `${PLASMA}`,
      });
    },
  );

  it("decodes position amounts and returns the page metadata", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            items: [
              {
                kind: "pool",
                borrower: BORROWER,
                name: "USDC Pool",
                chainId: MAINNET,
                pool: "0x2222222222222222222222222222222222222222",
                underlyingToken: {
                  chainId: MAINNET,
                  address: "0x3333333333333333333333333333333333333333",
                  symbol: "USDC",
                  name: "USD Coin",
                  decimals: 6,
                  assetType: "Stable",
                  wrappedAddress: null,
                },
                netValue: {
                  value: "1000000",
                  valueUsd: 1,
                  token: {
                    chainId: MAINNET,
                    address: "0x3333333333333333333333333333333333333333",
                    symbol: "USDC",
                    name: "USD Coin",
                    decimals: 6,
                    assetType: "Stable",
                  },
                },
                apy: { organicApy: 500 },
              },
            ],
            total: 41,
            offset: 20,
            limit: 20,
          },
          meta: { chains: [] },
        }),
        { headers: { "content-type": "application/json" } },
      ),
    );

    const { data } = await positions().list({ offset: 20, limit: 20 });

    expect(data).toMatchObject({ total: 41, offset: 20, limit: 20 });
    expect(data.items[0]?.kind === "pool" && data.items[0].netValue.value).toBe(
      1_000_000n,
    );
  });
});
