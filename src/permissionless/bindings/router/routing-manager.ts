import {
  type Address,
  type Chain,
  type DecodeFunctionDataReturnType,
  hexToString,
  type PublicClient,
  type Transport,
} from "viem";
import { routingManagerAbi } from "../../../abi/router/routingManager.js";
import { BaseContract, type ParsedCallArgs } from "../../../sdk/index.js";

const abi = routingManagerAbi;

export class RoutingManagerContract extends BaseContract<typeof abi> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "RoutingManager" });
  }

  protected override parseFunctionParams(
    params: DecodeFunctionDataReturnType<typeof abi>,
  ): ParsedCallArgs {
    const { functionName, args } = params;

    switch (functionName) {
      case "setAdapterToWorkerType": {
        const [adapterType, workerType] = args;

        return {
          adapterType: hexToString(adapterType, { size: 32 }),
          workerType: hexToString(workerType, { size: 32 }),
        };
      }

      default:
        return super.parseFunctionParams(params);
    }
  }
}
