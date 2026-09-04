import type { Address } from "viem";
import type { OnchainSDK } from "../../../index.js";
import type { ExpectedFlowOp } from "../testing/expect.js";
import {
  ANY,
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  RWA_ASSET,
  UND,
  valueInUnd,
} from "../testing/market.js";
import type { AddCollateralIntent } from "../types.js";

/**
 * Start add-collateral fixtures (intent 5).
 *
 * Only the position token can be deposited, so every case is a single
 * `addCollateral` plus the quota increase implied by the new balance. Debt never
 * moves.
 */

/** Quota bought for a freshly obtained balance: value in UND scaled by its LT. */
function quotaFor(amount: bigint, token: Address, lt: bigint): bigint {
  return (valueInUnd(amount, token) * lt) / 10000n;
}

export const LT_ANY = 9200n;

/** 1000 UND of pre-existing collateral, 500 UND of debt. */
export const BASE_UND = 100000000000n;
export const DEBT = 50000000000n;

/** 2000 ANY = 1000 UND at fixture prices. */
export const ADD_ANY = 2000000000000000000000n;
/** 500 UND. */
export const ADD_UND = 50000000000n;
/** 1000 RWA_ASSET = 1000 UND at fixture prices. */
export const ADD_RWA = 100000000000n;

export const QUOTA_ANY = quotaFor(ADD_ANY, ANY, LT_ANY);
export const QUOTA_RWA = quotaFor(ADD_RWA, RWA_ASSET, LT_ANY);

export interface AddCollateralCase {
  intent: AddCollateralIntent;
  /** Balances already on the account. */
  tokens: ReturnType<typeof caToken>[];
  totalDebt: bigint;
  /** Expected TVL in UND after the operation. */
  totalValue: bigint;
  ops: ExpectedFlowOp[];
  rwaAssets?: Record<Address, Address>;
}

/** Position token with a quota: addCollateral then buy quota for it. */
export const case_position_token: AddCollateralCase = {
  intent: { type: "ADD_COLLATERAL", token: ANY, amount: ADD_ANY },
  tokens: [caToken(UND, BASE_UND)],
  totalDebt: DEBT,
  totalValue: BASE_UND + valueInUnd(ADD_ANY, ANY),
  ops: [
    { type: "addCollateral", token: ANY, amount: ADD_ANY, value: undefined },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: ANY, balance: QUOTA_ANY }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
};

/** Underlying has no quota, so the flow is a bare addCollateral. */
export const case_underlying: AddCollateralCase = {
  intent: { type: "ADD_COLLATERAL", token: UND, amount: ADD_UND },
  tokens: [caToken(ANY, ADD_ANY, QUOTA_ANY)],
  totalDebt: DEBT,
  totalValue: valueInUnd(ADD_ANY, ANY) + ADD_UND,
  ops: [
    { type: "addCollateral", token: UND, amount: ADD_UND, value: undefined },
  ],
};

/** RWA market: the rwa asset is deposited as-is, with no wrap leg. */
export const case_rwa_asset: AddCollateralCase = {
  intent: { type: "ADD_COLLATERAL", token: RWA_ASSET, amount: ADD_RWA },
  tokens: [caToken(UND, BASE_UND)],
  totalDebt: DEBT,
  totalValue: BASE_UND + valueInUnd(ADD_RWA, RWA_ASSET),
  ops: [
    {
      type: "addCollateral",
      token: RWA_ASSET,
      amount: ADD_RWA,
      value: undefined,
    },
    {
      type: "changeQuota",
      quotaIncrease: [{ token: RWA_ASSET, balance: QUOTA_RWA }],
      quotaDecrease: [],
      desiredQuota: {},
    },
  ],
  rwaAssets: { [UND]: RWA_ASSET },
};

export function buildAddCollateralSdk(c: AddCollateralCase): OnchainSDK {
  return buildMarketSdk({ rwaAssets: c.rwaAssets });
}

export function buildAddCollateralProps(c: AddCollateralCase, sdk: OnchainSDK) {
  return {
    intent: c.intent,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: c.totalDebt,
      tokens: c.tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  };
}
