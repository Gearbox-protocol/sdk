import type { Address } from "viem";
import type { z } from "zod/v4";
import type {
  ChainSucceeded,
  DataResponse,
  Position,
  poolPositionSchema,
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
import { PositionsNamespace } from "./PositionsNamespace.js";

const WALLET = "0x1111111111111111111111111111111111111111" as Address;
const POOL = "0x2222222222222222222222222222222222222222" as Address;
const TOKEN = "0x3333333333333333333333333333333333333333" as Address;

describeOffchainFallback({
  makeNamespace: (onchainStub, api) =>
    new PositionsNamespace(
      { positions: onchainStub } as unknown as MultichainSDK,
      api,
      { maxOffchainLagSeconds: 120 },
    ),
  cases: [
    {
      method: "list",
      kind: "merged",
      invoke: ns => ns.list(WALLET),
      onchainResponse: listOnchain(),
      offchainPayload: {
        data: [poolPosition(TEST_CHAIN_A), poolPosition(TEST_CHAIN_B)],
        meta: {
          chains: [
            offchainSuccess(TEST_CHAIN_A),
            offchainSuccess(TEST_CHAIN_B),
          ],
        },
      },
    },
    {
      method: "charts",
      kind: "offchainOnly",
      invoke: ns =>
        ns.charts(
          { kind: "pool", chainId: TEST_CHAIN_A, pool: POOL, wallet: WALLET },
          ["apy"],
          "1m",
        ),
    },
  ],
});

/**
 * On-chain list the merge can pick rows from by `chainId`.
 **/
function listOnchain(): DataResponse<Position[]> {
  return {
    data: [
      { chainId: TEST_CHAIN_A, name: "onchain A" } as Position,
      { chainId: TEST_CHAIN_B, name: "onchain B" } as Position,
    ],
    meta: {
      chains: [onchainSuccess(TEST_CHAIN_A), onchainSuccess(TEST_CHAIN_B)],
    },
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

/**
 * Wire shape of a pool position row, before codecs decode bigints and addresses.
 **/
type PoolPositionBody = z.input<typeof poolPositionSchema>;

function poolPosition(chainId: number): PoolPositionBody {
  return {
    kind: "pool",
    name: `USDC Pool ${chainId}`,
    chainId,
    pool: POOL,
    netValue: {
      value: "1000000",
      valueUsd: 1,
      token: {
        chainId,
        address: TOKEN,
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        assetType: "Stable",
      },
    },
    apy: { organicApy: 500 },
  };
}
