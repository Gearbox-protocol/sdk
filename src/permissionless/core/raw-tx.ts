import {
  Abi,
  ContractFunctionName,
  Hex,
  EncodeFunctionDataParameters,
} from "viem";
import { createRawTx } from "../../sdk/utils/index.js";

export function createCallData<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi> | undefined = undefined
>(
  _abi: abi,
  parameters: Omit<EncodeFunctionDataParameters<abi, functionName>, "abi"> & {
    description?: string;
  }
): Hex {
  const tx = createRawTx<abi, functionName>(
    "0x0000000000000000000000000000000000000000",
    {
      abi: _abi,
      ...parameters,
    } as unknown as EncodeFunctionDataParameters<abi, functionName>
  );

  return tx.callData;
}
