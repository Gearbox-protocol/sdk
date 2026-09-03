import type { Address } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MerklRequestFailedError } from "./errors.js";
import {
  fetchMerklUserRewards,
  MERKL_API_KEY_HEADER,
  MERKL_DOMAINS,
} from "./merkl-api.js";

const USER: Address = "0x1234567890123456789012345678901234567890";
const PATH = `/v4/users/${USER}/rewards?chainId=1`;
// Spelled out rather than built from MERKL_DOMAINS: asserting against the
// constant under test would pass whatever the constant said.
const PRIMARY = `https://api.merkl.xyz${PATH}`;
const MIRROR = `https://api-merkl.angle.money${PATH}`;

const mockedFetch = vi.fn();

function answers(body: unknown = []): Response {
  return { ok: true, status: 200, json: async () => body } as Response;
}

function status(code: number): Response {
  return { ok: false, status: code, json: async () => ({}) } as Response;
}

describe("fetchMerklUserRewards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockedFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("asks the primary domain, with no headers and no key", async () => {
    mockedFetch.mockResolvedValueOnce(answers());

    await fetchMerklUserRewards({ chainId: 1, user: USER });

    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(mockedFetch).toHaveBeenCalledWith(PRIMARY, {
      headers: undefined,
      signal: expect.anything(),
    });
  });

  it("sends the api key as a header", async () => {
    mockedFetch.mockResolvedValueOnce(answers());

    await fetchMerklUserRewards({ chainId: 1, user: USER, apiKey: "k" });

    expect(mockedFetch).toHaveBeenCalledWith(expect.any(String), {
      headers: { [MERKL_API_KEY_HEADER]: "k" },
      signal: expect.anything(),
    });
  });

  /**
   * One shared budget would let a slow primary consume the mirror's, so the
   * fallback has to arrive with a signal of its own.
   */
  it("gives each attempt its own abort signal", async () => {
    mockedFetch
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce(answers());

    await fetchMerklUserRewards({ chainId: 1, user: USER });

    const first = mockedFetch.mock.calls[0]?.[1]?.signal;
    const second = mockedFetch.mock.calls[1]?.[1]?.signal;
    expect(first).toBeInstanceOf(AbortSignal);
    expect(second).toBeInstanceOf(AbortSignal);
    expect(second).not.toBe(first);
  });

  it("falls back to the mirror when the primary rejects, keeping the key", async () => {
    mockedFetch
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce(answers([{ chain: { id: 1 } }]));

    const body = await fetchMerklUserRewards({
      chainId: 1,
      user: USER,
      apiKey: "k",
    });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(mockedFetch).toHaveBeenNthCalledWith(2, MIRROR, {
      headers: { [MERKL_API_KEY_HEADER]: "k" },
      signal: expect.anything(),
    });
    expect(body).toEqual([{ chain: { id: 1 } }]);
  });

  /**
   * A non-2xx carries no rewards, so treating it as an answer would report an
   * emptiness that was never established. `fetch` only rejects on a transport
   * failure, so this has to be checked rather than caught.
   */
  it("falls back to the mirror on a non-2xx as well", async () => {
    mockedFetch
      .mockResolvedValueOnce(status(503))
      .mockResolvedValueOnce(answers());

    await fetchMerklUserRewards({ chainId: 1, user: USER });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(mockedFetch).toHaveBeenNthCalledWith(2, MIRROR, expect.anything());
  });

  /**
   * The whole point of the read: a caller must be able to tell an unreachable
   * Merkl from a wallet with nothing to claim, and only a rejection says so.
   */
  it("rejects when neither domain answers", async () => {
    mockedFetch
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce(status(500));

    const failure = fetchMerklUserRewards({ chainId: 1, user: USER });

    await expect(failure).rejects.toBeInstanceOf(MerklRequestFailedError);
    await expect(failure).rejects.toMatchObject({ chainId: 1 });
  });

  /**
   * A 200 whose body is not JSON carries no rewards either, so it is another
   * unanswered attempt rather than an empty success.
   */
  it("treats an unparseable body as no answer and tries the mirror", async () => {
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Unexpected token <");
        },
      } as unknown as Response)
      .mockResolvedValueOnce(answers([{ chain: { id: 1 } }]));

    const body = await fetchMerklUserRewards({ chainId: 1, user: USER });

    expect(mockedFetch).toHaveBeenCalledTimes(2);
    expect(body).toEqual([{ chain: { id: 1 } }]);
  });

  // `AbortSignal.timeout` rejects with an empty-message `TimeoutError`, which
  // would otherwise reach a reader as a blank line.
  it("says a timed-out attempt timed out", async () => {
    const timeout = new Error("");
    timeout.name = "TimeoutError";
    mockedFetch.mockRejectedValueOnce(timeout).mockRejectedValueOnce(timeout);

    await expect(
      fetchMerklUserRewards({ chainId: 1, user: USER }),
    ).rejects.toThrow(/timed out/);
  });

  it("names both attempts in the failure it throws", async () => {
    mockedFetch
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce(status(500));

    await expect(
      fetchMerklUserRewards({ chainId: 1, user: USER }),
    ).rejects.toThrow(/primary down/);
    mockedFetch
      .mockRejectedValueOnce(new Error("primary down"))
      .mockResolvedValueOnce(status(500));
    await expect(
      fetchMerklUserRewards({ chainId: 1, user: USER }),
    ).rejects.toThrow(/500/);
  });
});
