import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  BorrowRateBreakdown,
  ChainId,
  DataResponse,
  LiquidationPosition,
  PnlBreakdown,
  PoolPosition,
  Position,
  PositionCollateral,
  StrategyPosition,
  Timestamp,
  Token,
  TokenAmount,
} from "../../model/index.js";
import { comparePositions } from "./comparePositions.js";
import type { FieldDiff } from "./fieldDiff.js";

const MAINNET: ChainId = 1;
const WALLET = "0x1111111111111111111111111111111111111111" as Address;
const OTHER = "0x2222222222222222222222222222222222222222" as Address;
const POOL = "0xda00000000000000000000000000000000000001" as Address;
const CREDIT_MANAGER = "0x3eb90000000000000000000000000000000000a1" as Address;
const CREDIT_ACCOUNT = "0x9c4c000000000000000000000000000000000001" as Address;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" as Address;
const TBTC = "0x18084fbA666a33d37592fA2633fD49a74DD93a88" as Address;
const REDEEMER = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
const NOW = 1_700_000_000 as Timestamp;

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
  valueUsd: number | null,
): TokenAmount {
  return { token: token(address, symbol), value, valueUsd };
}

function pnl(organic: bigint, total: bigint): PnlBreakdown {
  return {
    organic: tokenAmount(USDC, "USDC", organic, Number(organic)),
    total: tokenAmount(USDC, "USDC", total, Number(total)),
    rewards: [],
  };
}

function collateral(
  address: Address,
  symbol: string,
  value: bigint,
  quota: bigint,
): PositionCollateral {
  return {
    collateral: tokenAmount(address, symbol, value, Number(value)),
    quota: tokenAmount(USDC, "USDC", quota, Number(quota)),
    withdrawals: [],
  };
}

function borrowRate(): BorrowRateBreakdown {
  return {
    total: 400,
    totalOnDebt: 520,
    base: 520,
    quotas: [],
  };
}

function pool(overrides: Partial<PoolPosition> = {}): PoolPosition {
  return {
    kind: "pool",
    name: "USDC Pool",
    chainId: MAINNET,
    pool: POOL,
    netValue: tokenAmount(USDC, "USDC", 1_000n, 1_000),
    apy: { organicApy: 610 },
    ...overrides,
  };
}

function strategy(overrides: Partial<StrategyPosition> = {}): StrategyPosition {
  return {
    kind: "strategy",
    name: "wstETH / USDC",
    chainId: MAINNET,
    creditManager: CREDIT_MANAGER,
    creditAccount: CREDIT_ACCOUNT,
    targetCollateral: token(WSTETH, "wstETH"),
    leverage: 5,
    borrowApy: 520,
    totalDebt: tokenAmount(USDC, "USDC", 4_000n, 4_000),
    totalValue: tokenAmount(USDC, "USDC", 5_000n, 5_000),
    healthFactor: 12_500,
    borrowRate: borrowRate(),
    timeToLiquidation: 86_400_000n,
    liquidationPrice: 1_000_000_000n,
    collaterals: [collateral(WSTETH, "wstETH", 1n, 4_000n)],
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
    output: tokenAmount(USDC, "USDC", 100n, 100),
    claimableAt: NOW,
    redeemer: REDEEMER,
    ...overrides,
  };
}

function response(rows: Position[]): DataResponse<Position[]> {
  return {
    data: rows,
    meta: {
      chains: [
        {
          chainId: MAINNET,
          status: "success",
          source: "onchain",
          blockNumber: 100,
          timestamp: NOW,
        },
      ],
    },
  };
}

function compare(
  onchain: Position[],
  offchain: Position[],
  wallet: Address = WALLET,
): ReturnType<typeof comparePositions> {
  return comparePositions({
    wallets: [
      { wallet, onchain: response(onchain), offchain: response(offchain) },
    ],
    backendUrl: "https://api.gear-dev.dev",
    networks: ["Mainnet"],
    generatedAt: "2026-01-01T00:00:00.000Z",
  });
}

