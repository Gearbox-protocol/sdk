import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO: not yet mered into integrations-v3/main branch
const abi = [] as const;
type abi = typeof abi;

const protocolAbi = [] as const;
type protocolAbi = typeof protocolAbi;

export class SecuritizeOnRampAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #dsToken?: Address;
  #liquidityToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "dsToken" },
          { type: "address", name: "liquidityToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#dsToken = decoded[2];
      this.#liquidityToken = decoded[3];
    }
  }

  get dsToken(): Address {
    if (!this.#dsToken) throw new MissingSerializedParamsError("dsToken");
    return this.#dsToken;
  }

  get liquidityToken(): Address {
    if (!this.#liquidityToken)
      throw new MissingSerializedParamsError("liquidityToken");
    return this.#liquidityToken;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      dsToken: this.#dsToken ? this.labelAddress(this.#dsToken) : undefined,
      liquidityToken: this.#liquidityToken
        ? this.labelAddress(this.#liquidityToken)
        : undefined,
    };
  }
}
