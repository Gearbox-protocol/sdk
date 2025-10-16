import { decodeAbiParameters, Hex } from "viem";

// Define RateKeeperType locally since we're in the SDK package
export type RateKeeperType = "TUMBLER" | "GAUGE";

type AbiParameter = {
  type: string;
  name: string;
  components?: readonly AbiParameter[];
};

// Common ABI patterns for Rate Keeper plugins
export const TUMBLER_RATE_KEEPER_ABI = [
  { type: "address", name: "pool" },
  { type: "uint256", name: "epochSeconds" },
] as const;

export const GAUGE_RATE_KEEPER_ABI = [
  { type: "address", name: "pool" },
  { type: "address", name: "gearStakingAddress" },
] as const;

type VersionedAbi = Record<string, readonly AbiParameter[]>;

/**
 * Mapping from rate keeper type to ABI for decoding deploy params
 * These ABIs correspond to the constructor parameters used in each rate keeper's getDeployParams method
 * Based on the actual encodeAbiParameters calls in the rate keeper implementations
 */
export const rateKeeperDeployParamsAbiMapping: Record<
  RateKeeperType,
  VersionedAbi
> = {
  // Tumbler Rate Keeper - [pool, epochSeconds]
  TUMBLER: {
    "310": TUMBLER_RATE_KEEPER_ABI,
  },
  // Gauge Rate Keeper - [pool, gearStakingAddress]
  GAUGE: {
    "310": GAUGE_RATE_KEEPER_ABI,
  },
} as const;

/**
 * Get the ABI for decoding deploy params for a specific rate keeper type
 * @param rateKeeperType The rate keeper type
 * @param version The version number (defaults to 310)
 * @returns The ABI array for decoding deploy params or null if not found
 */
export function getRateKeeperDeployParamsAbi(
  rateKeeperType: RateKeeperType,
  version: number = 310
): readonly AbiParameter[] | null {
  const versionedMapping = rateKeeperDeployParamsAbiMapping[rateKeeperType];
  return versionedMapping?.[version.toString()] ?? null;
}

/**
 * Parse rate keeper deploy parameters from encoded hex data
 * @param rateKeeperType The rate keeper type
 * @param version The version number
 * @param data The encoded hex data
 * @returns Parsed parameters as key-value pairs or null if parsing fails
 */
export function parseRateKeeperDeployParams(
  rateKeeperPostfix: string,
  version: number,
  data: Hex
): Record<string, string> | null {
  const cleanRateKeeperPostfix = rateKeeperPostfix.replace(/\0/g, "").trim();
  if (!hasRateKeeperDeployParamsAbi(cleanRateKeeperPostfix)) return null;

  const rateKeeperType = cleanRateKeeperPostfix as RateKeeperType;
  const abi = getRateKeeperDeployParamsAbi(rateKeeperType, version);
  if (!abi) return null;

  try {
    const decoded = decodeAbiParameters(abi, data);
    const result = {} as Record<string, string>;
    abi.forEach((param, index) => {
      result[param.name] = String(decoded[index]);
    });
    return result;
  } catch (error) {
    console.error(
      `Failed to parse rate keeper deploy params for ${rateKeeperType}:`,
      error
    );
    return null;
  }
}

/**
 * Check if a rate keeper type has a deploy params ABI defined
 * @param rateKeeperType The rate keeper type to check
 * @returns True if the rate keeper type has an ABI defined
 */
export function hasRateKeeperDeployParamsAbi(
  rateKeeperType: string
): rateKeeperType is RateKeeperType {
  return rateKeeperType in rateKeeperDeployParamsAbiMapping;
}

/**
 * Get all supported rate keeper types
 * @returns Array of supported rate keeper types
 */
export function getSupportedRateKeeperTypes(): RateKeeperType[] {
  return Object.keys(rateKeeperDeployParamsAbiMapping) as RateKeeperType[];
}
