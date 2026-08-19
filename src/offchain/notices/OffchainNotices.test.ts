import type { Address } from "viem";
import type { MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PoolOpportunity, StrategyPosition } from "../../model/index.js";
import { OffchainNotices } from "./OffchainNotices.js";

const MAINNET = 1;
const POOL = "0x2222222222222222222222222222222222222222" as Address;
const CREDIT_ACCOUNT = "0x5555555555555555555555555555555555555555" as Address;

let fetchMock: MockInstance<typeof fetch>;

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
afterEach(() => vi.restoreAllMocks());

function notices(): OffchainNotices {
  return new OffchainNotices({
    baseUrl: "https://api.gearbox.fi",
    chainIds: [MAINNET],
  });
}

function requested(): URL {
  expect(fetchMock).toHaveBeenCalledOnce();
  return new URL(String(fetchMock.mock.calls[0]?.[0]));
}

describe("notices are read per subject", () => {
  it("a pool opportunity is addressed by chain and pool", async () => {
    await notices().list({
      kind: "pool",
      chainId: MAINNET,
      pool: POOL,
    } as PoolOpportunity);

    expect(requested().pathname).toBe(`/v2/notices/pool/${MAINNET}/${POOL}`);
  });

  it("a strategy position is addressed by chain and credit account, and decodes", async () => {
    respondWith({
      data: [
        { kind: "expired", message: "This account has expired." },
        {
          kind: "externalRewards",
          message: "Rewards are paid by the protocol.",
          token: {
            chainId: MAINNET,
            address: POOL,
            symbol: "GEAR",
            name: "Gearbox",
            decimals: 18,
          },
        },
      ],
      meta: { chains: [] },
    });

    const { data } = await notices().list({
      kind: "strategy",
      chainId: MAINNET,
      creditAccount: CREDIT_ACCOUNT,
    } as StrategyPosition);

    expect(requested().pathname).toBe(
      `/v2/notices/strategy/${MAINNET}/${CREDIT_ACCOUNT}`,
    );
    expect(data.map(n => n.kind)).toEqual(["expired", "externalRewards"]);
    expect(data[1]?.token?.symbol).toBe("GEAR");
  });
});

describe("the notice kind is a closed union", () => {
  it("rejects a kind the model does not know", async () => {
    respondWith({
      data: [{ kind: "promo", message: "Buy now" }],
      meta: { chains: [] },
    });
    await expect(
      notices().list({
        kind: "pool",
        chainId: MAINNET,
        pool: POOL,
      } as PoolOpportunity),
    ).rejects.toThrow(/does not match the read model/);
  });
});
