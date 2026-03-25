import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";
import { PERCENTAGE_FACTOR, PRICE_DECIMALS, WAD } from "../../../sdk/index.js";
import type { TokenDataSlice } from "./types.js";

interface LiquidationPriceProps {
  liquidationThresholds: Record<Address, bigint>;

  debt: bigint;
  underlyingToken: Address;
  targetToken: Address;
  assets: Record<Address, Asset>;
  tokensList: Record<Address, TokenDataSlice>;
}

export function liquidationPrice({
  liquidationThresholds,

  debt,
  underlyingToken,
  targetToken,
  assets,
  tokensList,
}: LiquidationPriceProps) {
  const underlyingDecimals = tokensList[underlyingToken]?.decimals || 18;
  const { balance: underlyingBalance = 0n } = assets[underlyingToken] || {};

  // effectiveDebt = Debt - underlyingBalance*LTunderlying
  const ltUnderlying = liquidationThresholds[underlyingToken] || 0n;
  const effectiveDebt =
    ((debt - (underlyingBalance * ltUnderlying) / PERCENTAGE_FACTOR) * WAD) /
    10n ** BigInt(underlyingDecimals);

  const targetDecimals = tokensList[targetToken]?.decimals || 18;
  const { balance: targetBalance = 0n } = assets[targetToken] || {};
  const effectiveTargetBalance =
    (targetBalance * WAD) / 10n ** BigInt(targetDecimals);

  const lpLT = liquidationThresholds[targetToken] || 0n;

  if (targetBalance <= 0n || lpLT <= 0n) return 0n;

  // priceTarget = effectiveDebt / (lpLT*targetBalance)
  return (
    (effectiveDebt * PRICE_DECIMALS * PERCENTAGE_FACTOR) /
    (effectiveTargetBalance * lpLT)
  );
}
