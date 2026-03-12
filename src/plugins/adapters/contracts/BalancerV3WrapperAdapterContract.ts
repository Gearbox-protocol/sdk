import { iBalancerV3WrapperAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import { MissingSerializedParamsError } from "../../../sdk/index.js";
import { iBalancerV3WrapperAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iBalancerV3WrapperAdapterAbi;
type abi = typeof abi;

const protocolAbi = iBalancerV3WrapperAbi;
type protocolAbi = typeof protocolAbi;

export class BalancerV3WrapperAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #balancerPoolToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "balancerPoolToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#balancerPoolToken = decoded[2];
    }
  }

  get balancerPoolToken(): Address {
    if (!this.#balancerPoolToken)
      throw new MissingSerializedParamsError("balancerPoolToken");
    return this.#balancerPoolToken;
  }
}
