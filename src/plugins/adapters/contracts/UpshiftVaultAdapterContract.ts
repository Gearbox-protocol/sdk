import {
  iUpshiftVaultAdapterAbi,
  iUpshiftVaultGatewayAbi,
} from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iUpshiftVaultAdapterAbi;
type abi = typeof abi;

const protocolAbi = iUpshiftVaultGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class UpshiftVaultAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #vault?: Address;
  #asset?: Address;
  #stakedPhantomToken?: Address;

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "vault" },
          { type: "address", name: "asset" },
          { type: "address", name: "stakedPhantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.#vault = decoded[2];
      this.#asset = decoded[3];
      this.#stakedPhantomToken = decoded[4];
    }
  }

  get vault(): Address {
    if (!this.#vault) throw new MissingSerializedParamsError("vault");
    return this.#vault;
  }

  get asset(): Address {
    if (!this.#asset) throw new MissingSerializedParamsError("asset");
    return this.#asset;
  }

  get stakedPhantomToken(): Address {
    if (!this.#stakedPhantomToken)
      throw new MissingSerializedParamsError("stakedPhantomToken");
    return this.#stakedPhantomToken;
  }
}
