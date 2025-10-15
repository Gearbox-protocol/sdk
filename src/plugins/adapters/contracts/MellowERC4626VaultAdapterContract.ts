import { iMellow4626VaultAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters, zeroAddress } from "viem";
import type { GearboxSDK } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iMellow4626VaultAdapterAbi;
type abi = typeof abi;

export class MellowERC4626VaultAdapterContract extends AbstractAdapterContract<abi> {
  public readonly vault: Address;
  public readonly asset: Address;
  public readonly stakedPhantomToken: Address;

  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, { ...args, abi });

    this.asset = zeroAddress;
    this.vault = zeroAddress;
    this.stakedPhantomToken = zeroAddress;

    const version = Number(args.baseParams.version);
    if (version === 310) {
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
    } else if (version === 311) {
      // Decode parameters directly using ABI decoding
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "asset" },
          { type: "address", name: "stakedPhantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.asset = decoded[2];
      this.stakedPhantomToken = decoded[3];
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
