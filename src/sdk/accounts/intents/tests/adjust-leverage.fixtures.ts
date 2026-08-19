import type { Address } from "viem";
import type { OnchainSDK } from "../../../index.js";
import type { ExpectedFlowOp } from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  RWA_ASSET,
  UND,
} from "../testing/market.js";
import type { AdjustLeverageIntent } from "../types.js";

/**
 * Start adjust-leverage fixtures (intent 6), collateral held fixed.
 *
 * Every case starts from 1000 UND of TVL against 500 UND of debt, i.e. 500 UND
 * of collateral at 2x. Because collateral is the invariant, a target of 3x means
 * `D1 = 500 * 2 = 1000` and a target of 2x from 3x means repaying back to 500.
 *
 * `POS` is used as the position token: it converts 1:1 with `UND`, which is the
 * only way the mock router's echo-the-input behaviour stays decimals-honest.
 */

const LT = 9200n;

/** 500 UND. */
export const STEP = 50000000000n;
/** 1000 UND. */
export const TVL_2X = 100000000000n;
/** 1500 UND. */
export const TVL_3X = 150000000000n;

export const DEBT_2X = STEP;
export const DEBT_3X = TVL_2X;

/** Leverage targets in LEVERAGE_DECIMALS (100n = 1x). */
export const LEV_2X = 200n;
export const LEV_3X = 300n;

const quotaOf = (balance: bigint) => (balance * LT) / 10000n;

export const QUOTA_1000 = quotaOf(TVL_2X);
export const QUOTA_1500 = quotaOf(TVL_3X);
/** Quota ops carry signed deltas. */
export const QUOTA_UP = QUOTA_1500 - QUOTA_1000;
export const QUOTA_DOWN = QUOTA_1000 - QUOTA_1500;

export interface AdjustLeverageCase {
  intent: AdjustLeverageIntent;
  tokens: ReturnType<typeof caToken>[];
  accountDebt: bigint;
  totalValue: bigint;
  accountDebtAfter: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

/** 2x → 3x: borrow the difference and buy the position token with it. */
export const case_increase: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_3X, token: POS },
  tokens: [caToken(POS, TVL_2X, QUOTA_1000)],
  accountDebt: DEBT_2X,
  totalValue: TVL_3X,
  accountDebtAfter: DEBT_3X,
  ops: [
    { type: "increaseDebt", amount: STEP },
    {
      type: "swap",
      from: [{ token: UND, balance: STEP }],
      tokenOut: POS,
      amountOut: STEP,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: POS, balance: QUOTA_UP }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
};

/** Position token is the underlying: borrowing alone reaches the target. */
export const case_increase_underlying: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_3X, token: UND },
  tokens: [caToken(UND, TVL_2X)],
  accountDebt: DEBT_2X,
  totalValue: TVL_3X,
  accountDebtAfter: DEBT_3X,
  ops: [{ type: "increaseDebt", amount: STEP }],
};

/** RWA market: the borrowed wrapper is unwrapped instead of swapped. */
export const case_increase_rwa: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_3X, token: RWA_ASSET },
  tokens: [caToken(RWA_ASSET, TVL_2X, QUOTA_1000)],
  accountDebt: DEBT_2X,
  totalValue: TVL_3X,
  accountDebtAfter: DEBT_3X,
  ops: [
    { type: "increaseDebt", amount: STEP },
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: STEP,
      tokenOut: RWA_ASSET,
      amountOut: STEP,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: RWA_ASSET, balance: QUOTA_UP }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

/** 3x → 2x: sell position token, repay with the proceeds. */
export const case_decrease: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: POS },
  tokens: [caToken(POS, TVL_3X, QUOTA_1500)],
  accountDebt: DEBT_3X,
  totalValue: TVL_2X,
  accountDebtAfter: DEBT_2X,
  ops: [
    {
      type: "swap",
      from: [{ token: POS, balance: STEP }],
      tokenOut: UND,
      amountOut: STEP,
    },
    { type: "decreaseDebt", amount: STEP },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: POS, balance: QUOTA_DOWN }],
      desiredQuota: {},
    },
  ],
};

/** Idle underlying already covers the repayment, so no swap leg is built. */
export const case_decrease_from_idle_underlying: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: POS },
  tokens: [caToken(POS, TVL_2X, QUOTA_1000), caToken(UND, STEP)],
  accountDebt: DEBT_3X,
  totalValue: TVL_2X,
  accountDebtAfter: DEBT_2X,
  ops: [{ type: "decreaseDebt", amount: STEP }],
};

/** RWA market: the asset is wrapped back into the underlying to repay. */
export const case_decrease_rwa: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: RWA_ASSET },
  tokens: [caToken(RWA_ASSET, TVL_3X, QUOTA_1500)],
  accountDebt: DEBT_3X,
  totalValue: TVL_2X,
  accountDebtAfter: DEBT_2X,
  ops: [
    {
      type: "wrapRwaCollateral",
      tokenIn: RWA_ASSET,
      amount: STEP,
      tokenOut: UND,
      amountOut: STEP,
    },
    { type: "decreaseDebt", amount: STEP },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: RWA_ASSET, balance: QUOTA_DOWN }],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

/** Target equals the current leverage: nothing to do. */
export const case_noop: AdjustLeverageCase = {
  intent: { type: "ADJUST_LEVERAGE", targetLeverage: LEV_2X, token: POS },
  tokens: [caToken(POS, TVL_2X, QUOTA_1000)],
  accountDebt: DEBT_2X,
  totalValue: TVL_2X,
  accountDebtAfter: DEBT_2X,
  ops: [],
};

export function buildAdjustLeverageSdk(c: AdjustLeverageCase): OnchainSDK {
  return buildMarketSdk({ rwaAssets: c.rwaAssets });
}

export function buildAdjustLeverageProps(
  c: AdjustLeverageCase,
  sdk: OnchainSDK,
) {
  return {
    intent: c.intent,
    creditAccount: buildFixtureCreditAccount({
      accountDebt: c.accountDebt,
      tokens: c.tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  };
}
