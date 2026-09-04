import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  DataSource,
  LiquidationPosition,
  PoolPosition,
  Position,
  StrategyPosition,
  Timestamp,
  Token,
  TokenAmount,
} from "../../model/index.js";
import { DEFAULT_MAX_OFFCHAIN_LAG } from "../utils/mergeChains.js";
import { mergePositionList } from "./mergePositionList.js";

const NOW = 1_700_000_000 as Timestamp;
const MAINNET: ChainId = 1;
const CREDIT_MANAGER = "0x3eb90000000000000000000000000000000000a1" as Address;
const CREDIT_ACCOUNT = "0x9c4c000000000000000000000000000000000001" as Address;
const OTHER_ACCOUNT = "0x9c4c000000000000000000000000000000000002" as Address;
const MIXED_CASE_ACCOUNT =
  "0x9C4C000000000000000000000000000000000001" as Address;
const LOWER_CASE_ACCOUNT =
  "0x9c4c000000000000000000000000000000000001" as Address;
const POOL = "0xda00000000000000000000000000000000000001" as Address;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" as Address;
const TBTC = "0x18084fbA666a33d37592fA2633fD49a74DD93a88" as Address;
const REDEEMER = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;

type PositionListResponse = DataResponse<Position[]> | undefined;
type Freshness = "fresh" | "stale";

interface MergePositionListCase {
  name: string;
  freshness: Freshness;
  onchain: Position[];
  offchain: Position[];
  expectedSource: DataSource;
  expected: Position[];
}

function succeeded(
  chainId: ChainId,
  source: DataSource,
  timestamp: Timestamp,
): ChainMetadata {
  return { chainId, status: "success", source, blockNumber: 100, timestamp };
}

function response(
  chains: ChainMetadata[],
  ...rows: Position[]
): DataResponse<Position[]> {
  return { data: rows, meta: { chains } };
}

function token(address: Address, symbol: string): Token {
  return {
    chainId: MAINNET,
    address,
    symbol,
    name: symbol,
    decimals: 18,
  };
}

function tokenAmount(
  address: Address,
  symbol: string,
  value: bigint,
): TokenAmount {
  return { token: token(address, symbol), value, valueUsd: Number(value) };
}

function strategy(overrides: Partial<StrategyPosition> = {}): StrategyPosition {
  return {
    kind: "strategy",
    name: "wstETH / USDC",
    chainId: MAINNET,
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    underlyingToken: { ...token(USDC, "USDC"), wrappedAddress: null },
    targetCollateral: token(WSTETH, "wstETH"),
    leverage: 5,
    borrowApy: 520,
    totalDebt: tokenAmount(USDC, "USDC", 4_000n),
    totalValue: tokenAmount(USDC, "USDC", 5_000n),
    healthFactor: 12_500,
    collaterals: [],
    ...overrides,
  };
}

function pool(overrides: Partial<PoolPosition> = {}): PoolPosition {
  return {
    kind: "pool",
    name: "USDC Pool",
    chainId: MAINNET,
    pool: POOL,
    underlyingToken: { ...token(USDC, "USDC"), wrappedAddress: null },
    netValue: tokenAmount(USDC, "USDC", 1_000n),
    apy: { organicApy: 610 },
    ...overrides,
  };
}

function liquidation(
  overrides: Partial<LiquidationPosition> = {},
): LiquidationPosition {
  return {
    kind: "liquidation",
    name: "ACRED withdrawal",
    chainId: MAINNET,
    sourceToken: token(WSTETH, "wstETH"),
    output: tokenAmount(USDC, "USDC", 100n),
    claimableAt: NOW,
    redeemer: REDEEMER,
    ...overrides,
  };
}

function sourceOf(
  merged: DataResponse<Position[]> | undefined,
  chainId: ChainId,
): DataSource | undefined {
  return merged?.meta.chains.find(chain => chain.chainId === chainId)?.source;
}

function freshBackend(): Timestamp {
  return (NOW - 30) as Timestamp;
}

function staleBackend(): Timestamp {
  return (NOW - DEFAULT_MAX_OFFCHAIN_LAG - 1) as Timestamp;
}

function onchainStrategy(
  overrides: Partial<StrategyPosition> = {},
): StrategyPosition {
  return strategy({
    name: "tBTC / USDC",
    targetCollateral: token(TBTC, "tBTC"),
    leverage: 6,
    ...overrides,
  });
}

