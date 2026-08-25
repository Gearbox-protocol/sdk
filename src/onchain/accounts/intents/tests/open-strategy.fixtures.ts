import type { Address } from "viem";
import type { Asset, OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import type { OpenStrategyProps } from "../open-strategy.js";
import {
  ANY,
  buildMarketSdk,
  CREDIT_MANAGER,
  type MarketSdkExtras,
  POS,
  TOK_DECIMALS,
  UND,
  UND_DECIMALS,
  valueInUnd,
} from "../testing/market.js";

/**
 * Open-strategy fixtures.
 *
 * `POS` is the target throughout: it is 1:1 with `UND`, so the mock router's
 * oracle-priced output stays readable while the `ANY` leg (18 decimals, half the
 * price) still exercises the rescaling.
 */

export const LT = 9200n;

/** Quota bought for a projected balance: value in UND scaled by its LT. */
export function quotaFor(amount: bigint, token: Address): bigint {
  return (valueInUnd(amount, token) * LT) / 10000n;
}

/** 1000 UND of margin. */
export const MARGIN_UND = toBN("1000", UND_DECIMALS);
/** 500 UND. */
export const HALF_UND = toBN("500", UND_DECIMALS);
/** 1000 ANY = 500 UND at fixture prices. */
export const COLLATERAL_ANY = toBN("1000", TOK_DECIMALS);
/** ANY balance to keep unswapped: 400 ANY = 200 UND. */
export const KEEP_ANY = toBN("400", TOK_DECIMALS);

export const LEVERAGE_1X = 100n;
export const LEVERAGE_2X = 200n;
export const LEVERAGE_3X = 300n;

export interface OpenStrategyCase {
  collateral: Asset[];
  targetToken: Address;
  leverage: bigint;
  leftoverBalances?: Asset[];
  /** Margin in UND. */
  expectedCollateral: bigint;
  expectedDebt: bigint;
  /** Balances the account should hold once the path executes. */
  expectedAssets: Asset[];
  /** Balances the router should be asked to route (collateral + debt). */
  expectedRouterBalances: Asset[];
}

/** Plain 3x on underlying margin: everything routes into the position token. */
export const case_underlying_3x: OpenStrategyCase = {
  collateral: [{ token: UND, balance: MARGIN_UND }],
  targetToken: POS,
  leverage: LEVERAGE_3X,
  expectedCollateral: MARGIN_UND,
  expectedDebt: MARGIN_UND * 2n,
  expectedAssets: [{ token: POS, balance: MARGIN_UND * 3n }],
  expectedRouterBalances: [{ token: UND, balance: MARGIN_UND * 3n }],
};

/** 1x — no loan at all, just a spot conversion of the margin. */
export const case_underlying_1x: OpenStrategyCase = {
  collateral: [{ token: UND, balance: MARGIN_UND }],
  targetToken: POS,
  leverage: LEVERAGE_1X,
  expectedCollateral: MARGIN_UND,
  expectedDebt: 0n,
  expectedAssets: [{ token: POS, balance: MARGIN_UND }],
  expectedRouterBalances: [{ token: UND, balance: MARGIN_UND }],
};

/**
 * Mixed margin with a leftover: 500 UND + 1000 ANY (= 500 UND) at 2x.
 *
 * 400 ANY stays put, so only 600 ANY (= 300 UND) plus the whole 1500 UND is
 * routed, and the kept ANY needs a quota of its own.
 */
export const case_mixed_with_leftover: OpenStrategyCase = {
  collateral: [
    { token: UND, balance: HALF_UND },
    { token: ANY, balance: COLLATERAL_ANY },
  ],
  targetToken: POS,
  leverage: LEVERAGE_2X,
  leftoverBalances: [{ token: ANY, balance: KEEP_ANY }],
  expectedCollateral: MARGIN_UND,
  expectedDebt: MARGIN_UND,
  expectedAssets: [
    { token: ANY, balance: KEEP_ANY },
    {
      token: POS,
      balance:
        HALF_UND + MARGIN_UND + valueInUnd(COLLATERAL_ANY - KEEP_ANY, ANY),
    },
  ],
  expectedRouterBalances: [
    { token: UND, balance: HALF_UND + MARGIN_UND },
    { token: ANY, balance: COLLATERAL_ANY },
  ],
};

export function buildOpenStrategySdk(extras?: MarketSdkExtras): OnchainSDK {
  return buildMarketSdk(extras);
}

export function buildOpenStrategyProps(
  c: OpenStrategyCase,
  sdk: OnchainSDK,
): OpenStrategyProps {
  return {
    sdk,
    creditManager: CREDIT_MANAGER,
    collateral: c.collateral,
    targetToken: c.targetToken,
    leverage: c.leverage,
    leftoverBalances: c.leftoverBalances,
    slippage: undefined,
    quotaReserve: undefined,
  };
}
