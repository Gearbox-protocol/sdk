import { type Address, decodeAbiParameters } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

// TODO:
const abi = [] as const;
type abi = typeof abi;

export class MidasRedemptionVaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly gateway: Address;
  public readonly mToken: Address;
  public readonly allowedTokens: Address[];

  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, { ...args, abi });

    // Decode parameters directly using ABI decoding
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "creditManager" },
        { type: "address", name: "targetContract" },
        { type: "address", name: "gateway" },
        { type: "address", name: "mToken" },
        { type: "address[]", name: "allowedTokens" },
      ],
      args.baseParams.serializedParams,
    );

    this.gateway = decoded[2];
    this.mToken = decoded[3];
    this.allowedTokens = [...decoded[4]];
  }
}
