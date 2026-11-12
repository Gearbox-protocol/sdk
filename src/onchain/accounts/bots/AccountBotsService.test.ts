import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AccountBotsService } from "./AccountBotsService.js";

const COMPRESSOR = "0x0000000000000000000000000000000000000c0c" as Address;
const CONFIGURATOR = "0x0000000000000000000000000000000000000001" as Address;
const OTHER_CONFIGURATOR =
  "0x0000000000000000000000000000000000000002" as Address;

function service(readContract: ReturnType<typeof vi.fn>): AccountBotsService {
  return new AccountBotsService({
    client: { readContract },
    addressProvider: { mustGetLatest: () => [COMPRESSOR, 310n] },
    getContract: () => ({ address: COMPRESSOR }),
  } as unknown as OnchainSDK);
}

describe("AccountBotsService.getMarketBots", () => {
  it("asks the periphery compressor once per configurator", async () => {
    const bots = [{ requiredPermissions: 1n }];
    const readContract = vi.fn(async () => bots);
    const accountBots = service(readContract);

    expect(await accountBots.getMarketBots(CONFIGURATOR)).toBe(bots);
    expect(await accountBots.getMarketBots(CONFIGURATOR)).toBe(bots);
    await accountBots.getMarketBots(OTHER_CONFIGURATOR);

    expect(readContract).toHaveBeenCalledTimes(2);
    expect(readContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: COMPRESSOR,
        functionName: "getBots",
        args: [CONFIGURATOR],
      }),
    );
  });

  it("does not keep a failed read, so the next call tries again", async () => {
    const readContract = vi
      .fn()
      .mockRejectedValueOnce(new Error("rpc down"))
      .mockResolvedValueOnce([]);
    const accountBots = service(readContract);

    await expect(accountBots.getMarketBots(CONFIGURATOR)).rejects.toThrow(
      "rpc down",
    );
    expect(await accountBots.getMarketBots(CONFIGURATOR)).toEqual([]);
    expect(readContract).toHaveBeenCalledTimes(2);
  });
});
