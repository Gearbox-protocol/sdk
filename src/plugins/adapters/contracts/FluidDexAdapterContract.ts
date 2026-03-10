import { iFluidDexAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iFluidDexAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iFluidDexAdapterAbi;
type abi = typeof abi;

const protocolAbi = iFluidDexAbi;
type protocolAbi = typeof protocolAbi;

export class FluidDexAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #token0?: Address;
  #token1?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "token0" },
          { type: "address", name: "token1" },
        ],
        args.baseParams.serializedParams,
      );

      this.#token0 = decoded[2];
      this.#token1 = decoded[3];
    }
  }

  get token0(): Address {
    if (!this.#token0) throw new MissingSerializedParamsError("token0");
    return this.#token0;
  }

  get token1(): Address {
    if (!this.#token1) throw new MissingSerializedParamsError("token1");
    return this.#token1;
  }
}
