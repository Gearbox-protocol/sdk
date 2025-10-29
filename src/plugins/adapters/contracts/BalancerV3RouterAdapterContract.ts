import { iBalancerV3RouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import type { BalancerV3PoolStatus } from "./types.js";

const abi = iBalancerV3RouterAdapterAbi;
type abi = typeof abi;

export class BalancerV3RouterAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedPools:
    | Address[]
    | {
        pool: Address;
        status: BalancerV3PoolStatus;
      }[];

  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, { ...args, abi });

    const version = Number(args.baseParams.version);
    if (version === 310) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedPools" },
        ],
        args.baseParams.serializedParams,
      );
      this.allowedPools = [...decoded[2]];
    } else {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          {
            type: "tuple[]",
            name: "allowedPairs",
            components: [
              { type: "address", name: "pool" },
              { type: "uint8", name: "status" },
            ],
          },
        ],
        args.baseParams.serializedParams,
      );
      this.allowedPools = [...decoded[2]];
    }
  }
}
