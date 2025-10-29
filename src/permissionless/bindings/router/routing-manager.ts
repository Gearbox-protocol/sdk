import {
  type Address,
  type DecodeFunctionDataReturnType,
  hexToString,
  type PublicClient,
} from "viem";
import { routingManagerAbi } from "../../../abi/router/routingManager.js";
import type { ParsedCall } from "../../core/index.js";
import { BaseContract } from "../base-contract.js";

const abi = routingManagerAbi;

export class RoutingManagerContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "RoutingManager");
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
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
