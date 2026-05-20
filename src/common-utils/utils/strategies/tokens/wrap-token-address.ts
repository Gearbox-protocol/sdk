import type { Address } from "viem";

export function wrapTokenAddress(
  tokenAddress: Address,
  nativeTokenAddress: Address,
  wrappedNativeTokenAddress: Address | undefined,
) {
  if (wrappedNativeTokenAddress && tokenAddress === nativeTokenAddress) {
    return wrappedNativeTokenAddress;
  }
  return tokenAddress;
}
