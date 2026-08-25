import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  DataSource,
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
const POOL = "0xda00000000000000000000000000000000000001" as Address;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" as Address;
const TBTC = "0x18084fbA666a33d37592fA2633fD49a74DD93a88" as Address;

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

function sourceOf(
  merged: DataResponse<Position[]> | undefined,
  chainId: ChainId,
): unknown {
  return merged?.meta.chains.find(chain => chain.chainId === chainId)?.source;
}

function staleBackend(): Timestamp {
  return (NOW - DEFAULT_MAX_OFFCHAIN_LAG - 1) as Timestamp;
}

describe("mergePositionList overlays backend targetCollateral and name", () => {
  it("keeps the backend's targetCollateral and name when the chain wins freshness", () => {
    const onchainRow = strategy({
      name: "tBTC / USDC",
      targetCollateral: token(TBTC, "tBTC"),
      leverage: 6,
    });
    const offchainRow = strategy({
      name: "wstETH / USDC",
      targetCollateral: token(WSTETH, "wstETH"),
      leverage: 5,
    });

    const merged = mergePositionList(
      response([succeeded(MAINNET, "onchain", NOW)], onchainRow),
      response([succeeded(MAINNET, "offchain", staleBackend())], offchainRow),
    );

    expect(sourceOf(merged, MAINNET)).toBe("onchain");
    expect(merged?.data).toEqual([
      {
        ...onchainRow,
        targetCollateral: offchainRow.targetCollateral,
        name: offchainRow.name,
      },
    ]);
  });

  it("lets a backend null targetCollateral override an onchain value", () => {
    const onchainRow = strategy({
      name: "wstETH / USDC",
      targetCollateral: token(WSTETH, "wstETH"),
    });
    const offchainRow = strategy({
      name: "USDC",
      targetCollateral: null,
    });

    const merged = mergePositionList(
      response([succeeded(MAINNET, "onchain", NOW)], onchainRow),
      response([succeeded(MAINNET, "offchain", staleBackend())], offchainRow),
    );

    expect(merged?.data[0]).toMatchObject({
      kind: "strategy",
      name: "USDC",
      targetCollateral: null,
      leverage: onchainRow.leverage,
    });
  });

  it("keeps onchain values for a strategy the backend has never seen", () => {
    const knownOnchain = strategy({
      name: "tBTC / USDC",
      targetCollateral: token(TBTC, "tBTC"),
    });
    const unseenOnchain = strategy({
      creditAccount: OTHER_ACCOUNT,
      name: "tBTC / USDC",
      targetCollateral: token(TBTC, "tBTC"),
    });
    const offchainRow = strategy();

    const merged = mergePositionList(
      response(
        [succeeded(MAINNET, "onchain", NOW)],
        knownOnchain,
        unseenOnchain,
      ),
      response([succeeded(MAINNET, "offchain", staleBackend())], offchainRow),
    );

    expect(merged?.data).toEqual([
      {
        ...knownOnchain,
        name: offchainRow.name,
        targetCollateral: offchainRow.targetCollateral,
      },
      unseenOnchain,
    ]);
  });

  it("leaves pool rows untouched when the chain wins", () => {
    const onchainPool = pool({ name: "onchain pool" });
    const offchainPool = pool({ name: "offchain pool" });

    const merged = mergePositionList(
      response([succeeded(MAINNET, "onchain", NOW)], onchainPool),
      response([succeeded(MAINNET, "offchain", staleBackend())], offchainPool),
    );

    expect(sourceOf(merged, MAINNET)).toBe("onchain");
    expect(merged?.data).toEqual([onchainPool]);
  });

  it("serves the backend row whole while it is still fresh", () => {
    const onchainRow = strategy({
      name: "tBTC / USDC",
      targetCollateral: token(TBTC, "tBTC"),
      leverage: 6,
    });
    const offchainRow = strategy({
      name: "wstETH / USDC",
      targetCollateral: token(WSTETH, "wstETH"),
      leverage: 5,
    });

    const merged = mergePositionList(
      response([succeeded(MAINNET, "onchain", NOW)], onchainRow),
      response(
        [succeeded(MAINNET, "offchain", (NOW - 30) as Timestamp)],
        offchainRow,
      ),
    );

    expect(sourceOf(merged, MAINNET)).toBe("offchain");
    expect(merged?.data).toEqual([offchainRow]);
  });

  it("matches a strategy across address-case differences", () => {
    const mixedCase = "0x9C4C000000000000000000000000000000000001" as Address;
    const lowerCase = "0x9c4c000000000000000000000000000000000001" as Address;
    const onchainRow = strategy({
      creditAccount: mixedCase,
      name: "tBTC / USDC",
      targetCollateral: token(TBTC, "tBTC"),
    });
    const offchainRow = strategy({
      creditAccount: lowerCase,
      name: "wstETH / USDC",
      targetCollateral: token(WSTETH, "wstETH"),
    });

    const merged = mergePositionList(
      response([succeeded(MAINNET, "onchain", NOW)], onchainRow),
      response([succeeded(MAINNET, "offchain", staleBackend())], offchainRow),
    );

    expect(merged?.data[0]).toMatchObject({
      creditAccount: mixedCase,
      name: offchainRow.name,
      targetCollateral: offchainRow.targetCollateral,
    });
  });
});
