import { type Address, decodeAbiParameters } from "viem";
import {
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import {
  iInfinifiUnwindingGatewayAbi,
  iInfinifiUnwindingGatewayAdapterAbi,
} from "../abi/adapters/index.js";
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

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

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

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedLockedTokens: this.#allowedLockedTokens?.map(t =>
        this.labelAddress(t),
      ),
    };
  }
}
