import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import { SecuritizeRWAFactory } from "./SecuritizeRWAFactory.js";

const BOT = "0x8888888888888888888888888888888888888888" as Address;

/** The method reads only the version and the contract binding. */
function isAllowedBot(version: number, allowed: boolean) {
  const read = vi.fn(async () => allowed);
  const factory = { version, contract: { read: { isAllowedBot: read } } };
  return {
    result: SecuritizeRWAFactory.prototype.isAllowedBot.call(
      factory as unknown as SecuritizeRWAFactory,
      BOT,
    ),
    read,
  };
}

describe("SecuritizeRWAFactory.isAllowedBot", () => {
  it("asks a 3.12 factory its allowlist", async () => {
    const { result, read } = isAllowedBot(312, true);

    expect(await result).toBe(true);
    expect(read).toHaveBeenCalledWith([BOT]);
  });

  it("answers false for a factory older than the allowlist, without a read", async () => {
    const { result, read } = isAllowedBot(311, true);

    expect(await result).toBe(false);
    expect(read).not.toHaveBeenCalled();
  });
});
