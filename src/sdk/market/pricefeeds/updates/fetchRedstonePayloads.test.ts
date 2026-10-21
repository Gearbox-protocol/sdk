import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRedstonePayloads } from "./fetchRedstonePayloads.js";

afterEach(() => vi.unstubAllGlobals());

describe("disabled RedStone fetching", () => {
  it.each([
    false,
    true,
  ] as const)("rejects nonempty requests without network access (returnPrices=%s)", async returnPrices => {
    const fetch = vi.fn(() => {
      throw new Error("unexpected network access");
    });
    vi.stubGlobal("fetch", fetch);
    const options = {
      dataServiceId: "redstone-primary-prod",
      dataFeedsIds: ["ETH"],
      uniqueSignersCount: 5,
    };
    const result = returnPrices
      ? fetchRedstonePayloads({ ...options, returnPrices: true })
      : fetchRedstonePayloads(options);
    await expect(result).rejects.toThrow(
      "RedStone price updates are no longer supported",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns no payloads for an empty iterable", async () => {
    await expect(
      fetchRedstonePayloads({
        dataServiceId: "redstone-primary-prod",
        dataFeedsIds: new Set<string>(),
        uniqueSignersCount: 5,
      }),
    ).resolves.toEqual([]);
  });
});
