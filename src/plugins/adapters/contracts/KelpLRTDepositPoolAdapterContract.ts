import {
  iKelpLrtDepositPoolAdapterAbi,
  iKelpLrtDepositPoolGatewayAbi,
} from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iKelpLrtDepositPoolAdapterAbi;
type abi = typeof abi;

const protocolAbi = iKelpLrtDepositPoolGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class KelpLRTDepositPoolAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedAssets?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedAssets" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedAssets = [...decoded[2]];
    }
  }

  get allowedAssets(): Address[] {
    if (!this.#allowedAssets)
      throw new MissingSerializedParamsError("allowedAssets");
    return this.#allowedAssets;
  }
}
