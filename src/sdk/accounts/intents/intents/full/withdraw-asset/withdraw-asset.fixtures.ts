import type { Address } from "viem";
import type { OnchainSDK } from "../../../../../index.js";
import type { ExpectedFlowOp } from "../../../testing/expect.js";
import {
  ANY,
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  RWA_ASSET,
  UND,
  valueInUnd,
  WALLET,
} from "../../../testing/market.js";
import type { WithdrawAssetIntent } from "../types.js";

/**
 * Start withdraw-asset fixtures (intent 4), covering the cases from the spec's
 * "withdraw collateral intent" section.
 *
 * Debt never moves, so every case is `withdrawCollateral` plus the quota
 * decrease implied by the smaller balance. The one branch is the RWA market
 * forced unwrap when the withdrawn token is the wrapped underlying.
 */

export const LT_ANY = 9200n;

/** 2000 ANY = 1000 UND at fixture prices. */
export const HELD_ANY = 2000000000000000000000n;
/** 1000 UND. */
export const HELD_UND = 100000000000n;
export const DEBT = 50000000000n;

/** Half the ANY position. */
export const OUT_ANY = 1000000000000000000000n;
/** Half the UND balance. */
export const OUT_UND = 50000000000n;

export const QUOTA_ANY_BEFORE = (valueInUnd(HELD_ANY, ANY) * LT_ANY) / 10000n;
export const QUOTA_ANY_AFTER =
  (valueInUnd(HELD_ANY - OUT_ANY, ANY) * LT_ANY) / 10000n;
/** Quota ops carry signed deltas, so a release is negative. */
export const QUOTA_ANY_DELTA = QUOTA_ANY_AFTER - QUOTA_ANY_BEFORE;

export interface WithdrawAssetCase {
  intent: WithdrawAssetIntent;
  tokens: ReturnType<typeof caToken>[];
  accountDebt: bigint;
  totalValue: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

/** Quota token out: withdraw, then release the freed quota. */
export const case_any_token: WithdrawAssetCase = {
  intent: {
    type: "WITHDRAW_ASSET",
    token: ANY,
    amount: OUT_ANY,
    to: WALLET,
  },
  tokens: [caToken(UND, HELD_UND), caToken(ANY, HELD_ANY, QUOTA_ANY_BEFORE)],
  accountDebt: DEBT,
  totalValue: HELD_UND + valueInUnd(HELD_ANY - OUT_ANY, ANY),
  ops: [
    {
      type: "withdrawCollateral",
      token: ANY,
      amount: OUT_ANY,
      to: WALLET,
    },
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: ANY, balance: QUOTA_ANY_DELTA }],
      desiredQuota: {},
    },
  ],
};

/** Underlying out on a plain market: no quota, no unwrap. */
export const case_underlying: WithdrawAssetCase = {
  intent: {
    type: "WITHDRAW_ASSET",
    token: UND,
    amount: OUT_UND,
    to: WALLET,
  },
  tokens: [caToken(UND, HELD_UND)],
  accountDebt: DEBT,
  totalValue: HELD_UND - OUT_UND,
  ops: [
    {
      type: "withdrawCollateral",
      token: UND,
      amount: OUT_UND,
      to: WALLET,
    },
  ],
};

/**
 * Underlying out on an RWA market: the wrapper cannot leave the account, so it
 * is force-unwrapped and the rwa asset is withdrawn instead.
 */
export const case_rwa_underlying: WithdrawAssetCase = {
  intent: {
    type: "WITHDRAW_ASSET",
    token: UND,
    amount: OUT_UND,
    to: WALLET,
  },
  tokens: [caToken(UND, HELD_UND)],
  accountDebt: DEBT,
  totalValue: HELD_UND - OUT_UND,
  ops: [
    {
      type: "unwrapRwaCollateral",
      tokenIn: UND,
      amount: OUT_UND,
      tokenOut: RWA_ASSET,
      // UND and RWA_ASSET share decimals, so the rescale is identity.
      amountOut: OUT_UND,
    },
    {
      type: "withdrawCollateral",
      token: RWA_ASSET,
      amount: OUT_UND,
      to: WALLET,
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

export function buildWithdrawAssetSdk(c: WithdrawAssetCase): OnchainSDK {
  return buildMarketSdk({ rwaAssets: c.rwaAssets });
}

export function buildWithdrawAssetProps(c: WithdrawAssetCase, sdk: OnchainSDK) {
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
