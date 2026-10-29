import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRedstonePayloads } from "./fetchRedstonePayloads.js";

afterEach(() => vi.unstubAllGlobals());

describe("fetchRedstonePayloads disabled", () => {
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
      dataServiceId: "redstone-primary-prod",
      uniqueSignersCount: 5,
    };
    const result = returnPrices
      ? fetchRedstonePayloads({ ...options, returnPrices: true })
      : fetchRedstonePayloads({ ...options, returnPrices: false });
    await expect(result).rejects.toThrow(
      "RedStone price updates are no longer supported by this SDK",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it("returns no payloads for an empty iterable", async () => {
    await expect(
      fetchRedstonePayloads({
        dataFeedsIds: new Set<string>(),
        dataServiceId: "redstone-primary-prod",
        uniqueSignersCount: 5,
      }),
    ).resolves.toEqual([]);
  });
});
