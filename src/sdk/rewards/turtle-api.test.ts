import type { Address } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TurtleRequestFailedError } from "./errors.js";
import type { TurtleWalletStream } from "./turtle-api.js";
import { fetchTurtleWalletRewards } from "./turtle-api.js";

const USER: Address = "0x1234567890123456789012345678901234567890";
const GEARBOX = "d171ba3d-ff89-4e6c-8f13-d94840b06edd";
const TOKEN: Address = "0x00000000000000000000000000000000000000bb";

const mockedFetch = vi.fn();

function answers(body: unknown): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function walletStream(
  streamId: string,
  stream: Partial<TurtleWalletStream["stream"]> = {},
): TurtleWalletStream {
  return {
    streamId,
    snapshots: [],
    stream: {
      orgId: GEARBOX,
      contractAddress: "0x00000000000000000000000000000000000000aa",
      customArgs: {},
      point: null,
      rewardToken: { address: TOKEN, symbol: "T", name: "T", decimals: 18 },
      lastSnapshot: null,
      ...stream,
    },
  };
}

describe("fetchTurtleWalletRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockedFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the api key and skips proofs when no token stream is left", async () => {
    mockedFetch.mockResolvedValueOnce(answers({ streams: [] }));

    const result = await fetchTurtleWalletRewards(USER, "k");

    expect(result).toEqual({ streams: [], proofs: [] });
    expect(mockedFetch).toHaveBeenCalledOnce();
    expect(mockedFetch).toHaveBeenCalledWith(
      `https://earn.turtle.xyz/v2/streams/wallets/${USER}`,
      { headers: { "X-API-Key": "k" }, signal: expect.anything() },
    );
  });

  it("keeps Gearbox's streams and asks proofs for its token streams only", async () => {
    const token = walletStream("a");
    const points = walletStream("b", {
      contractAddress: null,
      rewardToken: null,
      point: { id: "p", name: "Points", decimals: 18 },
    });
    const foreign = walletStream("c", { orgId: "other" });
    mockedFetch
      .mockResolvedValueOnce(answers({ streams: [token, points, foreign] }))
      .mockResolvedValueOnce(answers({ proofs: [] }));

    const result = await fetchTurtleWalletRewards(USER, "k");

    expect(result.streams).toEqual([token, points]);
    expect(mockedFetch).toHaveBeenLastCalledWith(
      `https://earn.turtle.xyz/v2/streams/merkle_proofs?wallet=${USER}&streamIds=a`,
      expect.anything(),
    );
  });

  it("rejects on a non-2xx", async () => {
    mockedFetch.mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    const request = fetchTurtleWalletRewards(USER, "k");

    await expect(request).rejects.toBeInstanceOf(TurtleRequestFailedError);
    await expect(request).rejects.toThrow(/answered 401/);
  });
});
