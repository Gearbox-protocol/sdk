import { MIN_INT96 } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import type { ExpectedFlowOp } from "../testing/expect.js";
import {
  ANY,
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  type MarketSdkExtras,
  UND,
  valueInUnd,
} from "../testing/market.js";
import type { UpdateQuotaIntent } from "../types.js";

/**
 * Start update-quota fixtures.
 *
 * The account holds 1000 UND and 2000 ANY (another 1000 UND) against 500 UND of
 * debt. Nothing moves, so every case is a single `changeQuota` and the totals
 * stand still.
 */

export const BASE_UND = 100000000000n;
export const BALANCE_ANY = 2000000000000000000000n;
export const DEBT = 50000000000n;
/** What 2000 ANY is sized to: 1000 UND × 92%. */
export const SIZED_ANY = 92000000000n;
export const TOTAL_VALUE = BASE_UND + valueInUnd(BALANCE_ANY, ANY);

export interface UpdateQuotaCase {
  intent: UpdateQuotaIntent;
  /** ANY's quota before the operation. */
  current: bigint;
  /** Balances besides ANY; the underlying by default. */
  others?: ReturnType<typeof caToken>[];
  totalDebt?: bigint;
  ops: ExpectedFlowOp[];
  /** ANY's quota afterwards. */
  quotaAfter: bigint;
  /** `minQuota` sent to the facade for ANY. */
  minQuota: bigint;
  extras?: MarketSdkExtras;
}

/** Omitted quota on an unquoted balance: bought at balance × LT. */
export const case_auto_increase: UpdateQuotaCase = {
  intent: { type: "UPDATE_QUOTA", token: ANY },
  current: 0n,
  ops: [
    {
      type: "changeQuota",
      quotaIncrease: [{ token: ANY, balance: SIZED_ANY }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  quotaAfter: SIZED_ANY,
  minQuota: 10000n,
};

/** A lower target: the quota drops to exactly it. */
export const case_target_decrease: UpdateQuotaCase = {
  intent: { type: "UPDATE_QUOTA", token: ANY, quota: 40000000000n },
  current: SIZED_ANY,
  ops: [
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: ANY, balance: 40000000000n - SIZED_ANY }],
      desiredQuota: {},
    },
  ],
  quotaAfter: 40000000000n,
  minQuota: 40000000000n,
};

/** Target 0: the quota is reset with the sentinel. */
export const case_target_disable: UpdateQuotaCase = {
  intent: { type: "UPDATE_QUOTA", token: ANY, quota: 0n },
  current: SIZED_ANY,
  ops: [
    {
      type: "changeQuota",
      quotaIncrease: [],
      quotaDecrease: [{ token: ANY, balance: MIN_INT96 }],
      desiredQuota: {},
    },
  ],
  quotaAfter: 0n,
  minQuota: 0n,
};

export function buildUpdateQuotaSdk(c: UpdateQuotaCase): OnchainSDK {
  return buildMarketSdk(c.extras);
}

export function buildUpdateQuotaProps(c: UpdateQuotaCase, sdk: OnchainSDK) {
  return {
    intent: c.intent,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: c.totalDebt ?? DEBT,
      tokens: [
        ...(c.others ?? [caToken(UND, BASE_UND)]),
        caToken(ANY, BALANCE_ANY, c.current),
      ],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  };
}
