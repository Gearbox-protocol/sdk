import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { MIN_INT96 } from "../../../constants/math.js";
import { AddressMap } from "../../../utils/AddressMap.js";
import {
  type ResizedQuotaProps,
  resizedQuota,
  withDirectTransferQuota,
} from "./quotas-for-update.js";

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
        [USDC, OTHER],
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
        [USDC, OTHER],
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
        [USDC, OTHER],
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
        [USDC, OTHER],
      ),
    ).toEqual({
      desiredQuota: { [USDC]: { token: USDC, balance: 10_000n } },
      quotaIncrease: [],
      quotaDecrease: [],
    });
  });
});

describe("resizedQuota", () => {
  const UNDERLYING = "0x3333333333333333333333333333333333333333" as Address;
  const quota = (token: Address, isActive = true) => ({
    token,
    rate: 1,
    cumulativeIndexLU: 0n,
    quotaIncreaseFee: 0,
    totalQuoted: 0n,
    limit: 10n ** 30n,
    isActive,
  });
  /**
   * Every token is priced 1:1 with the underlying at an LT of 50%, so the
   * quota a balance is sized to is half of it.
   */
  const props = (
    over: Partial<ResizedQuotaProps> & Pick<ResizedQuotaProps, "assets">,
  ): ResizedQuotaProps => ({
    token: OTHER,
    initialQuotas: [],
    quotaReserve: 0,
    underlyingToken: UNDERLYING,
    liquidationThresholds: new AddressMap([
      [OTHER, 5_000],
      [USDC, 5_000],
    ]),
    quotas: new AddressMap([
      [OTHER, quota(OTHER)],
      [USDC, quota(USDC)],
    ]),
    maxDebt: 10n ** 12n,
    convert: (_from, _to, amount) => amount,
    ...over,
  });

  it("raises the quota to the balance's share, untouched balances aside", () => {
    expect(
      resizedQuota(
        props({
          assets: [
            { token: OTHER, balance: 100_000n },
            { token: USDC, balance: 500_000n },
          ],
          initialQuotas: [{ token: OTHER, quota: 20_000n }],
        }),
      ),
    ).toEqual({
      desiredQuota: { [OTHER]: { token: OTHER, balance: 50_000n } },
      quotaIncrease: [{ token: OTHER, balance: 30_000n }],
      quotaDecrease: [],
    });
  });

  it("lowers a quota the balance no longer carries", () => {
    expect(
      resizedQuota(
        props({
          assets: [{ token: OTHER, balance: 100_000n }],
          initialQuotas: [{ token: OTHER, quota: 80_000n }],
        }),
      ),
    ).toEqual({
      desiredQuota: { [OTHER]: { token: OTHER, balance: 50_000n } },
      quotaIncrease: [],
      quotaDecrease: [{ token: OTHER, balance: -30_000n }],
    });
  });

  it("drops the whole quota with the sentinel when the balance carries none", () => {
    expect(
      resizedQuota(
        props({
          assets: [{ token: OTHER, balance: 100_000n }],
          initialQuotas: [{ token: OTHER, quota: 80_000n }],
          liquidationThresholds: new AddressMap([[OTHER, 0]]),
        }),
      ),
    ).toEqual({
      desiredQuota: { [OTHER]: { token: OTHER, balance: 0n } },
      quotaIncrease: [],
      quotaDecrease: [{ token: OTHER, balance: MIN_INT96 }],
    });
  });

  it("caps an increase at what 2 × maxDebt leaves after every quota held", () => {
    expect(
      resizedQuota(
        props({
          assets: [{ token: OTHER, balance: 100_000n }],
          initialQuotas: [{ token: USDC, quota: 180_000n }],
          maxDebt: 100_000n,
        }),
      ),
    ).toEqual({
      desiredQuota: { [OTHER]: { token: OTHER, balance: 20_000n } },
      quotaIncrease: [{ token: OTHER, balance: 20_000n }],
      quotaDecrease: [],
    });
  });

  it("changes nothing for a token the keeper does not quote", () => {
    expect(
      resizedQuota(
        props({
          assets: [{ token: OTHER, balance: 100_000n }],
          initialQuotas: [{ token: OTHER, quota: 20_000n }],
          quotas: new AddressMap([[OTHER, quota(OTHER, false)]]),
        }),
      ),
    ).toEqual({
      desiredQuota: { [OTHER]: { token: OTHER, balance: 20_000n } },
      quotaIncrease: [],
      quotaDecrease: [],
    });
  });
});
