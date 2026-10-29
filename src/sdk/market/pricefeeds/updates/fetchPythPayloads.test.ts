import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPythPayloads } from "./fetchPythPayloads.js";

afterEach(() => vi.unstubAllGlobals());

describe("fetchPythPayloads disabled", () => {
  it.each([
    true,
    false,
  ])("rejects nonempty requests without network access (prices: %s)", async returnPrices => {
    const fetch = vi.fn(() => {
      throw new Error("network unavailable");
    });
    vi.stubGlobal("fetch", fetch);
    const options = {
      dataFeedsIds: ["ETH"],
      failOnMissingFeeds: true,
      customFetch: fetch,
    };
    const result = returnPrices
      ? fetchPythPayloads({ ...options, returnPrices: true })
      : fetchPythPayloads({ ...options, returnPrices: false });
    await expect(result).rejects.toThrow(
      "Pyth price updates are no longer supported by this SDK",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns no payloads for an empty iterable", async () => {
    await expect(
      fetchPythPayloads({ dataFeedsIds: new Set<string>() }),
    ).resolves.toEqual([]);
  });
});
