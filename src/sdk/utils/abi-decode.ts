import {
  type Abi,
  AbiFunctionNotFoundError,
  type DecodeFunctionDataReturnType,
  type GetAbiItemParameters,
  getAbiItem,
  type Hex,
  toFunctionSelector,
  toFunctionSignature,
} from "viem";
import { json_stringify } from "../../sdk/utils/index.js";

/**
 * Given an ABI and calldata (or 4-byte selector), returns the function
 * signature (e.g. `"balanceOf(address)"`) by matching against selectors
 * computed from the ABI's function items.
 *
 * @throws if no matching function is found in the ABI
 */
export function getFunctionSignature(
  abi: Abi | readonly unknown[],
  calldataOrSelector: Hex,
): string {
  const selector = calldataOrSelector.slice(0, 10) as Hex;
  for (const item of abi as Abi) {
    if (item.type === "function" && toFunctionSelector(item) === selector) {
      return toFunctionSignature(item);
    }
  }
  throw new Error(`Function with selector ${selector} not found in ABI`);
}

/**
 * Converts decoded function args (as decoded by viem, i.e. as array) to named map of args
 * Can return undefined if function is not found in ABI
 * @param abi
 * @param functionName
 * @param args
 * @returns
 */
export function functionArgsToMap<T extends Abi | readonly unknown[]>(
  abi: T,
  functionName: string,
  args: DecodeFunctionDataReturnType<T>["args"],
): Record<string, string> {
  const abiItem = getAbiItem({
    abi,
    name: functionName,
    args,
  } as GetAbiItemParameters);

  if (!abiItem || abiItem.type !== "function") {
    throw new AbiFunctionNotFoundError(functionName);
  }

  const namedArgs: Record<string, string> = {};

  if (Array.isArray(args)) {
    args.forEach((value, i) => {
      const input = abiItem.inputs?.[i];
      if (input?.name) {
        namedArgs[input.name] = input.type.startsWith("tuple")
          ? json_stringify(value)
          : String(value);
      }
    });
  } else {
    // Handle object-like args (fallback)
    Object.entries(args || {}).forEach(([key, value]) => {
      // Try to find the actual parameter name if key is numeric
      const index = parseInt(key, 10);
      if (!Number.isNaN(index) && abiItem.inputs?.[index]?.name) {
        namedArgs[abiItem.inputs[index].name] = String(value);
      } else {
        namedArgs[key] = String(value);
      }
    });
  }

  return namedArgs;
}

/**
 * Converts decoded function args to a named record preserving original types.
 * Unlike {@link functionArgsToMap}, values are not stringified.
 */
export function functionArgsToRecord<T extends Abi | readonly unknown[]>(
  abi: T,
  functionName: string,
  args: DecodeFunctionDataReturnType<T>["args"],
): Record<string, unknown> {
  const abiItem = getAbiItem({
    abi,
    name: functionName,
    args,
  } as GetAbiItemParameters);

  if (!abiItem || abiItem.type !== "function") {
    throw new AbiFunctionNotFoundError(functionName);
  }

  const namedArgs: Record<string, unknown> = {};

  if (Array.isArray(args)) {
    args.forEach((value: unknown, i: number) => {
      const input = abiItem.inputs?.[i];
      const key = input?.name || `${i}`;
      namedArgs[key] = value;
    });
  } else {
    Object.entries(args || {}).forEach(([key, value]) => {
      const index = parseInt(key, 10);
      if (!Number.isNaN(index) && abiItem.inputs?.[index]?.name) {
        namedArgs[abiItem.inputs[index].name] = value;
      } else {
        namedArgs[key] = value;
      }
    });
  }

  return namedArgs;
}
