import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { RAY } from "../constants/index.js";
import {
  MockTokens,
  TestPriceOracle,
} from "../market/oracle/TestPriceOracle.mock.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { PoolService } from "./PoolService.js";

const POOL = "0x1111111111111111111111111111111111111111" as Address;
const UNDERLYING = MockTokens.WETH;
/** Zapper input: what the user pays in on a routed deposit. */
const USDC = MockTokens.USDC;
/** Zapper output: the farmed diesel wrapper the user ends up holding. */
const FARM_TOKEN = "0x4444444444444444444444444444444444444444" as Address;
const ZAPPER = "0x5555555555555555555555555555555555555555" as Address;

const priceOracle = new TestPriceOracle({
  [POOL]: {},
  [UNDERLYING]: {},
  [USDC]: {},
  [FARM_TOKEN]: {},
});

/** What the stub oracle prices an amount as; the tests pin it whole. */
const amt = (address: Address, value: bigint) =>
  priceOracle.toTokenAmount(address, value);

interface MockZapper {
  addr: Address;
  tokenIn: Address;
  tokenOut: Address;
}

/** Zapper straight into the pool shares, so USDC also becomes a deposit input. */
const USDC_TO_POOL: MockZapper = {
  addr: ZAPPER,
  tokenIn: USDC,
  tokenOut: POOL,
};

/** Zapper into a farm wrapper — a second output for the same underlying. */
const UNDERLYING_TO_FARM: MockZapper = {
  addr: ZAPPER,
  tokenIn: UNDERLYING,
  tokenOut: FARM_TOKEN,
};

interface MockPool {
  /** Shares outstanding. */
  totalSupply?: bigint;
  /** Underlying those shares are worth, so the pair fixes the share rate. */
  totalAssets?: bigint;
  /** In PERCENTAGE_FORMAT, taken off a redemption's proceeds. */
  withdrawFee?: bigint;
  zappers?: MockZapper[];
}

/** A share worth 1.1 underlying, so the two directions cannot be confused. */
const TOTAL_SUPPLY = 1_000_000n;
const TOTAL_ASSETS = 1_100_000n;

function buildService(args: MockPool = {}) {
  const totalSupply = args.totalSupply ?? TOTAL_SUPPLY;
  const totalAssets = args.totalAssets ?? TOTAL_ASSETS;
  // the rate the pool converts by, derived as the pool derives it
  const dieselRate =
    totalSupply === 0n ? RAY : (totalAssets * RAY) / totalSupply;

  const zappers = (args.zappers ?? []).map(z => ({
    type: "zapper",
    baseParams: { addr: z.addr },
    tokenIn: { addr: z.tokenIn },
    tokenOut: { addr: z.tokenOut },
  }));

  const sdk = {
    client: { chain: { id: 1 } },
    labelAddress: (a: Address) => a,
    tokensMeta: {
      isRWAUnderlying: () => false,
      mustGet: () => ({ addr: UNDERLYING }),
    },
    marketRegister: {
      findByPool: () => ({
        underlying: UNDERLYING,
        // what the market names a figure already in its underlying: on an RWA
        // market the unwrapped asset, here the underlying itself
        toUnderlyingAmount: (value: bigint) => amt(UNDERLYING, value),
        // the read-model mappers the simulation prices its amounts with
        priceOracle,
        pool: {
          underlying: UNDERLYING,
          pool: {
            address: POOL,
            availableLiquidity: 1_000_000n,
            totalSupply,
            totalAssets,
            dieselRate,
            withdrawFee: args.withdrawFee ?? 0n,
            sharesToUnderlying: (shares: bigint) =>
              dieselRate === 0n ? shares : (shares * dieselRate) / RAY,
            underlyingToShares: (underlying: bigint, roundUp = false) => {
              if (dieselRate === 0n) {
                return underlying;
              }
              return roundUp
                ? (underlying * RAY + dieselRate - 1n) / dieselRate
                : (underlying * RAY) / dieselRate;
            },
          },
        },
      }),
      poolZappers: () => zappers,
      getZapper: (_pool: Address, tokenIn: Address, tokenOut: Address) =>
        zappers.filter(
          z => z.tokenIn.addr === tokenIn && z.tokenOut.addr === tokenOut,
        ),
    },
  } as unknown as OnchainSDK;

  return new PoolService(sdk);
}

