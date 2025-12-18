import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO:
const abi = [] as const;
type abi = typeof abi;

export class KelpLRTWithdrawalManagerAdapterContract extends AbstractAdapterContract<abi> {
  public readonly allowedTokensOut: {
    tokenOut: Address;
    phantomToken: Address;
  }[];

  constructor(
    options: ConstructOptions,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(options, { ...args, abi });

    // Decode parameters directly using ABI decoding
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        { type: "address[]", name: "allowedTokensOut" },
        { type: "address[]", name: "phantomTokensForAllowedTokensOut" },
      ],
      args.baseParams.serializedParams,
    );

    this.allowedTokensOut = decoded[2].map((tokenOut, index) => ({
      tokenOut,
      phantomToken: decoded[3][index],
    }));
  }
}