function offchainStrategy(
  overrides: Partial<StrategyPosition> = {},
): StrategyPosition {
  return strategy({
    name: "wstETH / USDC",
    targetCollateral: token(WSTETH, "wstETH"),
    leverage: 5,
    ...overrides,
  });
}

function expectedStrategyOverlay(
  onchainRow: StrategyPosition,
  offchainRow: StrategyPosition,
): StrategyPosition {
  return {
    ...onchainRow,
    targetCollateral: offchainRow.targetCollateral,
    name: offchainRow.name,
  };
}

function mergeSingleChain(
  onchainRows: Position[],
  offchainRows: Position[],
  offchainTimestamp: Timestamp,
): PositionListResponse {
  return mergePositionList(
    response([succeeded(MAINNET, "onchain", NOW)], ...onchainRows),
    response(
      [succeeded(MAINNET, "offchain", offchainTimestamp)],
      ...offchainRows,
    ),
  );
}

function runMergeCase({
  freshness,
  onchain,
  offchain,
  expectedSource,
  expected,
}: MergePositionListCase): void {
  const merged = mergeSingleChain(
    onchain,
    offchain,
    freshness === "fresh" ? freshBackend() : staleBackend(),
  );
  expect(sourceOf(merged, MAINNET)).toBe(expectedSource);
  expect(merged?.data).toEqual(expected);
}

const ONCHAIN_STRATEGY = onchainStrategy();
const OFFCHAIN_STRATEGY = offchainStrategy();
const UNSEEN_ONCHAIN_STRATEGY = onchainStrategy({
  creditAccount: OTHER_ACCOUNT,
});
const ONCHAIN_NULL_COLLATERAL = onchainStrategy({
  name: "wstETH / USDC",
  targetCollateral: token(WSTETH, "wstETH"),
});
const OFFCHAIN_NULL_COLLATERAL = offchainStrategy({
  name: "USDC",
  targetCollateral: null,
});
const ONCHAIN_POOL = pool({ name: "onchain pool" });
const OFFCHAIN_POOL = pool({ name: "offchain pool" });
const ONCHAIN_MIXED_CASE = strategy({
  creditAccount: MIXED_CASE_ACCOUNT,
  name: "tBTC / USDC",
  targetCollateral: token(TBTC, "tBTC"),
});
const OFFCHAIN_LOWER_CASE = strategy({
  creditAccount: LOWER_CASE_ACCOUNT,
  name: "wstETH / USDC",
  targetCollateral: token(WSTETH, "wstETH"),
});
const ONCHAIN_LIQ = liquidation({ name: "onchain withdrawal" });
const OFFCHAIN_LIQ = liquidation({ name: "offchain withdrawal" });

