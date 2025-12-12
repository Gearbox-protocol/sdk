import {
  type Abi,
  type ContractFunctionName,
  decodeFunctionData,
  type EncodeFunctionDataParameters,
  type Hex,
} from "viem";
import { functionArgsToMap } from "../../../sdk/index.js";
import { createCallData } from "../../core/raw-tx.js";

export class AbstractFactory<const abi extends Abi | readonly unknown[]> {
  public readonly abi: abi;

  constructor(abi: abi) {
    this.abi = abi;
  }

  createCallData<
    functionName extends ContractFunctionName<abi> | undefined = undefined,
  >(
    parameters: Omit<EncodeFunctionDataParameters<abi, functionName>, "abi"> & {
      description?: string;
    },
  ): Hex {
    const callData = createCallData<abi, functionName>(this.abi, parameters);

    return callData;
  }

  /**
   * Decodes configuration calldata using the ABI
   * @param calldata - The encoded function call data
   * @returns Decoded function name and arguments, or null if decoding fails
   */
  decodeConfig(
    calldata: Hex,
  ): { functionName: string; args: Record<string, string> } | null {
    const decoded = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });
    return {
      functionName: decoded.functionName,
      args: functionArgsToMap(this.abi, decoded.functionName, decoded.args),
    };
  }
}
