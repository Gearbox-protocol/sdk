import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { type Address, custom } from "viem";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { TokenAmount } from "../../model/index.js";
import type { OperationState, PoolSimulation } from "../index.js";
import { json_parse, OnchainSDK, toToken } from "../index.js";
import { checkSimulation } from "./checkSimulation.js";

const STATE_FIXTURE = resolve(
  import.meta.dirname,
  "../../preview/__fixtures__/Mainnet-25475508-adjust-credit-account.json",
);

const CREDIT_MANAGER: Address = "0x79C6C1ce5B12abCC3E407ce8C160eE1160250921";
const POOL: Address = "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64";
const WSTETH: Address = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";

/**
 * An underlying-denominated amount. A quota entry names the collateral it was
 * bought for while the amount stays in underlying, so the token is a parameter.
 */
const und = (
  value: bigint,
  address: Address = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
): TokenAmount => ({
  token: {
    chainId: 1,
    address,
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
        throw new Error("offline: checkSimulation must not hit RPC");
      },
    }),
  });
  sdk.hydrate(json_parse(readFileSync(STATE_FIXTURE, "utf-8")));
});

/** A healthy projected state, as the engine reports one. */
function state(over: Partial<OperationState> = {}): OperationState {
  return {
    healthFactor: 12_500,
    safeHealthFactor: 11_800,
    borrowRate: { total: 300, totalOnDebt: 320, base: 250, quotas: [] },
    timeToLiquidation: 86_400_000n,
    liquidationPrice: null,
    creditManager: CREDIT_MANAGER,
    name: "KPK WETH",
    underlyingToken: { ...und(0n).token, wrappedAddress: null },
    totalValue: und(10n ** 20n),
    totalDebt: und(41_574_436_328_452_499_320n),
    netValue: und(10n ** 20n - 41_574_436_328_452_499_320n),
    leverage: 2,
    assets: [],
    quotas: [],
    priceImpact: undefined,
    ...over,
  } as OperationState;
}

const check = (
  over: Partial<OperationState> = {},
  options: Parameters<typeof checkSimulation>[1] = {},
) => checkSimulation({ sdk, state: state(over) }, options);

/** The codes the check reported, in the order it reported them. */
const codes = (
  errors: ReturnType<typeof checkSimulation>,
): ReadonlyArray<string> => errors.map(e => e.code);

describe("checkSimulation", () => {
  it("finds nothing wrong with a simulation the engine accepted", () => {
    expect(check()).toEqual([]);
  });

  it("holds the account to the caller's threshold, which the engine does not", () => {
    // The engine returns `ok` for anything landing at 1.0; a form asks for more.
    expect(check({ healthFactor: 10_050 })).toEqual([]);
    expect(
      check({ healthFactor: 10_050 }, { minHealthFactor: 10_101 }),
    ).toMatchObject([
      {
        code: "insufficientCollateral",
        healthFactor: 10_050,
        healthFactorThreshold: 10_101,
        safePrices: false,
      },
    ]);
  });

  it("lets a rescue through and reports an operation that does not improve", () => {
    const at = (currentHealthFactor: number) =>
      check(
        { healthFactor: 10_080 },
        {
          minHealthFactor: 10_101,
          currentHealthFactor,
        },
      );

    expect(at(10_050)).toEqual([]);
    expect(codes(at(10_090))).toEqual(["insufficientCollateral"]);
  });

  it("weighs the safe-price factor against its own threshold", () => {
    // The threshold only applies where the caller names one: it is what the
    // credit manager holds a call handing funds over to.
    expect(check({ safeHealthFactor: 10_000 })).toEqual([]);

    expect(
      check({ safeHealthFactor: 10_000 }, { minSafeHealthFactor: 10_001 }),
    ).toMatchObject([
      {
        code: "insufficientCollateral",
        healthFactor: 10_000,
        healthFactorThreshold: 10_001,
        safePrices: true,
      },
    ]);

    expect(
      check({ safeHealthFactor: 10_001 }, { minSafeHealthFactor: 10_001 }),
    ).toEqual([]);
  });

  it("counts quoted tokens against the facade's cap, which the engine never does", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const cap = vi
      .spyOn(suite.creditManager, "maxEnabledTokens", "get")
      .mockReturnValue(1);

    const quotas = [
      und(1n, "0x1111111111111111111111111111111111111111"),
      und(1n, "0x2222222222222222222222222222222222222222"),
    ];

    expect(check({ quotas })).toMatchObject([
      {
        code: "quotaCountExceeded",
        count: 2,
        max: 1,
      },
    ]);
    cap.mockRestore();
  });

  it("leaves a loan-free account alone at every threshold", () => {
    expect(
      check(
        { totalDebt: und(0n), healthFactor: 0 },
        {
          minHealthFactor: 10_101,
          minSafeHealthFactor: 10_001,
        },
      ),
    ).toEqual([]);
  });

  it("reports the market's own state ahead of anything else", () => {
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const paused = vi.spyOn(suite, "isPaused", "get").mockReturnValue(true);

    expect(
      codes(check({ healthFactor: 1 }, { minHealthFactor: 10_101 })),
    ).toEqual(["creditManagerPaused", "insufficientCollateral"]);
    paused.mockRestore();
  });
});

/**
 * A pool operation has no account to weigh, so what is left is the pool's own
 * state — which the engine reads no more than it reads a form's thresholds.
 */
describe("checkSimulation — pool operations", () => {
  const simulation = (over: Partial<PoolSimulation> = {}): PoolSimulation => ({
    tokenIn: { token: toToken(sdk, POOL), value: 10n ** 18n, valueUsd: null },
    tokenOut: {
      token: toToken(sdk, WSTETH),
      value: 10n ** 18n,
      valueUsd: null,
    },
    ...over,
  });

  const available = () =>
    sdk.marketRegister.findByPool(POOL).pool.pool.availableLiquidity;

  it("passes a withdrawal the pool can serve", () => {
    expect(
      checkSimulation({
        sdk,
        pool: POOL,
        state: simulation(),
        isDeposit: false,
      }),
    ).toEqual([]);
  });

  it("reports a withdrawal past what the pool holds", () => {
    expect(
      codes(
        checkSimulation({
          sdk,
          pool: POOL,
          state: simulation({
            tokenOut: {
              token: toToken(sdk, WSTETH),
              value: available(),
              valueUsd: null,
            },
          }),
          isDeposit: false,
        }),
      ),
    ).toEqual(["insufficientPoolLiquidity"]);
  });

  it("does not weigh the pool's liquidity against a deposit", () => {
    expect(
      checkSimulation({
        sdk,
        pool: POOL,
        state: simulation({
          tokenOut: {
            token: toToken(sdk, POOL),
            value: available() * 2n,
            valueUsd: null,
          },
        }),
        isDeposit: true,
      }),
    ).toEqual([]);
  });

  it("reports a paused pool whichever way the liquidity moves", () => {
    const { pool } = sdk.marketRegister.findByPool(POOL);
    const paused = vi.spyOn(pool.pool, "isPaused", "get").mockReturnValue(true);

    for (const isDeposit of [true, false]) {
      expect(
        codes(
          checkSimulation({ sdk, pool: POOL, state: simulation(), isDeposit }),
        ),
      ).toEqual(["poolPaused"]);
    }
    paused.mockRestore();
  });
});
