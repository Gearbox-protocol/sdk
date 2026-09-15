import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import { MIN_HF_LIMITED } from "../../../validation/index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  ANY,
  buildMarketSdk,
  CREDIT_MANAGER,
  MAX_DEBT,
  type MarketSdkExtras,
  POS,
  POS2,
  RWA_ASSET,
  UND,
  UND_DECIMALS,
} from "../testing/market.js";

/** 1000 POS, which is 1000 UND at fixture prices. */
const COLLATERAL = toBN("1000", UND_DECIMALS);
/**
 * What 1000 POS carries at the default target.
 *
 * POS is worth its amount in UND and its threshold is 0.92, so 920 UND of
 * backing, held to a factor of 1.0102: `920 / 1.0102`.
 */
const CEILING = 91_071_075_034n;

interface MaxBorrowCase {
  collateralToken?: Address;
  collateralAmount?: bigint;
  borrowToken?: Address;
  targetHF?: bigint;
}

function maxBorrow(c: MaxBorrowCase = {}, extras?: MarketSdkExtras): bigint {
  const sdk = buildMarketSdk(extras);
  return new CreditAccountOperationsService(sdk).maxBorrow({
    sdk,
    creditManager: CREDIT_MANAGER,
    collateralToken: c.collateralToken ?? POS,
    collateralAmount: c.collateralAmount ?? COLLATERAL,
    borrowToken: c.borrowToken ?? UND,
    targetHF: c.targetHF,
    quotaReserve: undefined,
  });
}

/** The state a borrow for `borrowAmount` leaves behind, on the same market. */
async function borrowedState(borrowAmount: bigint, sdk?: OnchainSDK) {
  const on = sdk ?? buildMarketSdk();
  const outcome = await new CreditAccountOperationsService(on).borrowIntent({
    sdk: on,
    creditManager: CREDIT_MANAGER,
    collateralToken: POS,
    collateralAmount: COLLATERAL,
    borrowToken: UND,
    borrowAmount,
    slippage: undefined,
    quotaReserve: undefined,
  });
  if (!outcome.ok) {
    throw new Error(`expected a state, got error: ${outcome.error.code}`);
  }
  return outcome.state;
}

describe("maxBorrow — the largest loan a collateral carries", () => {
  it("answers the loan that lands the account at the target factor", async () => {
    expect(maxBorrow()).toBe(CEILING);

    // the target the SDK holds a form to, two basis points clear of it
    expect((await borrowedState(CEILING)).safeHealthFactor).toBe(
      Number(MIN_HF_LIMITED) + 2,
    );
  });

  it("is the largest such loan: one UND more drops under the target", async () => {
    const s = await borrowedState(CEILING + toBN("1", UND_DECIMALS));

    expect(s.safeHealthFactor).toBeLessThan(Number(MIN_HF_LIMITED));
  });

  it("leaves less where the caller asks for more headroom", () => {
    expect(maxBorrow({ targetHF: 20_000n })).toBe(45_995_400_459n);
  });

  it("counts the collateral's own threshold: the underlying carries more", () => {
    // 0.98 against POS's 0.92, and the underlying is exempt from safe pricing.
    // POS2 is 1:1 with UND, so the payout is the loan in different units.
    expect(maxBorrow({ collateralToken: UND, borrowToken: POS2 })).toBe(
      97_010_492_971n,
    );
  });

  it("scales with the collateral put up, to the wei", () => {
    expect(maxBorrow({ collateralAmount: COLLATERAL / 4n })).toBe(CEILING / 4n);
  });
});

