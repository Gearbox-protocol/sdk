import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { Asset } from "../../../../onchain/index.js";
import {
  buildCreditManager,
  buildPool,
  buildQuota,
  mockToken1,
  mockToken2,
} from "../../../test-utils/index.js";
import {
  checkCreditManagerUsable,
  checkOpenAccountCeilings,
} from "./credit-manager-issues.js";

/**
 * The behaviours the deleted `common-utils/utils/validation` module pinned,
 * carried over onto the checks that replaced it. Every case here was a case
 * there, plus the branches its own specs never reached.
 */

const creditManager = buildCreditManager({
  minDebt: 1000n,
  maxDebt: 1000000n,
  totalDebtLimit: 5000000n,
  totalDebt: 2000000n,
  availableToBorrow: 3000000n,
  quotas: {
    [mockToken1]: buildQuota({
      token: mockToken1,
      limit: 1000000n,
      totalQuoted: 500000n,
      rate: 0n,
    }),
  },
  maxEnabledTokensLength: 2,
});

const pool = buildPool({ totalDebtLimit: 10000000n, totalBorrowed: 5000000n });

const ceilings = (over: Record<string, unknown> = {}) =>
  checkOpenAccountCeilings({
    debt: 50000n,
    creditManager,
    pool,
    targetToken: null,
    ...over,
  });

describe("checkOpenAccountCeilings", () => {
  it("passes when every ceiling has room", () => {
    expect(ceilings()).toBeNull();
  });

  it("reports the manager's own limit first", () => {
    const issue = ceilings({
      creditManager: buildCreditManager({
        ...creditManager,
        totalDebtLimit: 2000100n,
      }),
    });
    expect(issue?.detail).toMatchObject({ binding: "managerDebtAvailable" });
  });

  it("reports the pool's limit next", () => {
    const issue = ceilings({
      pool: buildPool({ totalDebtLimit: 5010000n, totalBorrowed: 5000000n }),
    });
    expect(issue?.detail).toMatchObject({ binding: "poolDebtLimit" });
  });

  it("reports what the manager can still draw last", () => {
    const issue = ceilings({
      creditManager: buildCreditManager({
        ...creditManager,
        availableToBorrow: 100n,
      }),
    });
    expect(issue?.detail).toMatchObject({
      binding: "poolAvailableLiquidity",
      available: { value: 100n },
    });
  });

  // The two limits are read with different operators and disagree at zero: a
  // manager limit of zero is a limit nothing clears, a pool limit of zero means
  // none was configured.
  it("reads a zero manager limit as binding and a zero pool limit as absent", () => {
    expect(
      ceilings({
        creditManager: buildCreditManager({
          ...creditManager,
          totalDebtLimit: 0n,
          totalDebt: 0n,
        }),
      })?.detail,
    ).toMatchObject({ binding: "managerDebtAvailable" });

    expect(
      ceilings({ pool: buildPool({ totalDebtLimit: 0n, totalBorrowed: 0n }) }),
    ).toBeNull();
  });

  it("reads `-1n` as no manager limit configured, and skips that ceiling", () => {
    // The read model's sentinel: with it, `debtLimitLeft` would clamp to zero
    // and refuse everything, so the ceiling has to stand down entirely.
    expect(
      ceilings({
        creditManager: buildCreditManager({
          ...creditManager,
          totalDebtLimit: -1n,
        }),
      }),
    ).toBeNull();
  });

  it("clamps a manager already past its own limit to no headroom", () => {
    const issue = ceilings({
      creditManager: buildCreditManager({
        ...creditManager,
        totalDebtLimit: 1000n,
        totalDebt: 5000n,
      }),
    });
    expect(issue?.detail).toMatchObject({
      binding: "managerDebtAvailable",
      available: { value: 0n },
    });
  });

  it("treats a missing pool as no pool limit", () => {
    for (const missing of [null, undefined]) {
      expect(ceilings({ pool: missing })).toBeNull();
    }
  });

  it("weighs the minimum debt, not the debt asked for", () => {
    const issue = ceilings({
      debt: 1n,
      creditManager: buildCreditManager({
        ...creditManager,
        totalDebtLimit: 500n,
        totalDebt: 0n,
      }),
    });
    expect(issue?.detail).toMatchObject({ available: { value: 500n } });
  });

  it("offers the position still openable, and none when the minimum does not fit", () => {
    const openable = ceilings({
      debt: 4000n,
      creditManager: buildCreditManager({
        ...creditManager,
        totalDebtLimit: 3000n,
        totalDebt: 0n,
        availableToBorrow: 3000n,
      }),
    });
    expect(openable?.detail).toMatchObject({
      solutionAmount: { value: 3000n },
    });

    const hopeless = ceilings({
      debt: 4000n,
      creditManager: buildCreditManager({
        ...creditManager,
        totalDebtLimit: 500n,
        totalDebt: 0n,
        availableToBorrow: 500n,
      }),
    });
    expect(hopeless?.detail).not.toHaveProperty("solutionAmount");
  });

  it("checks the target token's quota once the debt fits", () => {
    const issue = ceilings({ debt: 600000n, targetToken: mockToken1 });
    expect(issue?.reason).toBe("quotaLimitReached");
  });

  it("reads an inactive quota as no headroom at all", () => {
    const issue = ceilings({
      targetToken: mockToken1,
      creditManager: buildCreditManager({
        ...creditManager,
        quotas: {
          [mockToken1]: buildQuota({
            token: mockToken1,
            limit: 1000000n,
            totalQuoted: 0n,
            isActive: false,
          }),
        },
      }),
    });
    expect(issue?.reason).toBe("quotaLimitReached");
  });

  it("ignores a token the market opened no quota for", () => {
    expect(ceilings({ targetToken: mockToken2 })).toBeNull();
  });
});

