import { type Address, isAddressEqual } from "viem";
import type { Bps } from "../../model/index.js";
import {
  DUST_THRESHOLD,
  MAX_UINT16,
  PERCENTAGE_FACTOR,
} from "../constants/math.js";
import { AddressMap } from "../utils/AddressMap.js";
import { BigIntMath } from "../utils/bigint-math.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Inputs of {@link calcHealthFactor}.
 **/
export interface CalcHealthFactorProps {
  snapshot: AccountSnapshot;
  /**
   * Market underlying. Debt and quota balances are valued in this token.
   **/
  underlying: Address;
  /**
   * Token decimals. Missing keys default to 18.
   **/
  decimals: Record<Address, number>;
  /**
   * Oracle main-feed prices in 8-decimal (`PRICE_DECIMALS`) fixed point. A
   * missing key is an unpriceable token and contributes nothing.
   **/
  prices: Record<Address, bigint>;
  /**
   * Oracle reserve-feed prices, when available. Used with {@link safePrices}
   * to value collateral at the protocol safe price. A token present in
   * {@link prices} but missing here is untrusted and contributes 0, matching
   * on-chain `_getSafePrice`.
   **/
  reservePrices?: Record<Address, bigint>;
  /**
   * Value collateral at safe prices — `min(main, reserve)`, or 0 when the
   * token has no reserve feed. The underlying is exempt and always uses the
   * main feed, matching `CreditManagerV3._safeConvertToUSD`. Debt and quota
   * balances always use the main feed.
   **/
  safePrices?: boolean;
  /**
   * Liquidation thresholds in basis points. Missing keys are treated as 0.
   **/
  liquidationThresholds: Record<Address, Bps>;
  /**
   * Whether each token's quota is currently active. Missing keys are inactive.
   **/
  activeQuotas: Record<Address, boolean>;
  /**
   * Executable checks read the oracle strictly instead of using display maps
   * which omit failed feeds. Keeping the reader here reuses the same arithmetic
   * while allowing a required invalid feed to propagate its actual failure.
   */
  readPrice?: (token: Address, forCollateral: boolean) => bigint;
  /**
   * Contract-style lazy check: stop once this HF is backed. The returned factor
   * is then a sufficient lower bound, not the displayed whole-account metric.
   * Assets must be ordered as collateralHints / quoted tokens, underlying last.
   */
  stopAt?: Bps;
}

/**
 * Health factor of an account state, in basis points (`10000` = 1.0).
 *
 * Collateral is valued under liquidation thresholds, with quoted tokens
 * capped by their quota, and compared against the debt's value. An account
 * with no debt reports `65535` (`MAX_UINT16`), the contract's own sentinel
 * scaled down. Formulas are in parity with the legacy `calcHealthFactor`.
 * Tokens with no price in {@link CalcHealthFactorProps.prices} contribute
 * nothing.
 **/
export function calcHealthFactor(props: CalcHealthFactorProps): Bps {
  const {
    snapshot,
    underlying,
    decimals,
    prices,
    reservePrices = {},
    safePrices = false,
    liquidationThresholds,
    activeQuotas,
  } = props;
  if (snapshot.totalDebt === 0n) {
    return Number(MAX_UINT16);
  }

  const decimalsByToken = new AddressMap(Object.entries(decimals));
  const pricesByToken = new AddressMap(Object.entries(prices));
  const reservePricesByToken = new AddressMap(Object.entries(reservePrices));
  const lts = new AddressMap(Object.entries(liquidationThresholds));
  const active = new AddressMap(Object.entries(activeQuotas));

  const priceOf = (
    token: Address,
    forCollateral: boolean,
  ): bigint | undefined => {
    if (props.readPrice) return props.readPrice(token, forCollateral);
    const main = pricesByToken.get(token);
    if (!safePrices || !forCollateral || isAddressEqual(token, underlying)) {
      return main;
    }
    if (main === undefined) {
      return undefined;
    }
    const reserve = reservePricesByToken.get(token);
    if (reserve === undefined) {
      return 0n;
    }
    return BigIntMath.min(main, reserve);
  };

  const convertToUSD = (
    token: Address,
    amount: bigint,
    forCollateral = false,
  ): bigint | null => {
    const price = priceOf(token, forCollateral);
    if (price === undefined) {
      return null;
    }
    const scale = 10n ** BigInt(decimalsByToken.get(token) ?? 18);
    return (amount * price) / scale;
  };

  // Debt is priced first on-chain. A zero debt returns above without reading
  // collateral feeds; an invalid reserve on an irrelevant token cannot block it.
  const borrowedMoney = convertToUSD(underlying, snapshot.totalDebt) ?? 0n;
  // Keep existing display precision; executable checks round each weighted
  // token to whole oracle USD units before comparing the Solidity target.
  const rounding = props.stopAt === undefined ? 1n : PERCENTAGE_FACTOR;
  let assetMoney = 0n;
  for (const { token, balance } of snapshot.assets) {
    if (balance <= (props.readPrice ? 0n : DUST_THRESHOLD)) {
      if (
        props.stopAt !== undefined &&
        assetMoney >= (borrowedMoney * BigInt(props.stopAt)) / rounding
      )
        return props.stopAt;
      continue;
    }

    const lt = BigInt(lts.get(token) ?? 0);
    // Solidity rounds each token's weighted USD value before summing. Keeping
    // fractional USD across tokens could incorrectly pass a boundary check.
    const tokenLtWeighted =
      ((convertToUSD(token, balance, true) ?? 0n) * lt) / rounding;

    const quota = snapshot.quotas.find(q => isAddressEqual(q.token, token));
    const quotaBalance =
      quota && (active.get(token) ?? false) ? quota.balance : 0n;
    const quotaWeighted =
      ((convertToUSD(underlying, quotaBalance) ?? 0n) * PERCENTAGE_FACTOR) /
      rounding;

    // a token with no quota entry at all is not a quoted token
    const money = quota
      ? BigIntMath.min(quotaWeighted, tokenLtWeighted)
      : tokenLtWeighted;

    assetMoney += money;
    if (
      props.stopAt !== undefined &&
      assetMoney >= (borrowedMoney * BigInt(props.stopAt)) / rounding
    )
      return props.stopAt;
  }
  const hf = borrowedMoney > 0n ? (assetMoney * rounding) / borrowedMoney : 0n;

  return Number(hf);
}
