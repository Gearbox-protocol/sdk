import { type Address, isAddressEqual } from "viem";
import { type Asset, NATIVE_ADDRESS } from "../../sdk/index.js";
import { InvalidTransactionValueError } from "./errors.js";

/**
 * Represents the transaction's attached native value as a `NATIVE_ADDRESS`
 * entry in the collateral list.
 *
 * The credit facade wraps `msg.value` into WETH before `AddCollateral(WETH)`
 * pulls it, so the WETH collateral amount already includes the attached native
 * value. This helper splits the WETH entry back: the native amount is shown as
 * `NATIVE_ADDRESS` and the WETH entry is reduced accordingly (dropped when it
 * reaches zero). Other entries and their order are preserved.
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

  let unwrapped = false;
  const result: Asset[] = [];
  for (const asset of collateral) {
    const isWeth = !unwrapped && isAddressEqual(asset.token, wethToken);
    if (!isWeth) {
      result.push(asset);
      continue;
    }

    if (asset.balance < nativeAmount) {
      throw new InvalidTransactionValueError(nativeAmount, asset.balance);
    }
    // split WETH into native part and (possibly empty) WETH remainder
    result.push({ token: NATIVE_ADDRESS, balance: nativeAmount });
    if (asset.balance > nativeAmount) {
      result.push({
        token: asset.token,
        balance: asset.balance - nativeAmount,
      });
    }
    unwrapped = true;
  }

  if (!unwrapped) {
    throw new InvalidTransactionValueError(nativeAmount, 0n);
  }
  return result;
}