const usable = (over: Record<string, unknown> = {}) =>
  checkCreditManagerUsable({
    creditManager,
    pool,
    debt: 50000n,
    healthFactor: 15000,
    targetToken: null,
    tokenToObtain: null,
    collateral: [],
    balances: {},
    desiredQuota: {},
    quotaUpdate: [],
    ...over,
  });

describe("checkCreditManagerUsable", () => {
  it("passes an account the market would accept", () => {
    expect(usable()).toBeNull();
  });

  it("refuses a paused manager before anything else", () => {
    const issue = usable({
      creditManager: buildCreditManager({ ...creditManager, isPaused: true }),
      healthFactor: 1,
    });
    expect(issue?.reason).toBe("marketPaused");
  });

  it("refuses a token the market forbids the account to obtain", () => {
    const issue = usable({
      creditManager: buildCreditManager({
        ...creditManager,
        forbiddenTokens: { [mockToken1]: true },
        // The spread carries the base builder's own predicate; drop it so the
        // fixture derives one from the map above.
        isForbidden: undefined,
      }),
      tokenToObtain: mockToken1,
    });
    expect(issue?.reason).toBe("forbiddenToken");
  });

  // The balance map is keyed lowercase while the asset names its token as the
  // market spells it, so the lookup lowercases — a checksummed key is missed.
  it("finds a balance keyed lowercase and misses one keyed checksummed", () => {
    const checksummed = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
    const collateral = [{ token: checksummed, balance: 500n } as Asset];

    expect(
      usable({
        collateral,
        balances: { [checksummed.toLowerCase() as Address]: 1000n },
      }),
    ).toBeNull();
    expect(
      usable({ collateral, balances: { [checksummed]: 1000n } })?.reason,
    ).toBe("insufficientSourceBalance");
  });

  it("refuses a debt on either side of the band", () => {
    // Above maxDebt but inside every ceiling, so the band is what catches it —
    // the ceilings rung runs first and would otherwise mask this.
    expect(usable({ debt: 2_000_000n })?.reason).toBe("debtOutOfRange");
    expect(usable({ debt: 999n })?.reason).toBe("debtOutOfRange");
  });

  it("reports the first asset the wallet cannot cover", () => {
    const issue = usable({
      collateral: [
        { token: mockToken1, balance: 500n } as Asset,
        { token: mockToken2, balance: 500n } as Asset,
      ],
      balances: { [mockToken1]: 0n, [mockToken2]: 0n },
    });
    expect(issue).toMatchObject({
      reason: "insufficientSourceBalance",
      detail: { required: { token: { address: mockToken1 } } },
    });
  });

  it("refuses an opening that carries no loan", () => {
    // Unlike the engine's band check, which exempts a zero debt.
    expect(usable({ debt: 0n })?.reason).toBe("debtOutOfRange");
  });

  it("counts quoted tokens against the cap, ignoring the empty ones", () => {
    const quota = (token: Address, balance: bigint) =>
      ({ token, balance }) as Asset;

    expect(
      usable({
        desiredQuota: {
          [mockToken1]: quota(mockToken1, 1n),
          [mockToken2]: quota(mockToken2, 1n),
        },
      }),
    ).toBeNull();

    expect(
      usable({
        creditManager: buildCreditManager({
          ...creditManager,
          maxEnabledTokensLength: 1,
        }),
        desiredQuota: {
          [mockToken1]: quota(mockToken1, 1n),
          [mockToken2]: quota(mockToken2, 0n),
        },
      }),
    ).toBeNull();

    expect(
      usable({
        creditManager: buildCreditManager({
          ...creditManager,
          maxEnabledTokensLength: 1,
        }),
        desiredQuota: {
          [mockToken1]: quota(mockToken1, 1n),
          [mockToken2]: quota(mockToken2, 1n),
        },
      }),
    ).toEqual({
      reason: "quotaCountExceeded",
      detail: { count: 2, max: 1 },
    });
  });

  it("skips quota updates that do not increase anything", () => {
    const update = (balance: bigint) => [
      { token: mockToken1, balance } as Asset,
    ];

    expect(usable({ quotaUpdate: update(500000n) })).toBeNull();
    expect(usable({ quotaUpdate: update(0n) })).toBeNull();
    expect(usable({ quotaUpdate: update(-600000n) })).toBeNull();
    expect(usable({ quotaUpdate: update(500001n) })?.reason).toBe(
      "quotaLimitReached",
    );
  });

  it("holds the health factor to the form's bar, which is above the facade's", () => {
    expect(usable({ healthFactor: 10_100 })?.reason).toBe(
      "insufficientCollateral",
    );
    expect(usable({ healthFactor: 10_101 })).toBeNull();
    expect(usable({ healthFactor: undefined })?.reason).toBe(
      "insufficientCollateral",
    );
  });
});
