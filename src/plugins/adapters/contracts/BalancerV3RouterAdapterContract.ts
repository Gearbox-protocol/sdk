import { iBalancerV3RouterAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iBalancerV3RouterAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";
import type { BalancerV3PoolStatus } from "./types.js";

const abi = iBalancerV3RouterAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBalancerV3RouterAbi;
type protocolAbi = typeof protocolAbi;

export class BalancerV3RouterAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedPools?:
    | Address[]
    | {
        pool: Address;
        status: BalancerV3PoolStatus;
      }[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
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
        this.#allowedPools = [...decoded[2]];
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
        this.#allowedPools = [...decoded[2]];
      }
    }
  }

  get allowedPools():
    | Address[]
    | {
        pool: Address;
        status: BalancerV3PoolStatus;
      }[] {
    if (!this.#allowedPools)
      throw new MissingSerializedParamsError("allowedPools");
    return this.#allowedPools;
  }
}
