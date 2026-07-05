import type { Address } from "viem";
import { type Asset, AssetsMap, NATIVE_ADDRESS } from "../../sdk/index.js";
import { InvalidTransactionValueError } from "./errors.js";

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
 * @param collateral - Collateral assets as declared by the multicall.
 * @param nativeAmount - Transaction `msg.value`.
 * @param wethToken - Wrapped native token address.
 * @returns Collateral with the native amount unwrapped from the WETH entry.
 * @throws InvalidTransactionValueError when `nativeAmount` is positive but the
 * WETH collateral is missing or smaller than it.
 */
export function unwrapNativeCollateral(
  collateral: Asset[],
  nativeAmount: bigint,
  wethToken: Address,
): Asset[] {
  if (nativeAmount === 0n) {
    return collateral;
  }

  const balances = new AssetsMap(collateral);
  const wethBalance = balances.get(wethToken) ?? 0n;
  if (wethBalance < nativeAmount) {
    throw new InvalidTransactionValueError(nativeAmount, wethBalance);
  }

  balances.upsert(
    wethToken,
    wethBalance === nativeAmount ? undefined : wethBalance - nativeAmount,
  );
  balances.inc(NATIVE_ADDRESS, nativeAmount);
  return balances.toAssets();
}
