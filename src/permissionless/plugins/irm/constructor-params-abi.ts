import { decodeAbiParameters, Hex } from "viem";

// Define InterestRateModelType locally since we're in the SDK package
export type InterestRateModelType = "LINEAR";

type AbiParameter = {
  type: string;
  name: string;
  components?: readonly AbiParameter[];
};

// Common ABI patterns for IRM plugins
export const LINEAR_IRM_ABI = [
  { type: "uint256", name: "U_1" },
  { type: "uint256", name: "U_2" },
  { type: "uint256", name: "R_base" },
  { type: "uint256", name: "R_slope1" },
  { type: "uint256", name: "R_slope2" },
  { type: "uint256", name: "R_slope3" },
  { type: "bool", name: "isBorrowingMoreU2Forbidden" },
] as const;

type VersionedAbi = Record<string, readonly AbiParameter[]>;

/**
 * Mapping from IRM type to ABI for decoding deploy params
 * These ABIs correspond to the constructor parameters used in each IRM's getDeployParams method
 * Based on the actual encodeAbiParameters calls in the IRM implementations
 */
export const irmDeployParamsAbiMapping: Record<
  InterestRateModelType,
  VersionedAbi
> = {
  // Linear IRM - [U_1, U_2, R_base, R_slope1, R_slope2, R_slope3, isBorrowingMoreU2Forbidden]
  LINEAR: {
    "310": LINEAR_IRM_ABI,
  },
} as const;

/**
 * Get the ABI for decoding deploy params for a specific IRM type
 * @param irmType The IRM type
 * @param version The version number (defaults to 310)
 * @returns The ABI array for decoding deploy params or null if not found
 */
export function getIrmDeployParamsAbi(
  irmType: InterestRateModelType,
  version: number = 310
): readonly AbiParameter[] | null {
  const versionedMapping = irmDeployParamsAbiMapping[irmType];
  return versionedMapping?.[version.toString()] ?? null;
}

/**
 * Parse IRM deploy parameters from encoded hex data
 * @param irmType The IRM type
 * @param version The version number
 * @param data The encoded hex data
 * @returns Parsed parameters as key-value pairs or null if parsing fails
 */
export function parseIrmDeployParams(
  irmPostfix: string,
  version: number,
  data: Hex
): Record<string, string> | null {
  const cleanIrmPostfix = irmPostfix.replace(/\0/g, "").trim();
  if (!hasIrmDeployParamsAbi(cleanIrmPostfix)) return null;

  const irmType = cleanIrmPostfix as InterestRateModelType;
  const abi = getIrmDeployParamsAbi(irmType, version);
  if (!abi) return null;

  try {
    const decoded = decodeAbiParameters(abi, data);
    const result = {} as Record<string, string>;
    abi.forEach((param, index) => {
      result[param.name] = String(decoded[index]);
    });
    return result;
  } catch (error) {
    console.error(`Failed to parse IRM deploy params for ${irmType}:`, error);
    return null;
  }
}

/**
 * Check if an IRM type has a deploy params ABI defined
 * @param irmType The IRM type to check
 * @returns True if the IRM type has an ABI defined
 */
export function hasIrmDeployParamsAbi(
  irmType: string
): irmType is InterestRateModelType {
  return irmType in irmDeployParamsAbiMapping;
}

/**
 * Get all supported IRM types
 * @returns Array of supported IRM types
 */
export function getSupportedIrmTypes(): InterestRateModelType[] {
  return Object.keys(irmDeployParamsAbiMapping) as InterestRateModelType[];
}
