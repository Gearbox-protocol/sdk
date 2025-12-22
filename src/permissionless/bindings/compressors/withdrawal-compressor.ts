import {
  type Address,
  type Chain,
  type DecodeFunctionDataReturnType,
  hexToString,
  type PublicClient,
  type Transport,
} from "viem";
import { withdrawalCompressorAbi } from "../../../abi/compressors/withdrawalCompressor.js";
import { BaseContract, type ParsedCallArgs } from "../../../sdk/index.js";

const abi = withdrawalCompressorAbi;

export class WithdrawalCompressorContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "WithdrawalCompressor" });
  }

  protected override parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCallArgs {
    const { functionName, args } = params;

    switch (functionName) {
      case "setWithdrawableTypeToCompressorType": {
        const [withdrawableType, compressorType] = args;

        return {
          withdrawableType: hexToString(withdrawableType, { size: 32 }),
          compressorType: hexToString(compressorType, { size: 32 }),
        };
      }

      default:
        return super.parseFunctionParams(params);
    }
  }
}
