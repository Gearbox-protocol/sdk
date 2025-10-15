import {
  type AbiParameter,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
} from "viem";
import { json_stringify } from "../../../sdk/index.js";
import { AdapterType } from "../types";
import {
  adapterActionAbi,
  adapterActionSelectors,
  adapterConstructorAbi,
} from ".";

/**
 * Converts a string to AdapterType if valid, otherwise returns null
 * @param value - The string to convert
 * @returns The AdapterType if valid, null otherwise
 */
export function getAdapterType(value: string): AdapterType | null {
  const cleanValue = value.replace(/\0/g, "").trim();
  return Object.values(AdapterType).includes(cleanValue as AdapterType)
    ? (cleanValue as AdapterType)
    : null;
}

/**
 * Get the ABI for decoding deploy params for a specific adapter type
 * @param adapterPostfix Adapter type
 * @param version Adapter version
 * @returns The ABI array for decoding deploy params or null if not found
 */
export function getAdapterDeployParamsAbi(
  adapterPostfix: string,
  version: number = 310,
): readonly AbiParameter[] | null {
  const adapterType = getAdapterType(adapterPostfix);
  if (!adapterType) return null;
  return adapterConstructorAbi[adapterType][version] ?? null;
}

export function parseAdapterDeployParams(
  adapterPostfix: string,
  version: number,
  data: Hex,
): Record<string, string> | null {
  const abi = getAdapterDeployParamsAbi(adapterPostfix, version);
  if (!abi) return null;
  const decoded = decodeAbiParameters(abi, data);
  const result: Record<string, string> = {};
  abi.forEach((param, index) => {
    if (param.name !== undefined && param.name !== "") {
      result[param.name as string] = String(decoded[index]);
    }
  });
  return result;
}

/**
 * Check if an adapter type has a deploy params ABI defined
 * @param adapterType The adapter type to check
 * @returns True if the adapter type has an ABI defined
 */
export function hasAdapterDeployParamsAbi(
  adapterType: string,
): adapterType is AdapterType {
  return adapterType in adapterConstructorAbi;
}

/**
 * Get the ABI for a specific adapter action type
 * @param adapterPostfix Adapter type
 * @param version Adapter version
 * @returns The ABI array for the adapter action or null if not found
 */
export function getAdapterActionAbi(
  adapterPostfix: string,
  version: number = 310,
): readonly AbiParameter[] | null {
  const adapterType = getAdapterType(adapterPostfix);
  if (!adapterType) return null;
  return adapterActionAbi[adapterType]?.[version] ?? null;
}

export function parseAdapterAction(data: Hex): Record<string, string> | null {
  if (data.length < 10) return null;
  const selector = data.slice(0, 10) as Hex; // first 4 bytes are the selector
  const adapterType = adapterActionSelectors[selector]?.adapterType;
  if (!adapterType) return null;
  const abi = getAdapterActionAbi(adapterType);
  if (!abi) return null;
  const decoded = decodeFunctionData({
    abi,
    data,
  });
  return {
    functionName: decoded.functionName,
    args: json_stringify(decoded.args),
  };
}
