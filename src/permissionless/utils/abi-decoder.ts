import {
  type Abi,
  type AbiFunction,
  type DecodeFunctionDataReturnType,
  decodeFunctionData,
  type Hex,
} from "viem";
import { json_stringify } from "../../sdk/utils/index.js";

export interface DecodedFunctionCall<T extends Abi | readonly unknown[] = Abi> {
  functionName: string;
  args: Record<string, string>;
  originalDecoded: DecodeFunctionDataReturnType<T>;
}

/**
 * Decodes function calldata and maps arguments to their parameter names from the ABI
 * @param abi - The contract ABI
 * @param calldata - The encoded function call data
 * @returns Decoded function with named arguments and original decoded data, or null if decoding fails
 */
export function decodeFunctionWithNamedArgs<T extends Abi | readonly unknown[]>(
  abi: T,
  calldata: Hex,
): DecodedFunctionCall<T> | null {
  try {
    const decoded = decodeFunctionData({
      abi,
      data: calldata,
    });

    const abiItem = (abi as Array<AbiFunction>).find(
      item => item?.name === decoded.functionName && item?.type === "function",
    );

    if (!abiItem) {
      return {
        functionName: decoded.functionName,
        args: {},
        originalDecoded: decoded,
      };
    }

    const namedArgs: Record<string, string> = {};

    if (Array.isArray(decoded.args)) {
      decoded.args.forEach((value, i) => {
        const input = abiItem.inputs?.[i];
        if (input?.name) {
          namedArgs[input.name] = input.type.startsWith("tuple")
            ? json_stringify(value)
            : String(value);
        }
      });
    } else {
      // Handle object-like args (fallback)
      Object.entries(decoded.args || {}).forEach(([key, value]) => {
        // Try to find the actual parameter name if key is numeric
        const index = parseInt(key);
        if (!isNaN(index) && abiItem.inputs?.[index]?.name) {
          namedArgs[abiItem.inputs[index].name] = String(value);
        } else {
          namedArgs[key] = String(value);
        }
      });
    }

    return {
      functionName: decoded.functionName,
      args: namedArgs,
      originalDecoded: decoded,
    };
  } catch {
    return null;
  }
}
