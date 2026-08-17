import type { Address } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chains } from "../../sdk/index.js";
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
          netValue: { value: "1000000", valueUsd: 1, token: underlying },
          apy: { organicApy: 500 },
        },
        {
          kind: "strategy",
          name: "USDC Strategy",
          chainId: MAINNET,
          creditManager: CREDIT_MANAGER,
          creditAccount: CREDIT_ACCOUNT,
          targetCollateral: null,
          leverage: 3.5,
          borrowApy: 520,
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
    expect(pool).toMatchObject({ kind: "pool", name: "USDC Pool" });
    expect(pool?.kind === "pool" && pool.netValue.value).toBe(1_000_000n);
    expect(strategy?.kind === "strategy" && strategy.totalDebt.value).toBe(
      7_000_000n,
    );
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
