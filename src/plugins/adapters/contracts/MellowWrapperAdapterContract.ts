import { iMellowWrapperAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iMellowWrapperAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowWrapperAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMellowWrapperAbi;
type protocolAbi = typeof protocolAbi;

export class MellowWrapperAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedVaults?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedVaults" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedVaults = [...decoded[2]];
    }
  }

  get allowedVaults(): Address[] {
    if (!this.#allowedVaults)
      throw new MissingSerializedParamsError("allowedVaults");
    return this.#allowedVaults;
  }
}
