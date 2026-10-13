import { describe, expect, it } from "vitest";
import { MIN_INT96 } from "../../constants/math.js";
import { resolveQuotaUpdate } from "./resolveQuotaUpdate.js";
import {
  ANY,
  ANY2,
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  MAX_DEBT,
  type MarketSdkExtras,
  QUOTAS,
} from "./testing/market.js";
import type { CreditAccountSlice } from "./types.js";

/** 2000 ANY = 1000 UND, which an LT of 92% sizes to a quota of 920 UND. */
const BALANCE = 2_000n * 10n ** 18n;
const SIZED = 92_000_000_000n;
const DEBT = 50_000_000_000n;

interface ResolveArgs {
  quota?: bigint;
  current?: bigint;
  tokens?: CreditAccountSlice["tokens"];
  extras?: MarketSdkExtras;
}

function resolve(args: ResolveArgs) {
  return resolveQuotaUpdate({
    sdk: buildMarketSdk(args.extras),
    creditAccount: buildFixtureCreditAccount({
      totalDebt: DEBT,
      tokens: args.tokens ?? [caToken(ANY, BALANCE, args.current ?? 0n)],
    }),
    token: ANY,
    quota: args.quota,
    quotaReserve: undefined,
  });
}

/** A market whose keeper has exactly `available` of ANY quota left. */
function withAvailable(available: bigint): MarketSdkExtras {
  return {
    quotas: {
      ...QUOTAS,
      [ANY]: {
        ...QUOTAS[ANY],
        limit: 10n ** 12n + available,
        totalQuoted: 10n ** 12n,
      },
    },
  };
}

const rejection = (code: string, fields: object = {}) =>
  expect.objectContaining({
    error: expect.objectContaining({ code, ...fields }),
  });

function expectChange(
  result: ReturnType<typeof resolve>,
  change: bigint,
  resulting: bigint,
  minQuota: bigint,
): void {
  const entry = [{ token: ANY, balance: change }];
  expect(result).toEqual({
    update: {
      desiredQuota: { [ANY]: { token: ANY, balance: resulting } },
      quotaIncrease: change > 0n ? entry : [],
      quotaDecrease: change < 0n ? entry : [],
    },
    minQuota: [{ token: ANY, balance: minQuota }],
  });
}

describe("resolveQuotaUpdate — a target is taken as named", () => {
  it("raises to the target, rounded down to a 10_000 step, strictly", () => {
    expectChange(
      resolve({ quota: 50_000_003_333n, current: 10_000_000_000n }),
      40_000_000_000n,
      50_000_000_000n,
      50_000_000_000n,
    );
  });

  it("lowers to the target, strictly", () => {
    expectChange(
      resolve({ quota: 40_000_000_000n, current: 90_000_000_000n }),
      -50_000_000_000n,
      40_000_000_000n,
      40_000_000_000n,
    );
  });

  it("disables at 0 with the sentinel, and never reads 0 as sized", () => {
    expectChange(
      resolve({ quota: 0n, current: 90_000_000_000n }),
      MIN_INT96,
      0n,
      0n,
    );
  });

  it("reads a negative target as 0", () => {
    expectChange(
      resolve({ quota: -5n, current: 90_000_000_000n }),
      MIN_INT96,
      0n,
      0n,
    );
  });
});

describe("resolveQuotaUpdate — omitted, it is sized to the balance", () => {
  it("raises to balance × LT, accepting a partial fill that stays enabled", () => {
    expectChange(resolve({}), SIZED, SIZED, 10_000n);
    expectChange(
      resolve({ current: 30_000_000_000n }),
      SIZED - 30_000_000_000n,
      SIZED,
      30_000_000_000n,
    );
  });

  it("caps an increase at the pool's available quota", () => {
    expectChange(
      resolve({ extras: withAvailable(30_000_005_555n) }),
      30_000_000_000n,
      30_000_000_000n,
      10_000n,
    );
  });

  it("cuts an increase to what 2 × maxDebt leaves after every quota", () => {
    const held = 2n * MAX_DEBT - 30_000_000_000n;
    expectChange(
      resolve({
        tokens: [caToken(ANY, BALANCE), caToken(ANY2, BALANCE, held)],
      }),
      30_000_000_000n,
      30_000_000_000n,
      10_000n,
    );
  });

  it("lowers a quota above the balance's share, strictly", () => {
    expectChange(
      resolve({ current: 150_000_000_000n }),
      SIZED - 150_000_000_000n,
      SIZED,
      SIZED,
    );
  });

  it("drops the whole quota with the sentinel when the balance carries none", () => {
    expectChange(
      resolve({
        current: 150_000_000_000n,
        extras: { extraLiquidationThresholds: { [ANY]: 0 } },
      }),
      MIN_INT96,
      0n,
      0n,
    );
  });
});

describe("resolveQuotaUpdate — refused", () => {
  it("a token whose quota the keeper does not charge for", () => {
    const extras = {
      quotas: { ...QUOTAS, [ANY]: { ...QUOTAS[ANY], isActive: false } },
    };
    expect(() => resolve({ extras })).toThrowError(rejection("quotaInactive"));
    expect(() => resolve({ quota: 0n, extras })).toThrowError(
      rejection("quotaInactive"),
    );
  });

  it("a sized increase when the pool has less than one quota step available", () => {
    for (const available of [0n, 9_999n]) {
      expect(() => resolve({ extras: withAvailable(available) })).toThrowError(
        rejection("quotaLimitReached", {
          requested: expect.objectContaining({ value: SIZED }),
          available: expect.objectContaining({ value: 0n }),
        }),
      );
    }
  });

  it("a change that rounds to nothing, in either mode", () => {
    expect(() =>
      resolve({ quota: 50_005_000n, current: 50_000_000n }),
    ).toThrowError(rejection("quotaUnchanged"));
    expect(() => resolve({ quota: 0n })).toThrowError(
      rejection("quotaUnchanged"),
    );
    expect(() => resolve({ current: SIZED })).toThrowError(
      rejection("quotaUnchanged"),
    );
  });

  it("an increase on a forbidden token, but not a decrease", () => {
    const extras = { forbiddenTokens: [ANY] };
    expect(() => resolve({ extras })).toThrowError(rejection("forbiddenToken"));
    expect(() =>
      resolve({ quota: SIZED, current: 10_000_000_000n, extras }),
    ).toThrowError(rejection("forbiddenToken"));
    expectChange(
      resolve({ quota: 0n, current: SIZED, extras }),
      MIN_INT96,
      0n,
      0n,
    );
  });

  it("a target above maxQuota", () => {
    const maxQuota = 2n * MAX_DEBT;
    expect(() => resolve({ quota: maxQuota + 10_000n })).toThrowError(
      rejection("quotaAboveMax", {
        requested: expect.objectContaining({ value: maxQuota + 10_000n }),
        maxQuota: expect.objectContaining({ value: maxQuota }),
      }),
    );
  });

  it("a target increase above the pool's available quota", () => {
    expect(() =>
      resolve({ quota: SIZED, extras: withAvailable(50_000_000_000n) }),
    ).toThrowError(
      rejection("quotaLimitReached", {
        requested: expect.objectContaining({ value: SIZED }),
        available: expect.objectContaining({ value: 50_000_000_000n }),
      }),
    );
  });
});
