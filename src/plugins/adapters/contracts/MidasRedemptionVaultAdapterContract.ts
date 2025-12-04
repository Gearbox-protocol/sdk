import { iMidasRedemptionVaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasRedemptionVaultAdapterAbi;
type abi = typeof abi;

export class MidasRedemptionVaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly gateway: Address;
  public readonly mToken: Address;
  public readonly allowedTokens: { token: Address; phantomToken: Address }[];

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
        { type: "address", name: "gateway" },
        { type: "address", name: "mToken" },
        { type: "address[]", name: "allowedTokens" },
        { type: "address[]", name: "allowedPhantomTokens" },
      ],
      args.baseParams.serializedParams,
    );

    this.gateway = decoded[2];
    this.mToken = decoded[3];
    this.allowedTokens = decoded[4].map((token, index) => ({
      token,
      phantomToken: decoded[5][index],
    }));
  }
}
