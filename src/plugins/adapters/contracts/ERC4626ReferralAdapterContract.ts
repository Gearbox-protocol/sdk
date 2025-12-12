import { erc4626ReferralAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = erc4626ReferralAdapterAbi;
type abi = typeof abi;

export class ERC4626ReferralAdapterContract extends AbstractAdapterContract<abi> {
  public readonly asset: Address;
  public readonly referral: number;

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
        { type: "address", name: "asset" },
        { type: "uint16", name: "referral" },
      ],
      args.baseParams.serializedParams,
    );

    this.asset = decoded[2];
    this.referral = decoded[3];
  }
}
