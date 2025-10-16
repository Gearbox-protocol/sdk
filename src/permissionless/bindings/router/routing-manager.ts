import {
  Address,
  DecodeFunctionDataReturnType,
  hexToString,
  PublicClient,
} from "viem";
import { routingManagerAbi } from "../../abi";
import { ParsedCall } from "../../core";
import { BaseContract } from "../base-contract";

const abi = routingManagerAbi;

export class RoutingManagerContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "RoutingManager");
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>
  ): ParsedCall | undefined {
    const { functionName, args } = params;

    switch (functionName) {
      case "setAdapterToWorkerType": {
        const [adapterType, workerType] = args;

        return {
          chainId: 0,
          target: this.address,
          label: this.name,
          functionName,
          args: {
            adapterType: hexToString(adapterType as `0x${string}`, {
              size: 32,
            }),
            workerType: hexToString(workerType as `0x${string}`, { size: 32 }),
          },
        };
      }

      default:
        return undefined;
    }
  }
}
