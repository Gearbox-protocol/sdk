import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
  AdjustCreditAccountPreview,
  PoolOperationPreview,
} from "../../model/index.js";
import {
  AddressMap,
  json_parse,
  OnchainSDK,
  toToken,
} from "../../onchain/index.js";
import { checkOperation } from "./checkOperation.js";

/**
 * The same offline fixture the preview tests run on: the client throws on any
 * RPC request, so a green run is also the proof that validating a parsed
 * transaction needs no chain reads.
 */
const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);

const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const POOL: Address = "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64";
const WSTETH: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";

let sdk: OnchainSDK;

beforeAll(() => {
  sdk = new OnchainSDK("Mainnet", {
    transport: custom({
      request: async () => {
        throw new Error("offline: checkOperation must not hit RPC");
      },
    }),
  });
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
});

/** A healthy adjustment of the fixture's account, as the preview reports one. */
function adjust(
  over: Partial<AdjustCreditAccountPreview> = {},
): AdjustCreditAccountPreview {
  return {
    operation: "AdjustCreditAccount",
    name: "KPK WETH",
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    collateralAdded: [],
    collateralWithdrawn: [],
    totalValue: 10n ** 20n,
    debt: 41_574_436_328_452_499_320n,
    debtChange: 0n,
    assets: [],
    assetsChange: [],
    quotas: [],
    quotasChange: [],
    healthFactor: 12_500,
    safeHealthFactor: 11_800,
    borrowRate: { total: 300, totalOnDebt: 320, base: 250, quotas: [] },
    timeToLiquidation: 86_400_000n,
    liquidationPrice: null,
    leverage: 2,
    ...over,
  } as AdjustCreditAccountPreview;
}

const check = (
  preview: AdjustCreditAccountPreview,
  options: Parameters<typeof checkOperation>[1] = {},
) => checkOperation({ sdk, preview }, options);

describe("checkOperation", () => {
  it("finds nothing wrong with a healthy operation", () => {
    expect(check(adjust())).toBeNull();
  });

  it("reports a malformed transaction alone, ahead of everything else", () => {
    // The other checks read fields this verdict just called guesswork, so it
    // is the only thing worth telling the caller.
    const issues = check(
      adjust({
        error: { code: 1002, message: "adapter call outside bracket" },
        healthFactor: 1,
        debt: 10n ** 30n,
      }),
      { minHealthFactor: 10_000 },
    );

    expect(issues).toEqual({
      reason: "malformedTransaction",
      detail: { code: 1002, message: "adapter call outside bracket" },
    });
  });

  it("lets an incomplete evaluation through — it is a caveat, not a refusal", () => {
    expect(
      check(adjust({ error: { code: 2001, message: "no price" } })),
    ).toBeNull();
  });

  it("holds the account to the bar it was given, and to none when given none", () => {
    expect(check(adjust({ healthFactor: 10_000 }))).toBeNull();

    const issues = check(adjust({ healthFactor: 10_000 }), {
      minHealthFactor: 10_101,
    });
    expect(issues).toEqual({
      reason: "insufficientCollateral",
      detail: { healthFactor: 10_000, required: 10_101, safePrices: false },
    });
  });

  it("weighs the safe-price factor against its own bar", () => {
    // Main prices clear 10_000, the safe ones do not: only the safe check fires.
    const issues = check(
      adjust({ healthFactor: 12_500, safeHealthFactor: 9_000 }),
      {
        minHealthFactor: 10_000,
        minSafeHealthFactor: 10_000,
      },
    );

    expect(issues).toEqual({
      reason: "insufficientCollateral",
      detail: { healthFactor: 9_000, required: 10_000, safePrices: true },
    });
  });

  it("leaves a loan-free account alone at every bar", () => {
    expect(
      check(adjust({ debt: 0n, healthFactor: 0, safeHealthFactor: 0 }), {
        minHealthFactor: 10_101,
        minSafeHealthFactor: 10_000,
      }),
    ).toBeNull();
  });

  it("refuses a debt outside the facade's band", () => {
    const issues = check(adjust({ debt: 10n ** 30n }));
    expect(issues?.reason).toBe("debtOutOfRange");
  });

  it("checks the wallet's side only when it is given balances", () => {
    const preview = adjust({
      collateralAdded: [
        { token: toToken(sdk, WETH), value: 10n ** 18n, valueUsd: null },
      ],
    });

    expect(check(preview)).toBeNull();

    const issues = check(preview, {
      balances: new AddressMap<bigint>([[WETH, 1n]]),
    });
    expect(issues?.reason).toBe("insufficientSourceBalance");
  });

  it("judges a delayed operation on the half that executes now", () => {
    const issues = checkOperation({
      sdk,
      preview: {
        operation: "DelayedCreditAccountOperation",
        name: "KPK WETH",
        creditManager: CREDIT_MANAGER,
        creditAccount: CREDIT_ACCOUNT,
        instantPreview: adjust({ debt: 10n ** 30n }),
        delayedPreview: adjust(),
      } as never,
    });

    expect(issues?.reason).toBe("debtOutOfRange");
  });

  it("reports the most fundamental issue when several would fire", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const paused = vi.spyOn(suite, "isPaused", "get").mockReturnValue(true);

    // A paused market, a debt out of band and a factor under the bar at once:
    // the market's own state is the one a caller can do nothing about.
    expect(
      check(adjust({ debt: 10n ** 30n, healthFactor: 1 }), {
        minHealthFactor: 10_101,
      })?.reason,
    ).toBe("marketPaused");

    paused.mockRestore();

    expect(
      check(adjust({ debt: 10n ** 30n, healthFactor: 1 }), {
        minHealthFactor: 10_101,
      })?.reason,
    ).toBe("debtOutOfRange");
  });

  it("refuses a token the market forbids the operation to obtain", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const forbidden = vi
      .spyOn(suite, "forbiddenTokens", "get")
      .mockReturnValue([WETH]);

    const gained = (value: bigint) =>
      check(
        adjust({
          assetsChange: [{ token: toToken(sdk, WETH), value, valueUsd: null }],
        }),
      );

    // Only a balance that grows is refused; the market tolerates one that shrinks.
    expect(gained(1n)).toEqual({
      reason: "forbiddenToken",
      detail: expect.objectContaining({
        token: expect.objectContaining({ address: WETH }),
      }),
    });
    expect(gained(0n)).toBeNull();
    forbidden.mockRestore();
  });

  it("weighs a quota increase against the room the keeper has left", () => {
    const { pqk } =
      sdk.marketRegister.findCreditManager(CREDIT_MANAGER).market.pool;
    const quoted = [...pqk.quotas.keys()][0];
    expect(quoted).toBeDefined();
    const quota = pqk.quotas.get(quoted as Address);
    const room = (quota?.limit ?? 0n) - (quota?.totalQuoted ?? 0n);

    const asking = (value: bigint) =>
      check(
        adjust({
          quotasChange: [
            { token: toToken(sdk, quoted as Address), value, valueUsd: null },
          ],
        }),
      );

    expect(asking(room)).toBeNull();
    expect(asking(room + 1n)?.reason).toBe("quotaLimitReached");
  });

  it("counts a token the market quotes nothing for as no collateral", () => {
    // The same reading the engine's guard takes: no ceiling was measured.
    const issues = check(
      adjust({
        quotasChange: [
          { token: toToken(sdk, WETH), value: 1n, valueUsd: null },
        ],
      }),
    );

    expect(issues).toEqual({
      reason: "quotaLimitReached",
      detail: expect.objectContaining({ requested: undefined }),
    });
  });

  it("leaves a close alone: there is no position left for the bars to weigh", () => {
    // Close and repay carry neither a debt nor a health factor. Reading their
    // absence as an unread factor would refuse every wind-down.
    const issues = checkOperation(
      {
        sdk,
        preview: {
          operation: "CloseCreditAccount",
          name: "KPK WETH",
          creditManager: CREDIT_MANAGER,
          creditAccount: CREDIT_ACCOUNT,
          permanent: true,
        } as never,
      },
      { minHealthFactor: 10_101, minSafeHealthFactor: 10_000 },
    );

    expect(issues).toBeNull();
  });
});

