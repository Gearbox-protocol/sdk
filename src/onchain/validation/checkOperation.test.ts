import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
  AdjustStrategyPositionPreview,
  OpenStrategyPositionPreview,
  PoolPositionOperationPreview,
  TokenAmount,
} from "../../model/index.js";
import { AddressMap, json_parse, OnchainSDK, toToken } from "../index.js";
import { checkOperation } from "./checkOperation.js";

/**
 * The same offline state dump the preview tests run on: the client throws on
 * any RPC request, so a green run is also the proof that validating a parsed
 * transaction needs no chain reads.
 */
const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../../preview/__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);

const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";
const CREDIT_ACCOUNT: Address = "0xE22cEd1808c22455747F366Cf94d45B3201302d3";
const WETH: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const POOL: Address = "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64";
const WSTETH: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";

/** An underlying-denominated amount, which is what the projection reports in. */
const und = (value: bigint): TokenAmount => ({
  token: {
    chainId: 1,
    address: WETH,
    symbol: "WETH",
    name: "Wrapped Ether",
    decimals: 18,
  },
  value,
  valueUsd: null,
});

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
  over: Partial<AdjustStrategyPositionPreview> = {},
): AdjustStrategyPositionPreview {
  return {
    operation: "AdjustCreditAccount",
    name: "KPK WETH",
    underlyingToken: { ...und(0n).token, wrappedAddress: null },
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    targetCollateral: null,
    collateralAdded: [],
    collateralWithdrawn: [],
    estTotalValue: und(10n ** 20n),
    totalDebt: und(41_574_436_328_452_499_320n),
    totalDebtChange: und(0n),
    estAssets: [],
    assetsChange: [],
    quotas: [],
    quotasChange: [],
    estHealthFactor: 12_500,
    estSafeHealthFactor: 11_800,
    estBorrowRate: { total: 300, totalOnDebt: 320, base: 250, quotas: [] },
    estTimeToLiquidation: 86_400_000n,
    estLiquidationPrice: null,
    estLeverage: 2,
    ...over,
  } as AdjustStrategyPositionPreview;
}

/** The same account at the moment it is opened, as the preview reports one. */
function open(
  over: Partial<OpenStrategyPositionPreview> = {},
): OpenStrategyPositionPreview {
  return {
    operation: "OpenCreditAccount",
    name: "KPK WETH",
    underlyingToken: { ...und(0n).token, wrappedAddress: null },
    creditManager: CREDIT_MANAGER,
    collateralAdded: [],
    estNetValue: und(10n ** 19n),
    estTotalValue: und(10n ** 20n),
    totalDebt: und(41_574_436_328_452_499_320n),
    estAssets: [],
    quotas: [],
    estHealthFactor: 12_500,
    estSafeHealthFactor: 11_800,
    estBorrowRate: { total: 300, totalOnDebt: 320, base: 250, quotas: [] },
    estTimeToLiquidation: 86_400_000n,
    estLiquidationPrice: null,
    estLeverage: 2,
    ...over,
  } as OpenStrategyPositionPreview;
}

const check = (
  preview: AdjustStrategyPositionPreview | OpenStrategyPositionPreview,
  options: Parameters<typeof checkOperation>[1] = {},
) => checkOperation({ sdk, preview }, options);

/** The codes the check reported, in the order it reported them. */
const codes = (
  errors: ReturnType<typeof checkOperation>,
): ReadonlyArray<string> => errors.map(e => e.code);

