import { afterEach, describe, expect, it, vi } from "vitest";

import { buildCreditManager, buildQuota } from "../__test-utils.js";
import type * as UsableTokensTypes from "../tokens/is-usable-token.js";
import { isUsableToken } from "../tokens/is-usable-token.js";
import type { CreditManagerDataSlice } from "../types.js";
import { getStrategyCreditManagers } from "./get-strategy-credit-managers.js";
import type * as IsCreditManagerUsableTypes from "./is-credit-manager-usable.js";
import { isCreditManagerUsable } from "./is-credit-manager-usable.js";

vi.mock("./is-credit-manager-usable.js", async importOriginal => {
  const actual = await importOriginal<typeof IsCreditManagerUsableTypes>();

  return {
    ...actual,
    isCreditManagerUsable: vi.fn(actual.isCreditManagerUsable),
  };
});

vi.mock("../tokens/is-usable-token.js", async importOriginal => {
  const actual = await importOriginal<typeof UsableTokensTypes>();

  return {
    ...actual,
    isUsableToken: vi.fn(actual.isUsableToken),
  };
});

const mockIsCreditManagerUsable = vi.mocked(isCreditManagerUsable);
const mockIsUsableToken = vi.mocked(isUsableToken);

describe("getStrategyCreditManagers", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const usableCM = buildCreditManager({
    address: "0xcm1",
    quotas: {
      "0xlp": buildQuota({
        token: "0xlp",
        limit: 100n,
        rate: 0n,
      }),
    },
    availableToBorrow: 100n,
    minDebt: 10n,
    isBorrowingForbidden: false,
  } as any) as CreditManagerDataSlice;

  const borrowingForbidden = buildCreditManager({
    address: "0xcmBorrowForbidden",
    quotas: {
      "0xlp": buildQuota({
        token: "0xlp",
        limit: 100n,
        rate: 0n,
      }),
    },
    availableToBorrow: 100n,
    minDebt: 10n,
    isBorrowingForbidden: true,
  } as any) as CreditManagerDataSlice;

  const isCreditManagerUsableFalse = buildCreditManager({
    address: "0xcmUsableFalse",
    quotas: {
      "0xlp": buildQuota({
        token: "0xlp",
        limit: 100n,
        rate: 0n,
      }),
    },
    availableToBorrow: 100n,
    minDebt: 10n,
    isBorrowingForbidden: false,
  } as any) as CreditManagerDataSlice;

  const isUsableTokenFalse = buildCreditManager({
    address: "0xisUsableToken",
    quotas: {
      "0xlp": buildQuota({
        token: "0xlp",
        limit: 100n,
        rate: 0n,
      }),
    },
    availableToBorrow: 100n,
    minDebt: 10n,
    isBorrowingForbidden: false,
  } as any) as CreditManagerDataSlice;

  const unusableByQuotaZero = buildCreditManager({
    address: "0xcm2",
    quotas: {
      "0xlp": buildQuota({
        token: "0xlp",
        limit: 0n,
        totalQuoted: 100n,
        rate: 0n,
      }),
    },
    availableToBorrow: 100n,
    minDebt: 10n,
    isBorrowingForbidden: false,
  } as any) as CreditManagerDataSlice;

  const unusableByQuotaZeroButUnderlying = buildCreditManager({
    address: "0xcm3",
    quotas: {
      "0xlp": buildQuota({
        token: "0xlp",
        limit: 0n,
        totalQuoted: 100n,
        rate: 0n,
      }),
    },
    underlyingToken: "0xlp",
    availableToBorrow: 100n,
    minDebt: 10n,
    isBorrowingForbidden: false,
  } as any) as CreditManagerDataSlice;

  const strategy = {
    tokenOutAddress: "0xlp",
    creditManagers: [
      usableCM.address,
      borrowingForbidden.address,
      isCreditManagerUsableFalse.address,
      isUsableTokenFalse.address,
      unusableByQuotaZero.address,
      unusableByQuotaZeroButUnderlying.address,
      "0xmissingFromAllCreditManagers",
    ],
  } as any;

  it("includes usable credit manager", () => {
    mockIsCreditManagerUsable.mockReturnValue(true);
    mockIsUsableToken.mockReturnValue(true);

    const allCreditManagers = {
      [usableCM.address]: usableCM,
    };

    const result = getStrategyCreditManagers({
      strategy,
      allCreditManagers,
    });

    expect(result).toEqual({ [usableCM.address]: usableCM });
  });

  it("excludes borrowingForbidden credit manager", () => {
    mockIsCreditManagerUsable.mockReturnValue(true);
    mockIsUsableToken.mockReturnValue(true);

    const allCreditManagers = {
      [borrowingForbidden.address]: borrowingForbidden,
    };

    const result = getStrategyCreditManagers({
      strategy,
      allCreditManagers,
    });

    expect(result).toEqual({});
  });

  it("excludes when isCreditManagerUsable is false", () => {
    mockIsCreditManagerUsable.mockReturnValue(false);
    mockIsUsableToken.mockReturnValue(true);

    const allCreditManagers = {
      [isCreditManagerUsableFalse.address]: isCreditManagerUsableFalse,
    };

    const result = getStrategyCreditManagers({
      strategy,
      allCreditManagers,
    });

    expect(result).toEqual({});
  });

  it("excludes when isUsableToken is false", () => {
    mockIsCreditManagerUsable.mockReturnValue(true);
    mockIsUsableToken.mockReturnValue(false);

    const allCreditManagers = {
      [isUsableTokenFalse.address]: isUsableTokenFalse,
    };

    const result = getStrategyCreditManagers({
      strategy,
      allCreditManagers,
    });

    expect(result).toEqual({});
  });

  it("excludes when quota limit is zero for non-underlying", () => {
    mockIsCreditManagerUsable.mockReturnValue(true);
    mockIsUsableToken.mockReturnValue(true);

    const allCreditManagers = {
      [unusableByQuotaZero.address]: unusableByQuotaZero,
    };

    const result = getStrategyCreditManagers({
      strategy,
      allCreditManagers,
    });

    expect(result).toEqual({});
  });

  it("includes underlying CM even when quota limit is zero", () => {
    mockIsCreditManagerUsable.mockReturnValue(true);
    mockIsUsableToken.mockReturnValue(true);

    const allCreditManagers = {
      [unusableByQuotaZeroButUnderlying.address]:
        unusableByQuotaZeroButUnderlying,
    };

    const result = getStrategyCreditManagers({
      strategy,
      allCreditManagers,
    });

    expect(result).toEqual({
      [unusableByQuotaZeroButUnderlying.address]:
        unusableByQuotaZeroButUnderlying,
    });
  });
});