describe("checkOperation — pool operations", () => {
  const deposit = (
    over: Partial<PoolOperationPreview> = {},
  ): PoolOperationPreview =>
    ({
      operation: "Deposit",
      pool: POOL,
      name: "wstETH pool",
      tokenIn: {
        token: toToken(sdk, WSTETH),
        value: 10n ** 18n,
        valueUsd: null,
      },
      tokenOut: {
        token: toToken(sdk, POOL),
        value: 10n ** 18n,
        valueUsd: null,
      },
      ...over,
    }) as PoolOperationPreview;

  it("passes a deposit into a live pool", () => {
    expect(checkOperation({ sdk, preview: deposit() })).toBeNull();
  });

  it("checks what the wallet puts in when it is given balances", () => {
    const issues = checkOperation(
      { sdk, preview: deposit() },
      { balances: new AddressMap<bigint>([[WSTETH, 1n]]) },
    );

    expect(issues).toEqual({
      reason: "insufficientSourceBalance",
      detail: {
        required: expect.objectContaining({ value: 10n ** 18n }),
        held: expect.objectContaining({ value: 1n }),
      },
    });
  });

  it("blocks a malformed pool transaction the same way", () => {
    const issues = checkOperation({
      sdk,
      preview: deposit({ error: { code: 1006, message: "bad value" } }),
    });

    expect(issues?.reason).toBe("malformedTransaction");
  });

  it("lets a withdrawal out of a pool that takes no more deposits", () => {
    // Sunset is curated per chain; this fixture's pool is not on the list, so
    // the check stands down for both directions — what it must never do is
    // refuse a payout.
    const withdraw = deposit({ operation: "Withdraw" });
    expect(checkOperation({ sdk, preview: withdraw })).toBeNull();
  });

  it("refuses a payout the pool exactly holds, and serves one below it", () => {
    const { availableLiquidity } =
      sdk.marketRegister.findByPool(POOL).pool.pool;

    const withdraw = (value: bigint) =>
      checkOperation({
        sdk,
        preview: deposit({
          operation: "Withdraw",
          tokenOut: {
            token: toToken(sdk, WSTETH),
            value,
            valueUsd: null,
          },
        }),
      });

    expect(withdraw(availableLiquidity)?.reason).toBe(
      "insufficientPoolLiquidity",
    );
    expect(withdraw(availableLiquidity - 1n)).toBeNull();
  });

  it("does not weigh the pool's liquidity against a deposit", () => {
    const { availableLiquidity } =
      sdk.marketRegister.findByPool(POOL).pool.pool;

    expect(
      checkOperation({
        sdk,
        preview: deposit({
          tokenOut: {
            token: toToken(sdk, POOL),
            value: availableLiquidity * 2n,
            valueUsd: null,
          },
        }),
      }),
    ).toBeNull();
  });
});
