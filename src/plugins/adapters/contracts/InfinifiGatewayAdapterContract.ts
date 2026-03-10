import { iInfinifiGatewayAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import {
  type ConstructOptions,
  MissingSerializedParamsError,
} from "../../../sdk/index.js";
import { iInfinifiGatewayAbi } from "../abi/targetContractAbi.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iInfinifiGatewayAdapterAbi;
type abi = typeof abi;

const protocolAbi = iInfinifiGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class InfinifiGatewayAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #usdc?: Address;
  #iusd?: Address;
  #siusd?: Address;
  #allowedLockedTokens?: Address[];

  constructor(options: ConstructOptions, args: ConcreteAdapterContractOptions) {
    super(options, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "usdc" },
          { type: "address", name: "iusd" },
          { type: "address", name: "siusd" },
          {
            type: "address[]",
            name: "allowedLockedTokens",
          },
        ],
        args.baseParams.serializedParams,
      );

      this.#usdc = decoded[2];
      this.#iusd = decoded[3];
      this.#siusd = decoded[4];
      this.#allowedLockedTokens = [...decoded[5]];
    }
  }

  get usdc(): Address {
    if (!this.#usdc) throw new MissingSerializedParamsError("usdc");
    return this.#usdc;
  }

  get iusd(): Address {
    if (!this.#iusd) throw new MissingSerializedParamsError("iusd");
    return this.#iusd;
  }

  get siusd(): Address {
    if (!this.#siusd) throw new MissingSerializedParamsError("siusd");
    return this.#siusd;
  }

  get allowedLockedTokens(): Address[] {
    if (!this.#allowedLockedTokens)
      throw new MissingSerializedParamsError("allowedLockedTokens");
    return this.#allowedLockedTokens;
  }
}
