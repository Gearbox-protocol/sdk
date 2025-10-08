import { iBalancerV2VaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import type { BalancerV2PoolStatus } from "./types.js";

const abi = iBalancerV2VaultAdapterAbi;
type abi = typeof abi;

export class BalancerV2VaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly supportedPoolIds: string[];
  public readonly poolStatuses: BalancerV2PoolStatus[];

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
        { type: "bytes32[]", name: "supportedPoolIds" },
        { type: "uint8[]", name: "poolStatuses" },
      ],
      args.baseParams.serializedParams,
    );

    this.supportedPoolIds = [...decoded[2]];
    this.poolStatuses = decoded[3].map(
      status => status as BalancerV2PoolStatus,
    );
  }
}
