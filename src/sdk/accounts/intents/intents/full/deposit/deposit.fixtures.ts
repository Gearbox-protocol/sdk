import type { Address } from "viem";
import type { OnchainSDK } from "../../../../../index.js";
import type { ExpectedFlowOp } from "../../../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  RWA_ASSET,
  UND,
} from "../../../testing/market.js";
import type { DepositStrategyIntent } from "../types.js";

/**
 * Start deposit fixtures (intents 1.1 and 1.2).
 *
 * Every case starts from 1000 UND of TVL against 500 UND of debt — 500 UND of
 * collateral at 2x — and deposits another 500 UND. At the preserved 2x that
 * draws 500 more debt; targeting 3x draws 1500.
 *
 * `POS` converts 1:1 with `UND`, which keeps swap-leg amounts honest against the
 * mock router's echo behaviour.
 */

const LT = 9200n;
const quotaOf = (balance: bigint) => (balance * LT) / 10000n;

/** 500 UND. */
export const DEP = 50000000000n;
export const P1000 = 100000000000n;
export const P2000 = 200000000000n;
export const P3000 = 300000000000n;

export const DEBT_START = DEP;

export const QUOTA_1000 = quotaOf(P1000);
export const QUOTA_2000 = quotaOf(P2000);
export const QUOTA_3000 = quotaOf(P3000);

export const LEV_3X = 300n;

export interface DepositCase {
  intent: DepositStrategyIntent;
  tokens: ReturnType<typeof caToken>[];
  accountDebt: bigint;
  totalValue: bigint;
  accountDebtAfter: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

/** 1.1 — leverage preserved: deposit 500, borrow 500, buy 1000 of the position. */
export const case_fixed_leverage: DepositCase = {
  intent: {
    type: "DEPOSIT",
    token: UND,
    amount: DEP,
    positionToken: POS,
  },
  tokens: [caToken(POS, P1000, QUOTA_1000)],
  accountDebt: DEBT_START,
  totalValue: P2000,
  accountDebtAfter: P1000,
  ops: [
    { type: "addCollateral", token: UND, amount: DEP, value: undefined },
    { type: "increaseDebt", amount: DEP },
    {
      type: "swap",
      from: [{ token: UND, balance: P1000 }],
      tokenOut: POS,
      amountOut: P1000,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: POS, balance: QUOTA_2000 - QUOTA_1000 }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
};

/** 1.2 — deposit and lever up to 3x in one shot. */
export const case_target_leverage: DepositCase = {
  intent: {
    type: "DEPOSIT",
    token: UND,
    amount: DEP,
    positionToken: POS,
    targetLeverage: LEV_3X,
  },
  tokens: [caToken(POS, P1000, QUOTA_1000)],
  accountDebt: DEBT_START,
  totalValue: P3000,
  accountDebtAfter: P2000,
  ops: [
    { type: "addCollateral", token: UND, amount: DEP, value: undefined },
    { type: "increaseDebt", amount: P2000 - DEBT_START },
    {
      type: "swap",
      from: [{ token: UND, balance: P2000 }],
      tokenOut: POS,
      amountOut: P2000,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: POS, balance: QUOTA_3000 - QUOTA_1000 }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
};

/** Position is the underlying itself: borrow and stop, nothing to convert. */
export const case_position_is_underlying: DepositCase = {
  intent: {
    type: "DEPOSIT",
    token: UND,
    amount: DEP,
    positionToken: UND,
  },
  tokens: [caToken(UND, P1000)],
  accountDebt: DEBT_START,
  totalValue: P2000,
  accountDebtAfter: P1000,
  ops: [
    { type: "addCollateral", token: UND, amount: DEP, value: undefined },
    { type: "increaseDebt", amount: DEP },
  ],
};

/** RWA market: the unwrapped asset is deposited, wrapped, then routed. */
export const case_rwa_collateral: DepositCase = {
  intent: {
    type: "DEPOSIT",
    token: RWA_ASSET,
    amount: DEP,
    positionToken: POS,
  },
  tokens: [caToken(POS, P1000, QUOTA_1000)],
  accountDebt: DEBT_START,
  totalValue: P2000,
  accountDebtAfter: P1000,
  ops: [
    { type: "addCollateral", token: RWA_ASSET, amount: DEP, value: undefined },
    {
      type: "wrapRwaCollateral",
      tokenIn: RWA_ASSET,
      amount: DEP,
      tokenOut: UND,
      amountOut: DEP,
    },
    { type: "increaseDebt", amount: DEP },
    {
      type: "swap",
      from: [{ token: UND, balance: P1000 }],
      tokenOut: POS,
      amountOut: P1000,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: POS, balance: QUOTA_2000 - QUOTA_1000 }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

/**
 * RWA market where the position token is the asset itself: the deposit stays put
 * and only the borrowed underlying is unwrapped.
 */
export const case_rwa_position: DepositCase = {
  intent: {
    type: "DEPOSIT",
    token: RWA_ASSET,
    amount: DEP,
    positionToken: RWA_ASSET,
  },
  tokens: [caToken(RWA_ASSET, P1000, QUOTA_1000)],
  accountDebt: DEBT_START,
  totalValue: P2000,
  accountDebtAfter: P1000,
  ops: [
    { type: "addCollateral", token: RWA_ASSET, amount: DEP, value: undefined },
    { type: "increaseDebt", amount: DEP },
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: DEP,
      tokenOut: RWA_ASSET,
      amountOut: DEP,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: RWA_ASSET, balance: QUOTA_2000 - QUOTA_1000 }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

export function buildDepositSdk(c: DepositCase): OnchainSDK {
  return buildMarketSdk({ rwaAssets: c.rwaAssets });
}

export function buildDepositProps(c: DepositCase, sdk: OnchainSDK) {
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
