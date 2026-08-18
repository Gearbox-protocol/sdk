import { type Address, isAddressEqual } from "viem";
import type { Bps } from "../../model/index.js";
import {
  DUST_THRESHOLD,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  WAD,
} from "../constants/math.js";
import { AddressMap } from "../utils/AddressMap.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Shared market-side inputs of a liquidation-price calculation.
 **/
export interface CalcLiquidationPriceProps {
  snapshot: AccountSnapshot;
  /**
   * Market underlying. Its balance under its LT is subtracted from the debt.
   **/
  underlying: Address;
  /**
   * Token decimals. Missing keys default to 18.
   **/
  decimals: Record<Address, number>;
  /**
   * Liquidation thresholds in basis points. Missing keys are treated as 0.
   **/
  liquidationThresholds: Record<Address, Bps>;
}

/**
 * Inputs of {@link calcLiquidationPriceForTarget}.
 **/
export interface CalcLiquidationPriceForTargetProps
  extends CalcLiquidationPriceProps {
  /**
   * Collateral token whose liquidation price to compute.
   **/
  targetToken: Address;
}

/**
 * Liquidation price of an explicitly named collateral token, in
 * `PRICE_DECIMALS` fixed point; `0n` when the account holds none of it or the
 * token has no liquidation threshold. Formula is in parity with the legacy
 * `liquidationPrice`: the effective debt (debt less the underlying balance's
 * contribution under its threshold) over the threshold-weighted target
 * balance.
 **/
export function calcLiquidationPriceForTarget(
  props: CalcLiquidationPriceForTargetProps,
): bigint {
  const { snapshot, targetToken, underlying, decimals, liquidationThresholds } =
    props;
  const decimalsByToken = new AddressMap(Object.entries(decimals));
  const lts = new AddressMap(Object.entries(liquidationThresholds));

  const underlyingDecimals = decimalsByToken.get(underlying) ?? 18;
  const underlyingBalance =
    snapshot.assets.find(a => isAddressEqual(a.token, underlying))?.balance ??
    0n;

  // effectiveDebt = Debt - underlyingBalance*LTunderlying
  const ltUnderlying = BigInt(lts.get(underlying) ?? 0);
  const effectiveDebt =
    ((snapshot.totalDebt -
      (underlyingBalance * ltUnderlying) / PERCENTAGE_FACTOR) *
      WAD) /
    10n ** BigInt(underlyingDecimals);

  const targetDecimals = decimalsByToken.get(targetToken) ?? 18;
  const targetBalance =
    snapshot.assets.find(a => isAddressEqual(a.token, targetToken))?.balance ??
    0n;
  const effectiveTargetBalance =
    (targetBalance * WAD) / 10n ** BigInt(targetDecimals);

  const lpLT = BigInt(lts.get(targetToken) ?? 0);

  if (targetBalance <= DUST_THRESHOLD || lpLT <= 0n) {
    return 0n;
  }

  // priceTarget = effectiveDebt / (lpLT*targetBalance)
  return (
    (effectiveDebt * PRICE_DECIMALS * PERCENTAGE_FACTOR) /
    (effectiveTargetBalance * lpLT)
  );
}
