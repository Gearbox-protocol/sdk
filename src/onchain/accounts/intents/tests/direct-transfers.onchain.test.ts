import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { MAX_UINT256 } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { DIRECT_TRANSFERS_QUOTA, toBN } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import type { AccountCalculatorOperation } from "../operations.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  type MarketSdkExtras,
  POS2,
  QUOTAS,
  UND_DECIMALS,
  WALLET,
} from "../testing/market.js";
import type { MockQuotaEntry } from "../testing/sdk-mock.js";
import type { DelayableIntent, StartIntent } from "../types.js";
import {
  DEBT_2X,
  DEBT_3X,
  LEV_2X,
  LEV_3X,
  QUOTA_1000,
  QUOTA_1500,
  TVL_2X,
  TVL_3X,
} from "./adjust-leverage.fixtures.js";
import {
  DEBT_BEFORE,
  QUOTA_BEFORE,
  TVL_BEFORE,
  W,
} from "./withdraw.fixtures.js";

// mGLOBAL stands in for POS (1:1 with UND); the addresses are real because
// the chain table is keyed by them.

const MGLOBAL = "0x7433806912eae67919e66aea853d46fa0aef98a8" as Address;
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" as Address;

const quotaEntry = (token: Address): MockQuotaEntry => ({
  token,
  rate: 500n,
  limit: toBN("999999999999999", UND_DECIMALS),
  isActive: true,
});

const MARKET: MarketSdkExtras = {
  extraPrices: { [MGLOBAL]: toBN("2", 8), [USDC]: toBN("1", 8) },
  extraDecimals: { [MGLOBAL]: UND_DECIMALS, [USDC]: 6 },
  extraLiquidationThresholds: { [MGLOBAL]: 9200, [USDC]: 0 },
  quotas: {
    ...QUOTAS,
    [MGLOBAL]: quotaEntry(MGLOBAL),
    [USDC]: quotaEntry(USDC),
  },
  delayed: {
    [MGLOBAL]: [{ withdrawalPhantomToken: POS2, claimableAt: 1n }],
  },
};

function buildSdk(extras?: MarketSdkExtras): OnchainSDK {
  return buildMarketSdk({ ...MARKET, ...extras });
}

function account(totalDebt: bigint, tokens: ReturnType<typeof caToken>[]) {
  return buildFixtureCreditAccount({ totalDebt, tokens });
}

async function start(
  intent: StartIntent,
  creditAccount: ReturnType<typeof account>,
  sdk = buildSdk(),
) {
  const result = await new CreditAccountOperationsService(sdk).startIntent({
    intent,
    creditAccount,
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
  if (!result.ok) {
    throw new Error(`expected ok preview: ${JSON.stringify(result.error)}`);
  }
  return result.operations;
}

async function startDelayed(
  intent: DelayableIntent,
  creditAccount: ReturnType<typeof account>,
) {
  const sdk = buildSdk();
  const result = await new CreditAccountOperationsService(
    sdk,
  ).startDelayedIntent({
    intent,
    creditAccount,
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
  if (!result.ok) {
    throw new Error(`expected ok preview: ${JSON.stringify(result.error)}`);
  }
  return result.operations;
}

function usdcQuota(operations: AccountCalculatorOperation[]) {
  const update = operations.find(o => o.type === "changeQuota");
  if (update?.type !== "changeQuota") {
    return undefined;
  }
  return {
    increase: update.quotaIncrease.find(a => a.token === USDC)?.balance,
    desired: update.desiredQuota[USDC]?.balance,
  };
}

const bought = {
  increase: DIRECT_TRANSFERS_QUOTA,
  desired: DIRECT_TRANSFERS_QUOTA,
};

const levered = account(DEBT_3X, [caToken(MGLOBAL, TVL_3X, QUOTA_1500)]);
const holding = account(DEBT_BEFORE, [
  caToken(MGLOBAL, TVL_BEFORE, QUOTA_BEFORE),
]);

describe("direct transfers — selling mGLOBAL holds a USDC quota", () => {
  it("decreasing leverage buys it", async () => {
    const ops = await start(
      { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: MGLOBAL },
      levered,
    );
    expect(usdcQuota(ops)).toEqual(bought);
  });

  it("a partial withdrawal buys it", async () => {
    const ops = await start(
      { type: "WITHDRAW", amount: W, to: WALLET, sourceToken: MGLOBAL },
      holding,
    );
    expect(usdcQuota(ops)).toEqual(bought);
  });

  it("a delayed decrease buys it with the request", async () => {
    const ops = await startDelayed(
      { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: MGLOBAL },
      levered,
    );
    expect(usdcQuota(ops)).toEqual(bought);
  });

  it("a delayed partial withdrawal buys it with the request", async () => {
    const ops = await startDelayed(
      { type: "WITHDRAW", amount: W, to: WALLET, sourceToken: MGLOBAL },
      holding,
    );
    expect(usdcQuota(ops)).toEqual(bought);
  });

  it("leaves a quota already large enough alone", async () => {
    const ops = await start(
      { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: MGLOBAL },
      account(DEBT_3X, [
        caToken(MGLOBAL, TVL_3X, QUOTA_1500),
        caToken(USDC, 0n, DIRECT_TRANSFERS_QUOTA),
      ]),
    );
    expect(usdcQuota(ops)).toEqual({
      increase: undefined,
      desired: undefined,
    });
  });

  it("repaying the whole debt leaves nothing to quote against", async () => {
    const ops = await start(
      { type: "ADJUST_LEVERAGE", targetLeverage: 100n, token: MGLOBAL },
      levered,
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });

  it("a plain withdrawal of mGLOBAL sells nothing", async () => {
    const ops = await start(
      { type: "WITHDRAW_ASSET", token: MGLOBAL, amount: W, to: WALLET },
      holding,
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });

  it("increasing leverage buys mGLOBAL rather than selling it", async () => {
    const ops = await start(
      { type: "ADJUST_LEVERAGE", targetLeverage: LEV_3X, token: MGLOBAL },
      account(DEBT_2X, [caToken(MGLOBAL, TVL_2X, QUOTA_1000)]),
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });

  it("an exit clears every quota instead", async () => {
    const ops = await start(
      { type: "WITHDRAW", amount: MAX_UINT256, to: WALLET },
      holding,
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });

  it("a delayed exit leaves the quotas to the tail that clears them", async () => {
    const ops = await startDelayed(
      { type: "WITHDRAW", amount: MAX_UINT256, to: WALLET },
      holding,
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });

  it("skips a transferred token the pool does not quote", async () => {
    const { [USDC]: _, ...quotas } = MARKET.quotas ?? {};
    const ops = await start(
      { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: MGLOBAL },
      levered,
      buildSdk({ quotas }),
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });

  it("skips a transferred token with no quota room left", async () => {
    const ops = await start(
      { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: MGLOBAL },
      levered,
      buildSdk({
        quotas: {
          ...MARKET.quotas,
          [USDC]: { ...quotaEntry(USDC), limit: DIRECT_TRANSFERS_QUOTA - 1n },
        },
      }),
    );
    expect(usdcQuota(ops)?.increase).toBeUndefined();
  });
});
