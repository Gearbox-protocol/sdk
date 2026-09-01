import type { Address } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chains } from "../../onchain/index.js";
import { GearboxSDK } from "../../sdk/GearboxSDK.js";
import { GearboxAPI } from "../GearboxAPI.js";
import { OffchainAnalyticsPositions } from "./OffchainAnalyticsPositions.js";

const MAINNET = chains.Mainnet.id;
const PLASMA = chains.Plasma.id;
const BORROWER = "0x1111111111111111111111111111111111111111" as Address;

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
    await positions().list({
      borrower: BORROWER,
      kind: "strategy",
      isZeroDebt: false,
      chainIds: [PLASMA],
      underlyingType: "Stable",
      sortBy: "healthFactor",
      sortDirection: "asc",
      offset: 50,
      limit: 50,
    });

    expect(Object.fromEntries(requested().searchParams)).toEqual({
      borrower: BORROWER,
      kind: "strategy",
      isZeroDebt: "false",
      chainIds: `${PLASMA}`,
      underlyingType: "Stable",
      sortBy: "healthFactor",
      sortDirection: "asc",
      offset: "50",
      limit: "50",
    });
  });

  it("does not let a query extend the client's chain scope", async () => {
    await positions().list({ chainIds: [PLASMA, 424_242] });

    expect(requested().searchParams.get("chainIds")).toBe(`${PLASMA}`);
  });

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
