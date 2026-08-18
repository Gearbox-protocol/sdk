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
   * Oracle prices in 8-decimal (`PRICE_DECIMALS`) fixed point. A missing key
   * is an unpriceable token and contributes nothing.
   **/
  prices: Record<Address, bigint>;
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
    liquidationThresholds,
    activeQuotas,
  } = props;
  if (snapshot.totalDebt === 0n) {
    return Number(MAX_UINT16);
  }

  const decimalsByToken = new AddressMap(Object.entries(decimals));
  const pricesByToken = new AddressMap(Object.entries(prices));
  const lts = new AddressMap(Object.entries(liquidationThresholds));
  const active = new AddressMap(Object.entries(activeQuotas));

  const convertToUSD = (token: Address, amount: bigint): bigint | null => {
    const price = pricesByToken.get(token);
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
    const tokenLtWeighted = (convertToUSD(token, balance) ?? 0n) * lt;

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