function walletOf(
  report: ReturnType<typeof comparePositions>,
  wallet: Address = WALLET,
) {
  return report.wallets.find(entry => entry.wallet === wallet);
}

function diffAt(diffs: FieldDiff[], path: string): FieldDiff | undefined {
  return diffs.find(diff => diff.path === path);
}

describe("membership", () => {
  it("reports a row only one source lists, identified by what it is", () => {
    const report = compare([pool(), strategy()], [pool()]);
    const wallet = walletOf(report);

    expect(report.summary.onlyOnchain).toBe(1);
    expect(report.summary.matched).toBe(1);
    expect(wallet?.onlyOnchain).toEqual([
      {
        id: `1:strategy:${CREDIT_ACCOUNT}`,
        kind: "strategy",
        chainId: MAINNET,
        name: "wstETH / USDC",
        creditAccount: CREDIT_ACCOUNT,
        creditManager: CREDIT_MANAGER,
      },
    ]);
    expect(wallet?.onlyOffchain).toEqual([]);
  });

  it("reports a row only the backend lists", () => {
    const report = compare([pool()], [pool(), strategy()]);

    expect(report.summary.onlyOffchain).toBe(1);
    expect(walletOf(report)?.onlyOffchain[0]?.kind).toBe("strategy");
  });

  it("compares each wallet on its own", () => {
    const report = comparePositions({
      wallets: [
        {
          wallet: WALLET,
          onchain: response([pool()]),
          offchain: response([pool()]),
        },
        {
          wallet: OTHER,
          onchain: response([strategy()]),
          offchain: response([]),
        },
      ],
      backendUrl: "https://api.gear-dev.dev",
      networks: ["Mainnet"],
      generatedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(report.summary.wallets).toBe(2);
    expect(report.summary.matched).toBe(1);
    expect(report.summary.onlyOnchain).toBe(1);
    expect(walletOf(report, OTHER)?.onlyOnchain[0]?.kind).toBe("strategy");
  });

  it("records a wallet whose listings could not be read", () => {
    const report = comparePositions({
      wallets: [
        {
          wallet: WALLET,
          onchain: response([pool()]),
          offchain: response([pool()]),
        },
      ],
      failures: [{ wallet: OTHER, error: "timeout" }],
      backendUrl: "https://api.gear-dev.dev",
      networks: ["Mainnet"],
      generatedAt: "2026-01-01T00:00:00.000Z",
    });

    expect(report.summary.walletsFailed).toBe(1);
    expect(walletOf(report, OTHER)?.error).toBe("timeout");
    expect(report.summary.walletsClean).toBe(1);
  });
});

describe("matched rows", () => {
  it("reports nothing when the two sources agree", () => {
    const report = compare([pool()], [pool()]);

    expect(walletOf(report)?.matched).toEqual([
      expect.objectContaining({ identical: true, clean: true, diffs: [] }),
    ]);
    expect(report.summary.clean).toBe(1);
    expect(report.summary.walletsClean).toBe(1);
  });

  it("matches a liquidation by redeemer, not by source token alone", () => {
    const otherRedeemer =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
    const report = compare(
      [liquidation()],
      [liquidation({ redeemer: otherRedeemer })],
    );

    expect(report.summary.matched).toBe(0);
    expect(report.summary.onlyOnchain).toBe(1);
    expect(report.summary.onlyOffchain).toBe(1);
  });

  it("falls back to source token and claimableAt when neither side has a redeemer", () => {
    const report = compare(
      [liquidation({ redeemer: undefined })],
      [liquidation({ redeemer: undefined })],
    );

    expect(report.summary.matched).toBe(1);
    expect(walletOf(report)?.matched[0]?.id).toBe(
      `1:liquidation:${WSTETH.toLowerCase()}:${NOW}`,
    );
  });
});

describe("expected diffs", () => {
  it("marks offchain-only pnl as expected, not identical", () => {
    const report = compare([pool()], [pool({ pnl: pnl(10n, 12n) })]);
    const match = walletOf(report)?.matched[0];

    expect(diffAt(match?.diffs ?? [], "pnl")).toEqual({
      path: "pnl",
      onchain: undefined,
      offchain: pnl(10n, 12n),
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(match?.identical).toBe(false);
    expect(match?.clean).toBe(true);
    expect(report.summary.identical).toBe(0);
    expect(report.summary.clean).toBe(1);
  });

  it("marks onchain-only borrowRate as expected", () => {
    const { borrowRate: rate, ...withoutRate } = strategy();
    const report = compare([strategy()], [withoutRate as StrategyPosition]);

    expect(
      diffAt(walletOf(report)?.matched[0]?.diffs ?? [], "borrowRate"),
    ).toEqual({
      path: "borrowRate",
      onchain: rate,
      offchain: undefined,
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(walletOf(report)?.matched[0]?.clean).toBe(true);
  });

  it("treats pool apy.totalApy as mode-scoped", () => {
    const report = compare(
      [pool()],
      [pool({ apy: { organicApy: 610, totalApy: 842 } })],
    );

    expect(
      diffAt(walletOf(report)?.matched[0]?.diffs ?? [], "apy.totalApy"),
    ).toEqual({
      path: "apy.totalApy",
      onchain: undefined,
      offchain: 842,
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
  });

  it("tolerates a USD float inside 0.1% and flags one outside it", () => {
    const inside = compare(
      [pool()],
      [pool({ netValue: tokenAmount(USDC, "USDC", 1_000n, 1_000.4) })],
    );
    const outside = compare(
      [pool()],
      [pool({ netValue: tokenAmount(USDC, "USDC", 1_000n, 1_002) })],
    );

    expect(
      diffAt(walletOf(inside)?.matched[0]?.diffs ?? [], "netValue.valueUsd"),
    ).toEqual({
      path: "netValue.valueUsd",
      onchain: 1_000,
      offchain: 1_000.4,
      kind: "usd",
      expected: true,
      reason: "tolerance",
    });
    expect(walletOf(inside)?.matched[0]?.clean).toBe(true);
    expect(
      diffAt(walletOf(outside)?.matched[0]?.diffs ?? [], "netValue.valueUsd"),
    ).toEqual({
      path: "netValue.valueUsd",
      onchain: 1_000,
      offchain: 1_002,
      kind: "usd",
    });
    expect(walletOf(outside)?.matched[0]?.clean).toBe(false);
  });

  it("tolerates a ±1 bps health factor and a lag-bounded amount, not a larger gap", () => {
    const rate = compare([strategy()], [strategy({ healthFactor: 12_501 })]);
    const amountLag = compare(
      [strategy({ totalDebt: tokenAmount(USDC, "USDC", 1_000_000n, 1_000) })],
      [strategy({ totalDebt: tokenAmount(USDC, "USDC", 1_000_400n, 1_000) })],
    );
    const amountGap = compare(
      [strategy({ totalDebt: tokenAmount(USDC, "USDC", 1_000_000n, 1_000) })],
      [strategy({ totalDebt: tokenAmount(USDC, "USDC", 1_010_000n, 1_000) })],
    );

    expect(
      diffAt(walletOf(rate)?.matched[0]?.diffs ?? [], "healthFactor"),
    ).toEqual({
      path: "healthFactor",
      onchain: 12_500,
      offchain: 12_501,
      kind: "numeric",
      expected: true,
      reason: "tolerance",
    });
    expect(walletOf(rate)?.matched[0]?.clean).toBe(true);
    expect(
      diffAt(walletOf(amountLag)?.matched[0]?.diffs ?? [], "totalDebt.value"),
    ).toEqual({
      path: "totalDebt.value",
      onchain: 1_000_000n,
      offchain: 1_000_400n,
      kind: "numeric",
      expected: true,
      reason: "tolerance",
    });
    expect(
      diffAt(walletOf(amountGap)?.matched[0]?.diffs ?? [], "totalDebt.value"),
    ).toEqual({
      path: "totalDebt.value",
      onchain: 1_000_000n,
      offchain: 1_010_000n,
      kind: "numeric",
    });
  });

  it("tolerates a leverage float inside 0.1%", () => {
    const report = compare([strategy()], [strategy({ leverage: 5.004 })]);

    expect(
      diffAt(walletOf(report)?.matched[0]?.diffs ?? [], "leverage"),
    ).toEqual({
      path: "leverage",
      onchain: 5,
      offchain: 5.004,
      kind: "numeric",
      expected: true,
      reason: "tolerance",
    });
  });
});

describe("collateral lists", () => {
  it("keys collaterals by token so a missing one is named, not shifted", () => {
    const report = compare(
      [
        strategy({
          collaterals: [
            collateral(WSTETH, "wstETH", 1n, 4_000n),
            collateral(TBTC, "tBTC", 1n, 100n),
          ],
        }),
      ],
      [
        strategy({
          collaterals: [collateral(WSTETH, "wstETH", 1n, 4_000n)],
        }),
      ],
    );

    expect(walletOf(report)?.matched[0]?.diffs).toEqual([
      {
        path: `collaterals[${TBTC.toLowerCase()}]`,
        onchain: collateral(TBTC, "tBTC", 1n, 100n),
        offchain: undefined,
        kind: "presence",
      },
    ]);
    expect(walletOf(report)?.matched[0]?.clean).toBe(false);
  });

  it("ignores the order the collaterals came in", () => {
    const report = compare(
      [
        strategy({
          collaterals: [
            collateral(WSTETH, "wstETH", 1n, 4_000n),
            collateral(TBTC, "tBTC", 1n, 100n),
          ],
        }),
      ],
      [
        strategy({
          collaterals: [
            collateral(TBTC, "tBTC", 1n, 100n),
            collateral(WSTETH, "wstETH", 1n, 4_000n),
          ],
        }),
      ],
    );

    expect(walletOf(report)?.matched[0]?.diffs).toEqual([]);
  });
});

describe("the report as a whole", () => {
  it("carries what the run was pointed at and what each chain answered", () => {
    const report = compare([pool()], [pool()]);

    expect(report.generatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(report.backendUrl).toBe("https://api.gear-dev.dev");
    expect(report.networks).toEqual(["Mainnet"]);
    expect(report.onchainChains[0]).toMatchObject({
      chainId: 1,
      blockNumber: 100,
    });
  });

  it("does not count a wallet as clean when a name disagrees", () => {
    const report = compare([pool()], [pool({ name: "USDC pool" })]);

    expect(diffAt(walletOf(report)?.matched[0]?.diffs ?? [], "name")).toEqual({
      path: "name",
      onchain: "USDC Pool",
      offchain: "USDC pool",
      kind: "other",
    });
    expect(report.summary.walletsClean).toBe(0);
    expect(report.summary.clean).toBe(0);
  });

  it("names the entity with the largest unexpected numeric gap", () => {
    const otherAccount =
      "0x9c4c000000000000000000000000000000000002" as Address;
    const report = compare(
      [
        strategy({ leverage: 5 }),
        strategy({ creditAccount: otherAccount, leverage: 5 }),
      ],
      [
        strategy({ leverage: 6 }),
        strategy({ creditAccount: otherAccount, leverage: 8 }),
      ],
    );

    expect(
      report.summary.diffsByPath.find(entry => entry.path === "leverage"),
    ).toEqual({
      path: "leverage",
      kinds: ["numeric"],
      count: 2,
      expected: 0,
      unexpected: 2,
      worstUnexpected: {
        id: `1:strategy:${otherAccount}`,
        path: "leverage",
        bps: (3 / 8) * 10_000,
        onchain: 5,
        offchain: 8,
      },
    });
  });
});
