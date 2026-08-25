import type { Address } from "viem";
import type { z } from "zod/v4";
import type {
  ChainSucceeded,
  DataResponse,
  Opportunity,
  PoolOpportunityDetail,
  poolOpportunityDetailSchema,
  poolOpportunitySchema,
  StrategyOpportunityDetail,
  strategyOpportunityDetailSchema,
} from "../../model/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import { describeOffchainFallback } from "../testing/fallbackHarness.js";
import {
  offchainSuccess,
  TEST_BLOCK,
  TEST_CHAIN_A,
  TEST_CHAIN_B,
  TEST_NOW,
} from "../testing/offchainFailures.js";
import { OpportunitiesNamespace } from "./OpportunitiesNamespace.js";

/**
 * Wire shape of a pool list row, before codecs decode bigints and addresses.
 **/
type PoolOpportunityBody = z.input<typeof poolOpportunitySchema>;

/**
 * Wire shape of a pool detail payload.
 **/
type PoolOpportunityDetailBody = z.input<typeof poolOpportunityDetailSchema>;

/**
 * Wire shape of a strategy detail payload.
 **/
type StrategyOpportunityDetailBody = z.input<
  typeof strategyOpportunityDetailSchema
>;

const POOL = "0x1111111111111111111111111111111111111111" as Address;
const CURATOR = "0x2222222222222222222222222222222222222222" as Address;
const TOKEN = "0x3333333333333333333333333333333333333333" as Address;
const CREDIT_MANAGER = "0x4444444444444444444444444444444444444444" as Address;
const FEED = "0x5555555555555555555555555555555555555555" as Address;

const TOKEN_BODY = {
  chainId: TEST_CHAIN_A,
  address: TOKEN,
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
  assetType: "Stable" as const,
};

const AMOUNT = { value: "1000", valueUsd: 1 };

const CURATOR_BODY = {
  address: CURATOR,
  name: "Testnet Curator" as const,
  url: null,
};

describeOffchainFallback({
  makeNamespace: (onchainStub, api, options) =>
    new OpportunitiesNamespace(
      { opportunities: onchainStub } as unknown as MultichainSDK,
      api,
      options,
    ),
  cases: [
    {
      method: "list",
      kind: "merged",
      invoke: ns => ns.list(),
      onchainResponse: listOnchain(),
      offchainPayload: {
        data: [poolOpportunity(TEST_CHAIN_A), poolOpportunity(TEST_CHAIN_B)],
        meta: {
          chains: [
            offchainSuccess(TEST_CHAIN_A),
            offchainSuccess(TEST_CHAIN_B),
          ],
        },
      },
    },
    {
      method: "getPool",
      kind: "merged",
      invoke: ns => ns.getPool({ chainId: TEST_CHAIN_A, pool: POOL }),
      expectedChainIds: [TEST_CHAIN_A],
      onchainResponse: poolOnchain(),
      offchainPayload: {
        data: poolOpportunityDetail(TEST_CHAIN_A),
        meta: { chains: [offchainSuccess(TEST_CHAIN_A)] },
      },
    },
    {
      method: "getStrategy",
      kind: "merged",
      invoke: ns =>
        ns.getStrategy({
          chainId: TEST_CHAIN_A,
          creditManager: CREDIT_MANAGER,
        }),
      expectedChainIds: [TEST_CHAIN_A],
      onchainResponse: strategyOnchain(),
      offchainPayload: {
        data: strategyOpportunityDetail(TEST_CHAIN_A),
        meta: { chains: [offchainSuccess(TEST_CHAIN_A)] },
      },
    },
    {
      method: "charts",
      kind: "offchainOnly",
      invoke: ns =>
        ns.charts(
          { kind: "pool", chainId: TEST_CHAIN_A, pool: POOL },
          ["depositApy"],
          "1m",
        ),
    },
  ],
});

/**
 * On-chain list the merge can pick rows from by `chainId`.
 **/
function listOnchain(): DataResponse<Opportunity[]> {
  return {
    data: [
      { chainId: TEST_CHAIN_A, name: "onchain A" } as Opportunity,
      { chainId: TEST_CHAIN_B, name: "onchain B" } as Opportunity,
    ],
    meta: {
      chains: [onchainSuccess(TEST_CHAIN_A), onchainSuccess(TEST_CHAIN_B)],
    },
  };
}

function poolOnchain(): DataResponse<PoolOpportunityDetail> {
  return {
    data: {
      chainId: TEST_CHAIN_A,
      name: "onchain pool",
    } as PoolOpportunityDetail,
    meta: { chains: [onchainSuccess(TEST_CHAIN_A)] },
  };
}

function strategyOnchain(): DataResponse<StrategyOpportunityDetail> {
  return {
    data: {
      chainId: TEST_CHAIN_A,
      name: "onchain strategy",
    } as StrategyOpportunityDetail,
    meta: { chains: [onchainSuccess(TEST_CHAIN_A)] },
  };
}

function onchainSuccess(chainId: number): ChainSucceeded {
  return {
    chainId,
    status: "success",
    source: "onchain",
    blockNumber: TEST_BLOCK,
    timestamp: TEST_NOW,
  };
}

function poolOpportunity(chainId: number): PoolOpportunityBody {
  return {
    chainId,
    name: `USDC Pool ${chainId}`,
    curator: CURATOR_BODY,
    underlyingToken: { ...TOKEN_BODY, chainId },
    totalBorrow: AMOUNT,
    collateralTokens: [],
    paused: false,
    rwa: false,
    sunset: false,
    kind: "pool",
    pool: POOL,
    totalSupply: AMOUNT,
    availableLiquidity: AMOUNT,
    utilization: 5000,
    supplyApy: { organicApy: 500 },
    supplyApyAvg7D: { organicApy: 475 },
    quotaAssets: [],
  };
}

function poolOpportunityDetail(chainId: number): PoolOpportunityDetailBody {
  return {
    ...poolOpportunity(chainId),
    rateCurve: { points: [], borrowingLimitUtilization: null },
  };
}

function strategyOpportunityDetail(
  chainId: number,
): StrategyOpportunityDetailBody {
  const token = { ...TOKEN_BODY, chainId };
  return {
    chainId,
    name: `USDC Strategy ${chainId}`,
    curator: CURATOR_BODY,
    underlyingToken: token,
    totalBorrow: AMOUNT,
    collateralTokens: [],
    paused: false,
    rwa: false,
    sunset: false,
    kind: "strategy",
    creditManager: CREDIT_MANAGER,
    targetCollateral: token,
    liquidationThreshold: 8000,
    liquidationPremium: 500,
    liquidationFee: 100,
    expirationDate: null,
    collateralApyAvg7D: { organicApy: 450 },
    borrowApy: 500,
    borrowApyAvg7D: 425,
    quotaRate: 80,
    quotaRateAvg7D: 75,
    availableLiquidity: AMOUNT,
    minDebt: AMOUNT,
    totalDebtLimit: AMOUNT,
    maxBorrowAmount: AMOUNT,
    maxLeverage: 3,
    rateCurve: { points: [], borrowingLimitUtilization: null },
    priceFeeds: {
      underlyingPriceInUsd: 1,
      collateralPriceInUsd: 1,
      collateralPriceInUnderlying: 1,
      underlyingFeed: {
        name: "USDC",
        type: "CHAINLINK",
        feedAddress: FEED,
        dependencies: [],
      },
      collateralFeed: {
        name: "USDC",
        type: "CHAINLINK",
        feedAddress: FEED,
        dependencies: [],
      },
    },
  };
}
