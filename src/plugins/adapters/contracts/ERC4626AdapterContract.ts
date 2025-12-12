import { ierc4626AdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters, zeroAddress } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = ierc4626AdapterAbi;
type abi = typeof abi;

export class ERC4626AdapterContract extends AbstractAdapterContract<abi> {
  public readonly vault: Address;
  public readonly asset: Address;

  constructor(
    options: ConstructOptions,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(options, { ...args, abi });

    const version = Number(args.baseParams.version);
    if (version <= 311) {
      // Decode parameters directly using ABI decoding
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "asset" },
        ],
        args.baseParams.serializedParams,
      );

      this.asset = decoded[2];
      this.vault = zeroAddress;
    } else {
      // Decode parameters directly using ABI decoding
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "vault" },
          { type: "address", name: "asset" },
        ],
        args.baseParams.serializedParams,
      );

      this.vault = decoded[2];
      this.asset = decoded[3];
    }
  }
}