describe("checkOperation", () => {
  it("finds nothing wrong with a healthy operation", () => {
    expect(check(adjust())).toEqual([]);
  });

  it("reports a malformed transaction alone, ahead of everything else", () => {
    // The other checks read fields this error just called guesswork, so it is
    // the only thing worth telling the caller.
    const errors = check(
      adjust({
        warning: {
          code: "adapterCallOutsideBracket",
          message: "adapter call outside bracket",
          adapter: CREDIT_MANAGER,
        },
        estHealthFactor: 1,
        totalDebt: und(10n ** 30n),
      }),
      { minHealthFactor: 10_000 },
    );

    expect(errors).toMatchObject([
      {
        code: "malformedTransaction",
        warning: {
          code: "adapterCallOutsideBracket",
          message: "adapter call outside bracket",
          adapter: CREDIT_MANAGER,
        },
      },
    ]);
  });

  it("lets an incomplete evaluation through — it is a caveat, not a verdict", () => {
    expect(
      check(
        adjust({
          warning: {
            code: "unpriceableToken",
            message: "no price",
            token: WETH,
          },
        }),
      ),
    ).toEqual([]);
  });

  it("holds the account to the threshold it was given, and to none when given none", () => {
    expect(check(adjust({ estHealthFactor: 10_000 }))).toEqual([]);

    const errors = check(adjust({ estHealthFactor: 10_000 }), {
      minHealthFactor: 10_101,
    });
    expect(errors).toMatchObject([
      {
        code: "insufficientCollateral",
        healthFactor: 10_000,
        healthFactorThreshold: 10_101,
        safePrices: false,
      },
    ]);
  });

  it("lets a rescue through: an account under the threshold being topped up", () => {
    // Broken today: the form passes it (the engine holds only the facade's 1.0)
    // and the confirm screen stops it, so a position cannot be rescued through
    // the interface at all.
    expect(
      check(adjust({ estHealthFactor: 10_080 }), {
        minHealthFactor: 10_101,
        currentHealthFactor: 10_050,
      }),
    ).toEqual([]);

    expect(
      codes(
        check(adjust({ estHealthFactor: 10_080 }), {
          minHealthFactor: 10_101,
          currentHealthFactor: 10_090,
        }),
      ),
    ).toEqual(["insufficientCollateral"]);
  });

  it("weighs the safe-price factor against its own threshold", () => {
    // Main prices clear 10_000, the safe ones do not: only the safe check fires.
    const errors = check(
      adjust({ estHealthFactor: 12_500, estSafeHealthFactor: 9_000 }),
      {
        minHealthFactor: 10_000,
        minSafeHealthFactor: 10_000,
      },
    );

    expect(errors).toMatchObject([
      {
        code: "insufficientCollateral",
        healthFactor: 9_000,
        healthFactorThreshold: 10_000,
        safePrices: true,
      },
    ]);
  });

  /**
   * The safe-price threshold is weighed only when the caller names one — it is
   * what the credit manager holds a call handing funds over to, and a
   * transaction that hands nothing over is not judged at those prices. Pinned
   * along with the main threshold still firing beside it.
   */
  it("skips the safe-price threshold, not the main one, when no safe threshold is named", () => {
    expect(
      check(
        adjust({ estHealthFactor: 12_500, estSafeHealthFactor: 11_800 }),
        {},
      ),
    ).toEqual([]);

    expect(
      check(adjust({ estHealthFactor: 9_000, estSafeHealthFactor: 8_500 }), {
        minHealthFactor: 10_000,
      }),
    ).toMatchObject([
      {
        code: "insufficientCollateral",
        healthFactor: 9_000,
        healthFactorThreshold: 10_000,
        safePrices: false,
      },
    ]);
  });

  /**
   * An account being opened is weighed on the safe factor too. It was not
   * before: the legacy gate reached only the adjust flow, and the omission was
   * invisible while nothing reported the safe factor.
   */
  it("weighs the safe-price factor on an account being opened as well", () => {
    expect(
      check(open({ estHealthFactor: 12_500, estSafeHealthFactor: 9_000 }), {
        minHealthFactor: 10_000,
        minSafeHealthFactor: 10_000,
      }),
    ).toMatchObject([
      {
        code: "insufficientCollateral",
        healthFactor: 9_000,
        healthFactorThreshold: 10_000,
        safePrices: true,
      },
    ]);

    expect(
      check(open(), {
        minHealthFactor: 10_101,
        minSafeHealthFactor: 10_001,
      }),
    ).toEqual([]);
  });

  it("leaves a loan-free account alone at every threshold", () => {
    expect(
      check(
        adjust({
          totalDebt: und(0n),
          estHealthFactor: 0,
          estSafeHealthFactor: 0,
        }),
        {
          minHealthFactor: 10_101,
          minSafeHealthFactor: 10_000,
        },
      ),
    ).toEqual([]);
  });

  /**
   * The engine holds every simulation to the market's lending ceiling; a parsed
   * transaction was never simulated, so this is the only thing between a pasted
   * calldata and a revert.
   */
  describe("what the market can lend right now", () => {
    /** The fixture's pool, with its lendable amount forced. */
    const withLiquidity = (available: bigint) => {
      const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
      return vi
        .spyOn(suite.market.pool.pool, "availableLiquidity", "get")
        .mockReturnValue(available);
    };

    it("reports a draw the pool cannot cover", () => {
      const spy = withLiquidity(1n);
      try {
        expect(
          codes(check(adjust({ totalDebtChange: und(10n ** 20n) }))),
        ).toEqual(["insufficientPoolLiquidity"]);
      } finally {
        spy.mockRestore();
      }
    });

    it("weighs the whole debt of an account being opened", () => {
      const spy = withLiquidity(1n);
      try {
        expect(codes(check(open()))).toEqual(["insufficientPoolLiquidity"]);
      } finally {
        spy.mockRestore();
      }
    });

    /** Repaying, or leaving the debt alone, can never exceed a ceiling. */
    it.each([0n, -(10n ** 20n)])(
      "leaves a totalDebtChange of %s alone however dry the pool is",
      change => {
        const spy = withLiquidity(0n);
        try {
          expect(check(adjust({ totalDebtChange: und(change) }))).toEqual([]);
        } finally {
          spy.mockRestore();
        }
      },
    );

    it("serves a draw the pool covers", () => {
      const spy = withLiquidity(10n ** 30n);
      try {
        expect(check(adjust({ totalDebtChange: und(10n ** 18n) }))).toEqual([]);
      } finally {
        spy.mockRestore();
      }
    });
  });

  it("reports a debt outside the facade's debtLimits", () => {
    expect(codes(check(adjust({ totalDebt: und(10n ** 30n) })))).toEqual([
      "debtOutOfRange",
    ]);
  });

  it("checks the wallet's side only when it is given balances", () => {
    const preview = adjust({
      collateralAdded: [
        { token: toToken(sdk, WETH), value: 10n ** 18n, valueUsd: null },
      ],
    });

    expect(check(preview)).toEqual([]);

    expect(
      codes(
        check(preview, {
          balances: new AddressMap<bigint>([[WETH, 1n]]),
        }),
      ),
    ).toEqual(["insufficientBalance"]);
  });

  it("judges a delayed operation on the half that executes now", () => {
    const errors = checkOperation({
      sdk,
      preview: {
        operation: "DelayedCreditAccountOperation",
        name: "KPK WETH",
        underlyingToken: { ...und(0n).token, wrappedAddress: null },
        creditManager: CREDIT_MANAGER,
        creditAccount: CREDIT_ACCOUNT,
        instantPreview: adjust({ totalDebt: und(10n ** 30n) }),
        delayedPreview: adjust(),
      } as never,
    });

    expect(codes(errors)).toEqual(["debtOutOfRange"]);
  });

  it("orders what it found, most fundamental first", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const paused = vi.spyOn(suite, "isPaused", "get").mockReturnValue(true);

    // A paused market, a debt outside debtLimits and a factor under the
    // threshold at once: the market's own state is the one a caller can do
    // nothing about, so it leads.
    expect(
      codes(
        check(adjust({ totalDebt: und(10n ** 30n), estHealthFactor: 1 }), {
          minHealthFactor: 10_101,
        }),
      ),
    ).toEqual([
      "creditManagerPaused",
      "debtOutOfRange",
      "insufficientCollateral",
    ]);

    paused.mockRestore();

    expect(
      codes(
        check(adjust({ totalDebt: und(10n ** 30n), estHealthFactor: 1 }), {
          minHealthFactor: 10_101,
        }),
      ),
    ).toEqual(["debtOutOfRange", "insufficientCollateral"]);
  });

  it("reports a token the market forbids the operation to obtain", () => {
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

    // Only a balance that grows is reported; the market tolerates one that
    // shrinks.
    expect(gained(1n)).toMatchObject([
      {
        code: "forbiddenToken",
        token: expect.objectContaining({ address: WETH }),
      },
    ]);
    expect(gained(0n)).toEqual([]);
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

    expect(asking(room)).toEqual([]);
    expect(codes(asking(room + 1n))).toEqual(["quotaLimitReached"]);
  });

  it("counts a token the market quotes nothing for as no collateral", () => {
    // The same reading the engine's guard takes: no ceiling was measured.
    expect(
      check(
        adjust({
          quotasChange: [
            { token: toToken(sdk, WETH), value: 1n, valueUsd: null },
          ],
        }),
      ),
    ).toMatchObject([
      {
        code: "quotaLimitReached",
        requested: undefined,
      },
    ]);
  });

  it("leaves a close alone: the thresholds do not weigh a wound-down account", () => {
    // Close and repay now carry a projection, but the loan is gone, so the
    // health-factor thresholds would no-op. Only the market's own state can
    // stop one, and this fixture's market is live.
    const errors = checkOperation(
      {
        sdk,
        preview: {
          operation: "CloseCreditAccount",
          name: "KPK WETH",
          underlyingToken: { ...und(0n).token, wrappedAddress: null },
          creditManager: CREDIT_MANAGER,
          creditAccount: CREDIT_ACCOUNT,
          permanent: true,
        } as never,
      },
      { minHealthFactor: 10_101, minSafeHealthFactor: 10_000 },
    );

    expect(errors).toEqual([]);
  });
});

