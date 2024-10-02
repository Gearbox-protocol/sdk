import type {
  Abi,
  Address,
  ContractFunctionName,
  EncodeFunctionDataParameters,
  Hex,
} from "viem";
import {
  concatHex,
  encodeAbiParameters,
  prepareEncodeFunctionData,
} from "viem";
import { formatAbiItem } from "viem/utils";

import type { RawTx } from "../types";
import { json_stringify } from "./json";

/**
 * @dev Creates a raw transaction data to be processed by the TxBatcher
 * RawTx is a type that contains all the data needed to create different types of batches,
 * like Multisig Safe batch over governor/timelock, or multisig direct call.
 * Also RawTx data used to generate Governor execution batch, used to execute queued txs from EOA.
 * @returns
 */

export function createRawTx<
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined,
>(
  to: Address,
  parameters: EncodeFunctionDataParameters<abi, functionName>,
  description?: string,
): RawTx {
  const { args } = parameters as EncodeFunctionDataParameters;

  const fname = parameters.functionName as string;

  const { abi, functionName } = (() => {
    if (
      parameters.abi.length === 1 &&
      parameters.functionName?.startsWith("0x")
    )
      return parameters as { abi: Abi; functionName: Hex };
    return prepareEncodeFunctionData(parameters);
  })();

  const abiItem = abi[0];
  const signature = functionName;

  const data =
    "inputs" in abiItem && abiItem.inputs
      ? encodeAbiParameters(abiItem.inputs, args ?? [])
      : undefined;
  const functionEncodedData = concatHex([signature, data ?? "0x"]);

  const inputs =
    "inputs" in abiItem && abiItem.inputs ? [...abiItem.inputs] : [];

  const payable = "payble" in abiItem ? abiItem.payble === true : false;

  const contractInputsValues: Record<string, any> = {};

  if (inputs.length > 0 && args && args.length !== 0) {
    args.forEach((arg, i) => {
      const methodName = inputs[i].name as string;
      let stringifiedArg = arg instanceof BigInt ? arg.toString() : arg;
      contractInputsValues[methodName] = Array.isArray(stringifiedArg)
        ? json_stringify(stringifiedArg)
        : stringifiedArg;
    });
  }

  return {
    to,
    value: "0",
    contractMethod: {
      inputs,
      name: fname,
      payable,
    },
    signature: formatAbiItem(abiItem),
    callData: functionEncodedData,
    contractInputsValues,
    description,
  };
}
