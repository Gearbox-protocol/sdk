import { type Address, isAddressEqual } from "viem";
import {
  DUST_THRESHOLD,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  WAD,
} from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Liquidation price of an account state's target collateral, in the oracle's
 * 8-decimal (`PRICE_DECIMALS`) fixed point.
 *
 * As the frontend does, a liquidation price only exists when the account
 * holds exactly one non-dust non-underlying asset; otherwise `null`.
 *
 * @param sdk - Market data source.
 * @param snapshot - Account state to evaluate.
 **/
export function liquidationPrice(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
): bigint | null {
  const market = sdk.marketRegister.findByCreditManager(snapshot.creditManager);
  const underlying = market.pool.underlying;

  const targets = snapshot.assets.filter(
    a => a.balance > DUST_THRESHOLD && !isAddressEqual(a.token, underlying),
  );
  if (targets.length !== 1) {
    return null;
  }
  return liquidationPriceForTarget(sdk, snapshot, targets[0].token);
}

/**
 * Liquidation price of an explicitly named collateral token, in
 * `PRICE_DECIMALS` fixed point; `0n` when the account holds none of it or the
 * token has no liquidation threshold. Formula is in parity with the legacy
 * `liquidationPrice`: the effective debt (debt less the underlying balance's
 * contribution under its threshold) over the threshold-weighted target
 * balance.
 **/
export function liquidationPriceForTarget(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
  targetToken: Address,
): bigint {
  const market = sdk.marketRegister.findByCreditManager(snapshot.creditManager);
  const cm = sdk.marketRegister.findCreditManager(
    snapshot.creditManager,
  ).creditManager;
  const underlying = market.pool.underlying;

  const underlyingDecimals = sdk.tokensMeta.get(underlying)?.decimals ?? 18;
  const underlyingBalance =
    snapshot.assets.find(a => isAddressEqual(a.token, underlying))?.balance ??
    0n;

  // effectiveDebt = Debt - underlyingBalance*LTunderlying
  const ltUnderlying = BigInt(cm.liquidationThresholds.get(underlying) ?? 0);
  const effectiveDebt =
    ((snapshot.debt - (underlyingBalance * ltUnderlying) / PERCENTAGE_FACTOR) *
      WAD) /
    10n ** BigInt(underlyingDecimals);

  const targetDecimals = sdk.tokensMeta.get(targetToken)?.decimals ?? 18;
  const targetBalance =
    snapshot.assets.find(a => isAddressEqual(a.token, targetToken))?.balance ??
    0n;
  const effectiveTargetBalance =
    (targetBalance * WAD) / 10n ** BigInt(targetDecimals);

  const lpLT = BigInt(cm.liquidationThresholds.get(targetToken) ?? 0);

  if (targetBalance <= DUST_THRESHOLD || lpLT <= 0n) {
    return 0n;
  }

  // priceTarget = effectiveDebt / (lpLT*targetBalance)
  return (
    (effectiveDebt * PRICE_DECIMALS * PERCENTAGE_FACTOR) /
    (effectiveTargetBalance * lpLT)
  );
}