describe("PoolService.simulateDeposit", () => {
  it("defaults to the underlying and converts it at the share rate", () => {
    // 100 underlying at 1.1 per share, rounded down as minting does
    expect(
      buildService().simulateDeposit({ pool: POOL, amount: 100n }),
    ).toEqual({
      tokenIn: amt(UNDERLYING, 100n),
      tokenOut: amt(POOL, 90n),
      zapper: undefined,
    });
  });

  it("converts at the same rate through a zapper, which only wraps", () => {
    const service = buildService({ zappers: [USDC_TO_POOL] });

    expect(
      service.simulateDeposit({ pool: POOL, amount: 1_000n, tokenIn: USDC }),
    ).toEqual({
      tokenIn: amt(USDC, 1_000n),
      tokenOut: amt(POOL, 909n),
      zapper: ZAPPER,
    });
  });

  it("mints one-for-one into an empty pool, which has no rate yet", () => {
    const service = buildService({ totalSupply: 0n, totalAssets: 0n });

    expect(service.simulateDeposit({ pool: POOL, amount: 100n })).toEqual({
      tokenIn: amt(UNDERLYING, 100n),
      tokenOut: amt(POOL, 100n),
      zapper: undefined,
    });
  });

  it("requires tokenOut when the underlying has more than one route", () => {
    const service = buildService({ zappers: [UNDERLYING_TO_FARM] });

    expect(() => service.simulateDeposit({ pool: POOL, amount: 100n })).toThrow(
      /tokenOut is required: 2 deposit routes/,
    );
  });
});

/** 1_000_000 shaved by the safety haircut. */
const LIQUIDITY = 999_990n;

describe("PoolService.simulateWithdraw", () => {
  it("prices the shares an exact underlying withdrawal would cost", () => {
    expect(
      buildService().simulateWithdraw({ pool: POOL, amount: 120n }),
    ).toEqual({
      tokenIn: amt(POOL, 110n),
      tokenOut: amt(UNDERLYING, 120n),
      zapper: undefined,
      availableLiquidity: { value: LIQUIDITY, valueUsd: null },
    });
  });

  it("prices a zapper withdrawal in the share token it wraps", () => {
    const service = buildService({ zappers: [UNDERLYING_TO_FARM] });

    expect(
      service.simulateWithdraw({
        pool: POOL,
        amount: 480n,
        tokenIn: FARM_TOKEN,
      }),
    ).toEqual({
      tokenIn: amt(FARM_TOKEN, 437n),
      tokenOut: amt(UNDERLYING, 480n),
      zapper: ZAPPER,
      availableLiquidity: { value: LIQUIDITY, valueUsd: null },
    });
  });

  it("inflates the share burn for the pool's withdrawal fee", () => {
    const service = buildService({ withdrawFee: 100n });

    expect(
      service.simulateWithdraw({ pool: POOL, amount: 9900n }),
    ).toMatchObject({
      tokenIn: amt(POOL, 9091n),
    });
  });
});

describe("PoolService.simulateRedeem", () => {
  it("defaults to pool shares and converts them back to underlying", () => {
    expect(buildService().simulateRedeem({ pool: POOL, amount: 120n })).toEqual(
      {
        tokenIn: amt(POOL, 120n),
        tokenOut: amt(UNDERLYING, 132n),
        zapper: undefined,
        availableLiquidity: { value: LIQUIDITY, valueUsd: null },
      },
    );
  });

  it("takes the pool's withdrawal fee off the proceeds", () => {
    const service = buildService({ withdrawFee: 100n });

    expect(service.simulateRedeem({ pool: POOL, amount: 120n })).toMatchObject({
      tokenOut: amt(UNDERLYING, 130n),
    });
  });

  it("burns the farm wrapper at the pool's own rate", () => {
    const service = buildService({ zappers: [UNDERLYING_TO_FARM] });

    expect(
      service.simulateRedeem({
        pool: POOL,
        amount: 480n,
        tokenIn: FARM_TOKEN,
      }),
    ).toEqual({
      tokenIn: amt(FARM_TOKEN, 480n),
      tokenOut: amt(UNDERLYING, 528n),
      zapper: ZAPPER,
      availableLiquidity: { value: LIQUIDITY, valueUsd: null },
    });
  });
});
