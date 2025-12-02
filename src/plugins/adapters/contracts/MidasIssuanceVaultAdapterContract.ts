import { iMidasIssuanceVaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMidasIssuanceVaultAdapterAbi;
type abi = typeof abi;

export class MidasIssuanceVaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly mToken: Address;
  public readonly referrerId: string;
  public readonly allowedTokens: Address[];

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
        { type: "address", name: "mToken" },
        { type: "bytes32", name: "referrerId" },
        { type: "address[]", name: "allowedTokens" },
      ],
      args.baseParams.serializedParams,
    );

    this.mToken = decoded[2];
    this.referrerId = decoded[3];
    this.allowedTokens = [...decoded[4]];
  }
}
