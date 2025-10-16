import { decodeAbiParameters, type Hex } from "viem";

// Define LossPolicyType locally since we're in the SDK package
export type LossPolicyType = "ALIASED";

type AbiParameter = {
  type: string;
  name: string;
  components?: readonly AbiParameter[];
};

// Common ABI patterns for Loss Policy plugins
export const ALIAS_LOSS_POLICY_ABI = [
  { type: "address", name: "pool" },
  { type: "address", name: "addressProvider" },
] as const;

type VersionedAbi = Record<string, readonly AbiParameter[]>;

/**
 * Mapping from loss policy type to ABI for decoding deploy params
 * These ABIs correspond to the constructor parameters used in each loss policy's getDeployParams method
 * Based on the actual encodeAbiParameters calls in the loss policy implementations
 */
export const lossPolicyDeployParamsAbiMapping: Record<
  LossPolicyType,
  VersionedAbi
> = {
  // Alias Loss Policy - [pool, addressProvider]
  ALIASED: {
    "310": ALIAS_LOSS_POLICY_ABI,
  },
} as const;

/**
 * Get the ABI for decoding deploy params for a specific loss policy type
 * @param lossPolicyType The loss policy type
 * @param version The version number (defaults to 310)
 * @returns The ABI array for decoding deploy params or null if not found
 */
export function getLossPolicyDeployParamsAbi(
  lossPolicyType: LossPolicyType,
  version: number = 310,
): readonly AbiParameter[] | null {
  const versionedMapping = lossPolicyDeployParamsAbiMapping[lossPolicyType];
  return versionedMapping?.[version.toString()] ?? null;
}

/**
 * Parse loss policy deploy parameters from encoded hex data
 * @param lossPolicyType The loss policy type
 * @param version The version number
 * @param data The encoded hex data
 * @returns Parsed parameters as key-value pairs or null if parsing fails
 */
export function parseLossPolicyDeployParams(
  lossPolicyPostfix: string,
  version: number,
  data: Hex,
): Record<string, string> | null {
  const cleanLossPolicyPostfix = lossPolicyPostfix.replace(/\0/g, "").trim();
  if (!hasLossPolicyDeployParamsAbi(cleanLossPolicyPostfix)) return null;

  const lossPolicyType = cleanLossPolicyPostfix as LossPolicyType;
  const abi = getLossPolicyDeployParamsAbi(lossPolicyType, version);
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
      `Failed to parse loss policy deploy params for ${lossPolicyType}:`,
      error,
    );
    return null;
  }
}

/**
 * Check if a loss policy type has a deploy params ABI defined
 * @param lossPolicyType The loss policy type to check
 * @returns True if the loss policy type has an ABI defined
 */
export function hasLossPolicyDeployParamsAbi(
  lossPolicyType: string,
): lossPolicyType is LossPolicyType {
  return lossPolicyType in lossPolicyDeployParamsAbiMapping;
}

/**
 * Get all supported loss policy types
 * @returns Array of supported loss policy types
 */
export function getSupportedLossPolicyTypes(): LossPolicyType[] {
  return Object.keys(lossPolicyDeployParamsAbiMapping) as LossPolicyType[];
}
