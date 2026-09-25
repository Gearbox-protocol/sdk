import type { Address } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MerklRequestFailedError } from "./errors.js";
import { fetchMerklUserRewards, MERKL_API_KEY_HEADER } from "./merkl-api.js";

const USER: Address = "0x1234567890123456789012345678901234567890";
const URL = `https://api.merkl.xyz/v4/users/${USER}/rewards?chainId=1`;

const mockedFetch = vi.fn();

function answers(body: unknown = []): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

describe("fetchMerklUserRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockedFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks Merkl's API with no headers when there is no key", async () => {
    mockedFetch.mockResolvedValueOnce(answers());

    await fetchMerklUserRewards({ chainId: 1, user: USER });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(URL, {
      headers: undefined,
      signal: expect.any(AbortSignal),
    });
  });

  it("sends the api key as a header", async () => {
    mockedFetch.mockResolvedValueOnce(answers());

    await fetchMerklUserRewards({ chainId: 1, user: USER, apiKey: "k" });

    expect(mockedFetch).toHaveBeenCalledWith(URL, {
      headers: { [MERKL_API_KEY_HEADER]: "k" },
      signal: expect.any(AbortSignal),
    });
  });

  it("returns what Merkl answered", async () => {
    const body = [
      { chain: { id: 1, name: "Ethereum", icon: "" }, rewards: [] },
    ];
    mockedFetch.mockResolvedValueOnce(answers(body));

    await expect(
      fetchMerklUserRewards({ chainId: 1, user: USER }),
    ).resolves.toEqual(body);
  });

  it.each([
    [
      "rejects",
      () => mockedFetch.mockRejectedValueOnce(new Error("offline")),
      /offline/,
    ],
    [
      "answers a non-2xx",
      () =>
        mockedFetch.mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({}),
        } as Response),
      /answered 503/,
    ],
    [
      "sends a body that is not JSON",
      () =>
        mockedFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError("Unexpected token");
          },
        } as unknown as Response),
      /Unexpected token/,
    ],
    [
      "times out",
      () =>
        mockedFetch.mockRejectedValueOnce(
          Object.assign(new Error("signal timed out"), {
            name: "TimeoutError",
          }),
        ),
      /timed out/,
    ],
  ])("fails for the chain when Merkl %s", async (_, arrange, message) => {
    arrange();

    const request = fetchMerklUserRewards({ chainId: 1, user: USER });

    await expect(request).rejects.toBeInstanceOf(MerklRequestFailedError);
    await expect(request).rejects.toMatchObject({ chainId: 1 });
    await expect(request).rejects.toThrow(message);
  });
});
