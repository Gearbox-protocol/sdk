import {
  type Abi,
  AbiFunctionNotFoundError,
  type DecodeFunctionDataReturnType,
  type GetAbiItemParameters,
  getAbiItem,
} from "viem";
import { json_stringify } from "../../sdk/utils/index.js";

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