describe("checkOperation — pool operations", () => {
  const deposit = (
    over: Partial<PoolPositionOperationPreview> = {},
  ): PoolPositionOperationPreview =>
    ({
      operation: "Deposit",
      pool: POOL,
      name: "wstETH pool",
      underlyingToken: {
        chainId: 1,
        address: WSTETH,
        symbol: "wstETH",
        name: "Wrapped liquid staked Ether 2.0",
        decimals: 18,
        wrappedAddress: null,
      },
      shareRate: 10n ** 27n,
      curator: { address: POOL, url: null },
      netValue: {
        token: {
          chainId: 1,
          address: WSTETH,
          symbol: "wstETH",
          name: "Wrapped liquid staked Ether 2.0",
          decimals: 18,
        },
        value: 10n ** 18n,
        valueUsd: null,
      },
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
    }) as PoolPositionOperationPreview;

  it("passes a deposit into a live pool", () => {
    expect(checkOperation({ sdk, preview: deposit() })).toEqual([]);
  });

  it("checks what the wallet puts in when it is given balances", () => {
    const errors = checkOperation(
      { sdk, preview: deposit() },
      { balances: new AddressMap<bigint>([[WSTETH, 1n]]) },
    );

    expect(errors).toMatchObject([
      {
        code: "insufficientBalance",
        required: expect.objectContaining({ value: 10n ** 18n }),
        held: expect.objectContaining({ value: 1n }),
      },
    ]);
  });

  it("blocks a malformed pool transaction the same way", () => {
    const errors = checkOperation({
      sdk,
      preview: deposit({
        warning: {
          code: "invalidTransactionValue",
          message: "bad value",
          value: 1n,
          wethCollateral: 0n,
        },
      }),
    });

    expect(codes(errors)).toEqual(["malformedTransaction"]);
  });

  it("lets a withdrawal out of a pool that takes no more deposits", () => {
    // Sunset is curated per chain; this fixture's pool is not on the list, so
    // the check stands down for both directions — what it must never do is
    // stop a withdrawal.
    const withdraw = deposit({ operation: "Withdraw" });
    expect(checkOperation({ sdk, preview: withdraw })).toEqual([]);
  });

  it("stops a withdrawal the pool exactly holds, and serves one below it", () => {
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

    expect(codes(withdraw(availableLiquidity))).toEqual([
      "insufficientPoolLiquidity",
    ]);
    expect(withdraw(availableLiquidity - 1n)).toEqual([]);
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
    ).toEqual([]);
  });
});