describe("maxBorrow — the payout token decides the units", () => {
  it("prices the ceiling into a payout the market does not lend in", () => {
    // ANY is $1 against UND's $2 and carries 18 decimals against UND's 8
    expect(maxBorrow({ borrowToken: ANY })).toBe(
      1_821_421_500_680_000_000_000n,
    );
  });

  it("answers an amount the borrow itself accepts", async () => {
    const sdk = buildMarketSdk();
    const service = new CreditAccountOperationsService(sdk);
    const amount = service.maxBorrow({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateralToken: POS,
      collateralAmount: COLLATERAL,
      // 1:1 with the underlying, so the mock router's echo stays honest
      borrowToken: POS2,
      targetHF: undefined,
      quotaReserve: undefined,
    });
    const outcome = await service.borrowIntent({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateralToken: POS,
      collateralAmount: COLLATERAL,
      borrowToken: POS2,
      borrowAmount: amount,
      slippage: undefined,
      quotaReserve: undefined,
    });

    if (!outcome.ok) {
      throw new Error(`expected a state, got error: ${outcome.error.code}`);
    }
    expect(outcome.state.borrowed.value).toBe(amount);
    expect(outcome.state.safeHealthFactor).toBeGreaterThanOrEqual(
      Number(MIN_HF_LIMITED),
    );
  });
});

describe("maxBorrow — a market whose underlying cannot leave the account", () => {
  /** The fixture market turned RWA: `UND` is the wrapper over `RWA_ASSET`. */
  const rwa: MarketSdkExtras = { rwaAssets: { [UND]: RWA_ASSET } };

  it("answers in the asset behind the wrapper, which it converts one for one", () => {
    // the unwrap rescales by decimals rather than by price, and the two share
    // them here — so the ceiling is the one any other market would name
    expect(maxBorrow({ borrowToken: RWA_ASSET }, rwa)).toBe(CEILING);
  });

  it("answers an amount the borrow itself accepts", async () => {
    const sdk = buildMarketSdk(rwa);
    const service = new CreditAccountOperationsService(sdk);
    const amount = service.maxBorrow({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateralToken: POS,
      collateralAmount: COLLATERAL,
      borrowToken: RWA_ASSET,
      targetHF: undefined,
      quotaReserve: undefined,
    });
    const outcome = await service.borrowIntent({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateralToken: POS,
      collateralAmount: COLLATERAL,
      borrowToken: RWA_ASSET,
      borrowAmount: amount,
      slippage: undefined,
      quotaReserve: undefined,
    });

    if (!outcome.ok) {
      throw new Error(`expected a state, got error: ${outcome.error.code}`);
    }
    expect(outcome.state.borrowed.value).toBe(amount);
    expect(outcome.state.safeHealthFactor).toBeGreaterThanOrEqual(
      Number(MIN_HF_LIMITED),
    );
  });

  it("answers nothing for a payout in the wrapper, which the borrow refuses", () => {
    expect(maxBorrow({ borrowToken: UND }, rwa)).toBe(0n);
  });
});

describe("maxBorrow — what the market will actually lend", () => {
  it("stops at the free liquidity of the pool", () => {
    const liquidity = toBN("500", UND_DECIMALS);

    expect(maxBorrow({}, { availableLiquidity: liquidity })).toBe(liquidity);
  });

  it("stops at the facade maxDebt, however much is put up", () => {
    expect(maxBorrow({ collateralAmount: COLLATERAL * 10_000n })).toBe(
      MAX_DEBT,
    );
  });

  it("stops at the manager's own borrowing allowance", () => {
    const allowance = toBN("300", UND_DECIMALS);

    expect(maxBorrow({}, { debtLimitAvailable: allowance })).toBe(allowance);
  });
});

describe("maxBorrow — where no loan of this shape can be funded", () => {
  it("answers nothing for a payout in the collateral token", () => {
    expect(maxBorrow({ borrowToken: POS })).toBe(0n);
  });

  it("answers nothing for collateral that is dust, or none at all", () => {
    expect(maxBorrow({ collateralAmount: 0n })).toBe(0n);
    expect(maxBorrow({ collateralAmount: 1n })).toBe(0n);
  });

  it("answers nothing where the ceiling lands under minDebt", () => {
    expect(maxBorrow({}, { minDebt: CEILING })).toBe(CEILING);
    expect(maxBorrow({}, { minDebt: CEILING + 1n })).toBe(0n);
  });

  it("answers nothing for a collateral the market takes no threshold on", () => {
    // priced, but not a collateral token of this manager
    expect(
      maxBorrow(
        { collateralToken: "0x9999999999999999999999999999999999999999" },
        { extraPrices: { "0x9999999999999999999999999999999999999999": 10n } },
      ),
    ).toBe(0n);
  });
});
