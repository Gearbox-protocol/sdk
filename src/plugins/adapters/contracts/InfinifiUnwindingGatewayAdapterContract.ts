import {
  iInfinifiUnwindingGatewayAbi,
  iInfinifiUnwindingGatewayAdapterAbi,
} from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iInfinifiUnwindingGatewayAdapterAbi;
type abi = typeof abi;

const protocolAbi = iInfinifiUnwindingGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class InfinifiUnwindingGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedLockedTokens?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          {
            type: "address[]",
            name: "allowedLockedTokens",
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedLockedTokens = [...decoded[2]];
    }
  }

  get allowedLockedTokens(): Address[] {
    if (!this.#allowedLockedTokens)
      throw new MissingSerializedParamsError("allowedLockedTokens");
    return this.#allowedLockedTokens;
  }
}
