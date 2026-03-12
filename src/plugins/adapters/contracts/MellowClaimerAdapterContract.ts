import { iMellowClaimerAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iMellowClaimerAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellowClaimerAdapterAbi;
type abi = typeof abi;

const protocolAbi = iMellowClaimerAbi;
type protocolAbi = typeof protocolAbi;

export class MellowClaimerAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedMultiVaults?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedMultiVaults" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedMultiVaults = [...decoded[2]];
    }
  }

  get allowedMultiVaults(): Address[] {
    if (!this.#allowedMultiVaults)
      throw new MissingSerializedParamsError("allowedMultiVaults");
    return this.#allowedMultiVaults;
  }
}