const OVERLAY_CASES: MergePositionListCase[] = [
  {
    name: "overlays targetCollateral and name when the chain wins freshness",
    freshness: "stale",
    onchain: [ONCHAIN_STRATEGY],
    offchain: [OFFCHAIN_STRATEGY],
    expectedSource: "onchain",
    expected: [expectedStrategyOverlay(ONCHAIN_STRATEGY, OFFCHAIN_STRATEGY)],
  },
  {
    name: "lets a backend null targetCollateral override an onchain value",
    freshness: "stale",
    onchain: [ONCHAIN_NULL_COLLATERAL],
    offchain: [OFFCHAIN_NULL_COLLATERAL],
    expectedSource: "onchain",
    expected: [
      expectedStrategyOverlay(
        ONCHAIN_NULL_COLLATERAL,
        OFFCHAIN_NULL_COLLATERAL,
      ),
    ],
  },
  {
    name: "keeps onchain values for a strategy the backend has never seen",
    freshness: "stale",
    onchain: [ONCHAIN_STRATEGY, UNSEEN_ONCHAIN_STRATEGY],
    offchain: [OFFCHAIN_STRATEGY],
    expectedSource: "onchain",
    expected: [
      expectedStrategyOverlay(ONCHAIN_STRATEGY, OFFCHAIN_STRATEGY),
      UNSEEN_ONCHAIN_STRATEGY,
    ],
  },
  {
    name: "leaves pool rows untouched when the chain wins",
    freshness: "stale",
    onchain: [ONCHAIN_POOL],
    offchain: [OFFCHAIN_POOL],
    expectedSource: "onchain",
    expected: [ONCHAIN_POOL],
  },
  {
    name: "matches a strategy across address-case differences",
    freshness: "stale",
    onchain: [ONCHAIN_MIXED_CASE],
    offchain: [OFFCHAIN_LOWER_CASE],
    expectedSource: "onchain",
    expected: [
      expectedStrategyOverlay(ONCHAIN_MIXED_CASE, OFFCHAIN_LOWER_CASE),
    ],
  },
  {
    name: "serves the backend strategy whole while it is still fresh",
    freshness: "fresh",
    onchain: [ONCHAIN_STRATEGY],
    offchain: [OFFCHAIN_STRATEGY],
    expectedSource: "offchain",
    expected: [OFFCHAIN_STRATEGY],
  },
  {
    name: "serves a backend null targetCollateral whole while it is still fresh",
    freshness: "fresh",
    onchain: [ONCHAIN_NULL_COLLATERAL],
    offchain: [OFFCHAIN_NULL_COLLATERAL],
    expectedSource: "offchain",
    expected: [OFFCHAIN_NULL_COLLATERAL],
  },
  {
    name: "drops an onchain-only strategy while the backend is still fresh",
    freshness: "fresh",
    onchain: [ONCHAIN_STRATEGY, UNSEEN_ONCHAIN_STRATEGY],
    offchain: [OFFCHAIN_STRATEGY],
    expectedSource: "offchain",
    expected: [OFFCHAIN_STRATEGY],
  },
  {
    name: "serves the backend pool whole while it is still fresh",
    freshness: "fresh",
    onchain: [ONCHAIN_POOL],
    offchain: [OFFCHAIN_POOL],
    expectedSource: "offchain",
    expected: [OFFCHAIN_POOL],
  },
  {
    name: "serves the backend strategy whole across address-case differences",
    freshness: "fresh",
    onchain: [ONCHAIN_MIXED_CASE],
    offchain: [OFFCHAIN_LOWER_CASE],
    expectedSource: "offchain",
    expected: [OFFCHAIN_LOWER_CASE],
  },
];

const LIQUIDATION_CASES: MergePositionListCase[] = [
  {
    name: "keeps onchain liquidations when a fresh backend omits them",
    freshness: "fresh",
    onchain: [ONCHAIN_STRATEGY, ONCHAIN_LIQ],
    offchain: [OFFCHAIN_STRATEGY],
    expectedSource: "offchain",
    expected: [OFFCHAIN_STRATEGY, ONCHAIN_LIQ],
  },
  {
    name: "keeps onchain liquidations when a stale backend omits them and still overlays strategy fields",
    freshness: "stale",
    onchain: [ONCHAIN_STRATEGY, ONCHAIN_LIQ],
    offchain: [OFFCHAIN_STRATEGY],
    expectedSource: "onchain",
    expected: [
      expectedStrategyOverlay(ONCHAIN_STRATEGY, OFFCHAIN_STRATEGY),
      ONCHAIN_LIQ,
    ],
  },
  {
    name: "serves backend liquidations whole while they are still fresh",
    freshness: "fresh",
    onchain: [ONCHAIN_STRATEGY, ONCHAIN_LIQ],
    offchain: [OFFCHAIN_STRATEGY, OFFCHAIN_LIQ],
    expectedSource: "offchain",
    expected: [OFFCHAIN_STRATEGY, OFFCHAIN_LIQ],
  },
  {
    name: "serves onchain liquidations once the backend falls behind, and still overlays strategy fields",
    freshness: "stale",
    onchain: [ONCHAIN_STRATEGY, ONCHAIN_LIQ],
    offchain: [OFFCHAIN_STRATEGY, OFFCHAIN_LIQ],
    expectedSource: "onchain",
    expected: [
      expectedStrategyOverlay(ONCHAIN_STRATEGY, OFFCHAIN_STRATEGY),
      ONCHAIN_LIQ,
    ],
  },
];

describe("mergePositionList overlays backend targetCollateral and name", () => {
  it.each(OVERLAY_CASES)("$name", runMergeCase);
});

describe("mergePositionList merges liquidation rows separately", () => {
  it.each(LIQUIDATION_CASES)("$name", runMergeCase);
});
