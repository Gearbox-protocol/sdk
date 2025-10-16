import {
  type Address,
  type DecodeFunctionDataReturnType,
  hexToString,
  type PublicClient,
} from "viem";
import { withdrawalCompressorAbi } from "../../../abi/compressors/withdrawalCompressor.js";
import type { ParsedCall } from "../../core/index.js";
import { BaseContract } from "../base-contract.js";

const abi = withdrawalCompressorAbi;

export class WithdrawalCompressorContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "RoutingManager");
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCall | undefined {
    const { functionName, args } = params;

    switch (functionName) {
      case "setWithdrawableTypeToCompressorType": {
        const [withdrawableType, compressorType] = args;

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            withdrawableType: hexToString(withdrawableType as `0x${string}`, {
              size: 32,
            }),
            compressorType: hexToString(compressorType as `0x${string}`, {
              size: 32,
            }),
          },
        };
      }

      default:
        return undefined;
    }
  }
}
