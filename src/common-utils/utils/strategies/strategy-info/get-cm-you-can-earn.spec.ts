import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { toBN } from "../../../../sdk/utils/formatter.js";
import type { TokenData } from "../../../charts/token-data.js";
import {
  buildCreditManager,
  buildPool,
  buildQuota,
  buildTokenData,
} from "../../../test-utils/index.js";
import type { Strategy } from "../types/strategy.js";
import type { APYList, PoolData } from "../types/strategy-data.js";
import { getCMYouCanEarn } from "./get-cm-you-can-earn.js";

describe("getCMYouCanEarn", () => {
  const collateralTokenAddress: Address =
    "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee";
  const targetTokenAddress: Address =
    "0xe72b141df173b999ae7c1adcbf60cc9833ce56a8";
  const underlyingTokenAddress: Address =
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const deth: Address = "0x871ab8e36cae9af35c6a3488b049965233deb7ed";

  const nativeTokenAddress: Address =
    "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const wrappedNativeTokenAddress: Address = underlyingTokenAddress;

  const tokenDataList: Record<Address, TokenData> = {
    [collateralTokenAddress]: buildTokenData(collateralTokenAddress, "weETH"),
    [targetTokenAddress]: buildTokenData(targetTokenAddress, "ethPlus"),
    [underlyingTokenAddress]: buildTokenData(underlyingTokenAddress, "WETH"),
    [nativeTokenAddress]: buildTokenData(nativeTokenAddress, "ETH"),
    [deth]: buildTokenData(deth, "dETH"),
  };

  const poolAddress: Address = "0x0000000000000000000000000000000000000POOL";
  const creditManagerAddress: Address =
    "0x0000000000000000000000000000000000000CM1";

  const creditManager = buildCreditManager({
    address: creditManagerAddress,
    pool: poolAddress,
    underlyingToken: underlyingTokenAddress,
    collateralTokens: [
      collateralTokenAddress,
      underlyingTokenAddress,
      targetTokenAddress,
      deth,
    ],
    supportedTokens: {
      [collateralTokenAddress]: true,
      [underlyingTokenAddress]: true,
      [targetTokenAddress]: true,
      [deth]: true,
    },
    liquidationThresholds: {
      [collateralTokenAddress]: 9300n,
      [targetTokenAddress]: 9300n,
      [underlyingTokenAddress]: 9500n,
      [deth]: 8800n,
    },
    quotas: {
      [targetTokenAddress]: buildQuota({
        isActive: true,
        limit: 5000000000000000000000n,
        quotaIncreaseFee: 0n,
        rate: 100n,
        token: "0xe72b141df173b999ae7c1adcbf60cc9833ce56a8",
        totalQuoted: 1708445825184283030000n,
      }),
      [collateralTokenAddress]: buildQuota({
        token: collateralTokenAddress,
        rate: 0n,
        limit: toBN("1000000", 18),
      }),
      [deth]: buildQuota({
        isActive: true,
        limit: 500000000000000000000n,
        quotaIncreaseFee: 0n,
        rate: 100n,
        token: deth,
        totalQuoted: 28666207338545540000n,
      }),
    },
    isQuoted: (t: Address) => t.toLowerCase() !== underlyingTokenAddress,
    feeInterest: 2000,
    isPaused: false,
    baseBorrowRate: 18991,
    maxDebt: 250000000000000000000n,
    minDebt: 10000000000000000000n,
    availableToBorrow: 859640767327531138355n,
  });

  const pools: Record<Address, PoolData> = {
    [poolAddress]: buildPool({
      address: poolAddress,
      chainId: 1,
      network: "Mainnet",
      underlyingToken: underlyingTokenAddress,
      dieselToken: poolAddress,
      isPaused: false,
      version: 310,

      expectedLiquidity: 5596004266940175413222n,
      expectedLiquidityLimit: 6903325375622920584635n,
      availableLiquidity: 1307321108682745171413n,

      interestModel: {
        interestModel: "0x12e6e5c6fe4b37576dd4052e03a97ee7b9c29e86",
        U_1: 7000n,
        U_2: 9200n,
        R_base: 0n,
        R_slope1: 113n,
        R_slope2: 150n,
        R_slope3: 1236n,
        version: 310,
        isBorrowingMoreU2Forbidden: true,
      },
    }),
  };

  const allPrices = {
    [poolAddress]: {
      [collateralTokenAddress]: 347896889077n,
      [targetTokenAddress]: 342474099875n,
      [underlyingTokenAddress]: 320438727057n,
      [deth]: 322630065873n,
    },
  };

  const walletBalances = {
    [underlyingTokenAddress]: 0n,
    [collateralTokenAddress]: 6191758000000000000n,
    [targetTokenAddress]: 0n,
  };

  const apyList = {
    apyList: {
      [targetTokenAddress]: 24600,
      [collateralTokenAddress]: 27612,
      [deth]: 16600,
    },
    extraCollateralAPYList: {
      [poolAddress]: {
        [targetTokenAddress]: {
          address: targetTokenAddress,
          pool: poolAddress,
          symbol: "ETHPlus",
          type: "relative",
          value: 0,
        },
      },
    },
    pointsList: {
      [collateralTokenAddress]: {
        symbol: "weETH",
        address: "0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee",
        debtRewards: undefined,
        rewards: [
          {
            name: "Ether.fi",
            units: "points",
            multiplier: 200n,
            type: "etherfi",
          },
        ],
      },
      [deth]: {
        address: "0x871ab8e36cae9af35c6a3488b049965233deb7ed",
        debtRewards: undefined,
        rewards: [
          {
            name: "Makina",
            units: "points",
            multiplier: 36000n,
            type: "makina",
          },
        ],
        symbol: "DETH",
      },
    },
    extraCollateralPointsList: {},
    poolRewardsList: {},
    tokenExtraRewardsList: {},
    poolExternalAPYList: {},
    poolExtraAPYList: {},
  } as unknown as APYList;

  it("computes expected earnings for APY-only scenario", () => {
    const strategy = {
      id: "test-strategy",
      tokenOutAddress: targetTokenAddress,
      chainId: 1,
      network: "Mainnet" as const,
    } as unknown as Strategy;

    const result = getCMYouCanEarn({
      creditManager,
      pools,
      strategy,

      delayedPhantoms: {},
      apyList: apyList,
      tokensList: tokenDataList,
      walletBalances,
      nativeTokenAddress,
      wrappedNativeTokenAddress,
      allPrices,
      slippage: 10,
      quotaReserve: 500,
    });

    expect(result.status).toEqual("ok");
    expect(result.data?.info?.maxAPY).toEqual({
      overallAPY: 7.392,
      overallAPYBigInt: 73920n,
      overallAPYStatus: "calculated",
    });
    expect(result.data?.earnings).toEqual({
      earnings: 496914282513333354n,
      earningsUSD: 1592_305801450150145856n,
    });
  });

  it("computes expected earnings for APY and points scenario", () => {
    const strategy = {
      id: "test-strategy",
      tokenOutAddress: collateralTokenAddress,
      chainId: 1,
      network: "Mainnet" as const,
    } as unknown as Strategy;

    const result = getCMYouCanEarn({
      creditManager,
      pools,
      strategy,

      delayedPhantoms: {},
      apyList: apyList,
      tokensList: tokenDataList,
      walletBalances,
      nativeTokenAddress,
      wrappedNativeTokenAddress,
      allPrices,
      slippage: 10,
      quotaReserve: 500,
    });

    expect(result.status).toEqual("ok");
    expect(result.data?.info?.maxAPY).toEqual({
      overallAPY: 11.233,
      overallAPYBigInt: 112330n,
      overallAPYStatus: "calculated",
    });
    expect(result.data?.earnings).toEqual({
      earnings: 755118795383153892n,
      earningsUSD: 2419_693055693930817344n,
    });
    expect(result.data?.points?.info).toEqual(
      apyList.pointsList?.[collateralTokenAddress] || {},
    );
    expect(result.data?.points).toEqual({
      debtRates: { rewards: [], rates: [] },
      info: apyList.pointsList?.[collateralTokenAddress] || {},
      rates: [2454n],
    });
  });

  it("computes expected earnings for points-only scenario", () => {
    const strategy = {
      id: "test-strategy",
      tokenOutAddress: deth,
      chainId: 1,
      network: "Mainnet" as const,
    } as unknown as Strategy;

    const result = getCMYouCanEarn({
      creditManager,
      pools,
      strategy,

      delayedPhantoms: {},
      apyList: apyList,
      tokensList: tokenDataList,
      walletBalances,
      nativeTokenAddress,
      wrappedNativeTokenAddress,
      allPrices,
      slippage: 10,
      quotaReserve: 500,
    });

    expect(result.status).toEqual("ok");
    expect(result.data?.info?.maxAPY).toEqual({
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "negativeForPoints",
    });
    expect(result.data?.earnings).toEqual({
      earnings: null,
      earningsUSD: null,
    });
    expect(result.data?.points?.info).toEqual(apyList.pointsList?.[deth] || {});
    expect(result.data?.points).toEqual({
      debtRates: { rewards: [], rates: [] },
      info: apyList.pointsList?.[deth] || {},
      rates: [259920n],
    });
  });
});
