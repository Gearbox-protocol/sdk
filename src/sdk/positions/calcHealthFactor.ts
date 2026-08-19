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
   * to value collateral at the lower of the two feeds.
   **/
  reservePrices?: Record<Address, bigint>;
  /**
   * Value collateral at safe prices — the lower of each token's main and
   * reserve feeds. Debt and quota balances always use the main feed.
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
    const main = pricesByToken.get(token);
    if (!safePrices || !forCollateral) {
      return main;
    }
    const reserve = reservePricesByToken.get(token);
    if (main !== undefined && reserve !== undefined) {
      return BigIntMath.min(main, reserve);
    }
    return main ?? reserve;
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

  const assetMoney = snapshot.assets.reduce((acc, { token, balance }) => {
    if (balance <= DUST_THRESHOLD) {
      return acc;
    }

    const lt = BigInt(lts.get(token) ?? 0);
    const tokenLtWeighted = (convertToUSD(token, balance, true) ?? 0n) * lt;

    const quota = snapshot.quotas.find(q => isAddressEqual(q.token, token));
    const quotaBalance =
      quota && (active.get(token) ?? false) ? quota.balance : 0n;
    const quotaWeighted =
      (convertToUSD(underlying, quotaBalance) ?? 0n) * PERCENTAGE_FACTOR;

    // a token with no quota entry at all is not a quoted token
    const money = quota
      ? BigIntMath.min(quotaWeighted, tokenLtWeighted)
      : tokenLtWeighted;

    return acc + money;
  }, 0n);

  const borrowedMoney = convertToUSD(underlying, snapshot.totalDebt) ?? 0n;
  const hf = borrowedMoney > 0n ? assetMoney / borrowedMoney : 0n;

  return Number(hf);
}
