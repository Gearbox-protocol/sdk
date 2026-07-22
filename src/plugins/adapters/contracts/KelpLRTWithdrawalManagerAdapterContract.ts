import { type Address, decodeAbiParameters } from "viem";
import {
  MissingSerializedParamsError,
  type OnchainSDK,
} from "../../../sdk/index.js";
import {
  iKelpLrtWithdrawalManagerAdapterAbi,
  iKelpLrtWithdrawalManagerGatewayAbi,
} from "../abi/adapters/index.js";
import type { ConcreteAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iKelpLrtWithdrawalManagerAdapterAbi;
type abi = typeof abi;

const protocolAbi = iKelpLrtWithdrawalManagerGatewayAbi;
type protocolAbi = typeof protocolAbi;

export class KelpLRTWithdrawalManagerAdapterContract extends AbstractAdapterContract<
  abi,
  protocolAbi
> {
  #allowedTokensOut?: {
    tokenOut: Address;
    phantomToken: Address;
  }[];

  constructor(sdk: OnchainSDK, args: ConcreteAdapterContractOptions) {
    super(sdk, { ...args, abi, protocolAbi });

    if (args.baseParams.serializedParams) {
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address[]", name: "allowedTokensOut" },
          { type: "address[]", name: "phantomTokensForAllowedTokensOut" },
        ],
        args.baseParams.serializedParams,
      );

      this.#allowedTokensOut = decoded[2].map((tokenOut, index) => ({
        tokenOut,
        phantomToken: decoded[3][index],
      }));
    }
  }

  get allowedTokensOut(): {
    tokenOut: Address;
    phantomToken: Address;
  }[] {
    if (!this.#allowedTokensOut)
      throw new MissingSerializedParamsError("allowedTokensOut");
    return this.#allowedTokensOut;
  }

  public override stateHuman(raw?: boolean) {
    return {
      ...super.stateHuman(raw),
      allowedTokensOut: this.#allowedTokensOut?.map(t => ({
        tokenOut: this.labelAddress(t.tokenOut),
        phantomToken: this.labelAddress(t.phantomToken),
      })),
    };
  }
}
