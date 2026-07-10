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

// TODO: HARDCODED, should be loaded from address provider
const WITHDRAWAL_COMPRESSORS: Partial<
  Record<NetworkType, Partial<Record<WithdrawalCompressorVersion, Address>>>
> = {
  Mainnet: {
    310: "0x36F3d0Bb73CBC2E94fE24dF0f26a689409cF9023",
    313: "0x9605D59E40963ADce8a6895Aa3Fa497320Ef3F3b",
  },
  Monad: {
    310: "0x36F3d0Bb73CBC2E94fE24dF0f26a689409cF9023",
  },
};

/**
 * Returns the withdrawal compressor deployment for the given network,
 * or `undefined` if none is configured.
 * @param network - Network type.
 * @param version - Desired compressor version; when omitted, the latest supported version is returned.
 * @returns Withdrawal compressor address and version, or `undefined`.
 **/
export function getWithdrawalCompressorAddress(
  network: NetworkType,
  version?: WithdrawalCompressorVersion,
): WithdrawalCompressorLocation | undefined {
  const deployments = WITHDRAWAL_COMPRESSORS[network];
  if (!deployments) {
    return undefined;
  }
  if (version !== undefined) {
    const address = deployments[version];
    return address ? { address, version } : undefined;
  }
  const latest = Object.keys(deployments)
    .map(Number)
    .sort((a, b) => b - a)[0] as WithdrawalCompressorVersion | undefined;
  if (latest === undefined) {
    return undefined;
  }
  const address = deployments[latest];
  return address ? { address, version: latest } : undefined;
}
