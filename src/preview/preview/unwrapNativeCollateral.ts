import type { Address } from "viem";
import type { OperationPreviewError } from "../../model/index.js";
import { type Asset, AssetsMap, NATIVE_ADDRESS } from "../../onchain/index.js";
import { invalidTransactionValueError } from "./errors.js";

export interface UnwrapNativeCollateralResult {
  /**
   * Collateral with the native amount unwrapped from the WETH entry.
   */
  assets: Asset[];
  /**
   * Warning set when the transaction value is malformed.
   */
  warning?: OperationPreviewError;
}

/**
 * Represents the transaction's attached native value as a `NATIVE_ADDRESS`
 * entry in the collateral list.
 *
 * The credit facade wraps `msg.value` into WETH before `AddCollateral(WETH)`
 * pulls it, so the WETH collateral amount already includes the attached native
 * value. This helper splits the WETH entry back: the native amount is shown as
 * `NATIVE_ADDRESS` and the WETH entry is reduced accordingly (dropped when it
 * reaches zero). Other entries are preserved.
 *
 * When `nativeAmount` is positive but the WETH collateral is missing or
 * smaller than it, the transaction is malformed: the collateral is returned
 * as-is (no unwrapping) together with an `invalidTransactionValue` warning.
 *
 * @param collateral - Collateral assets as declared by the multicall.
 * @param nativeAmount - Transaction `msg.value`.
 * @param wethToken - Wrapped native token address.
 * @returns Collateral with the native amount unwrapped from the WETH entry,
 * plus the warning on a malformed transaction value.
 */
export function unwrapNativeCollateral(
  collateral: Asset[],
  nativeAmount: bigint,
  wethToken: Address,
): UnwrapNativeCollateralResult {
  if (nativeAmount === 0n) {
    return { assets: collateral };
  }

  const balances = new AssetsMap(collateral);
  const wethBalance = balances.get(wethToken) ?? 0n;
  if (wethBalance < nativeAmount) {
    return {
      assets: collateral,
      warning: invalidTransactionValueError(nativeAmount, wethBalance),
    };
  }

  balances.upsert(
    wethToken,
    wethBalance === nativeAmount ? undefined : wethBalance - nativeAmount,
  );
  balances.inc(NATIVE_ADDRESS, nativeAmount);
  return { assets: balances.toAssets() };
}
