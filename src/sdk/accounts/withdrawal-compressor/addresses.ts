import type { Address } from "viem";
import type { NetworkType } from "../../chain/chains.js";

/**
 * Versions of WithdrawalCompressor supported by the SDK.
 **/
export type WithdrawalCompressorVersion = 310 | 311 | 313;

/**
 * Resolved withdrawal compressor deployment.
 **/
export interface WithdrawalCompressorLocation {
  address: Address;
  version: WithdrawalCompressorVersion;
}

const WITHDRAWAL_COMPRESSORS: Partial<
  Record<NetworkType, WithdrawalCompressorLocation>
> = {
  Mainnet: {
    address: "0x83e5AaC6590Cf9c6Dd323851a0D66fEc2Bc4F5A3",
    version: 313,
  },
  Monad: {
    address: "0x36F3d0Bb73CBC2E94fE24dF0f26a689409cF9023",
    version: 310,
  },
};

/**
 * Returns the withdrawal compressor deployment for the given network,
 * or `undefined` if none is configured.
 * @param network - Network type.
 * @returns Withdrawal compressor address and version, or `undefined`.
 **/
export function getWithdrawalCompressorAddress(
  network: NetworkType,
): WithdrawalCompressorLocation | undefined {
  return WITHDRAWAL_COMPRESSORS[network];
}
