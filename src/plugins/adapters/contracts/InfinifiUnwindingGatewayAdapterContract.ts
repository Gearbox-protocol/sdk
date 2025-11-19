import { iInfinifiUnwindingGatewayAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iInfinifiUnwindingGatewayAdapterAbi;
type abi = typeof abi;

export class InfinifiUnwindingGatewayAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedLockedTokens: Address[];

  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, { ...args, abi });

    // Decode parameters directly using ABI decoding
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        {
          type: "address[]",
          name: "allowedLockedTokens",
        },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedLockedTokens = [...decoded[2]];
  }
}
