import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { AddressMap } from "../../utils/index.js";
import { PoolQuotaKeeperV310Contract } from "./PoolQuotaKeeperV310Contract.js";

const TOKEN = "0x1111111111111111111111111111111111111111" as Address;

interface QuotaRoom {
  limit: bigint;
  totalQuoted: bigint;
}

/**
 * `quotaAvailable` is borrowed onto a plain object: it only reads `quotas`,
 * and a real keeper needs a loaded pool to exist.
 */
function quotaAvailable(
  entries: Array<[Address, QuotaRoom]>,
  token: Address = TOKEN,
): bigint {
  return PoolQuotaKeeperV310Contract.prototype.quotaAvailable.call(
    { quotas: new AddressMap(entries) },
    token,
  );
}

describe("PoolQuotaKeeperV310Contract.quotaAvailable", () => {
  it("is the room left under the limit", () => {
    expect(quotaAvailable([[TOKEN, { limit: 100n, totalQuoted: 40n }]])).toBe(
      60n,
    );
  });

  it("is zero when the limit sits under what is already quoted", () => {
    expect(quotaAvailable([[TOKEN, { limit: 10n, totalQuoted: 40n }]])).toBe(
      0n,
    );
  });

  it("is zero when the market has no entry for the token", () => {
    expect(quotaAvailable([])).toBe(0n);
  });
});
