import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { MIN_INT96 } from "../../../constants/math.js";
import { AddressMap } from "../../../utils/AddressMap.js";
import { withDirectTransferQuota } from "./quotas-for-update.js";

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Address;
const OTHER = "0x1111111111111111111111111111111111111111" as Address;

const quotas = new AddressMap([
  [
    USDC,
    {
      token: USDC,
      rate: 1,
      cumulativeIndexLU: 0n,
      quotaIncreaseFee: 0,
      totalQuoted: 0n,
      limit: 10n ** 30n,
      isActive: true,
    },
  ],
]);

describe("withDirectTransferQuota", () => {
  it("adds the quota beside an update that never named the token", () => {
    const other = { token: OTHER, balance: -20_000n };
    expect(
      withDirectTransferQuota(
        {
          desiredQuota: { [OTHER]: { token: OTHER, balance: 0n } },
          quotaIncrease: [],
          quotaDecrease: [other],
        },
        USDC,
        [],
        quotas,
        4,
      ),
    ).toEqual({
      desiredQuota: {
        [OTHER]: { token: OTHER, balance: 0n },
        [USDC]: { token: USDC, balance: 10_000n },
      },
      quotaIncrease: [{ token: USDC, balance: 10_000n }],
      quotaDecrease: [other],
    });
  });

  it("cuts a decrease short at the direct transfers quota", () => {
    expect(
      withDirectTransferQuota(
        {
          desiredQuota: { [USDC]: { token: USDC, balance: 0n } },
          quotaIncrease: [],
          quotaDecrease: [{ token: USDC, balance: MIN_INT96 }],
        },
        USDC,
        [{ token: USDC, quota: 30_000n }],
        quotas,
        4,
      ),
    ).toEqual({
      desiredQuota: { [USDC]: { token: USDC, balance: 10_000n } },
      quotaIncrease: [],
      quotaDecrease: [{ token: USDC, balance: -20_000n }],
    });
  });

  it("skips the token when every enabled token slot is taken", () => {
    const update = {
      desiredQuota: { [OTHER]: { token: OTHER, balance: 20_000n } },
      quotaIncrease: [],
      quotaDecrease: [],
    };
    expect(
      withDirectTransferQuota(
        update,
        USDC,
        [{ token: OTHER, quota: 20_000n }],
        quotas,
        1,
      ),
    ).toBe(update);
  });

  it("drops a decrease that would leave exactly the quota held", () => {
    expect(
      withDirectTransferQuota(
        {
          desiredQuota: { [USDC]: { token: USDC, balance: 0n } },
          quotaIncrease: [],
          quotaDecrease: [{ token: USDC, balance: MIN_INT96 }],
        },
        USDC,
        [{ token: USDC, quota: 10_000n }],
        quotas,
        4,
      ),
    ).toEqual({
      desiredQuota: { [USDC]: { token: USDC, balance: 10_000n } },
      quotaIncrease: [],
      quotaDecrease: [],
    });
  });
});
