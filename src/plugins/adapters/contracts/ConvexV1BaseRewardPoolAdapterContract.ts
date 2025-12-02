import { iConvexV1BaseRewardPoolAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iConvexV1BaseRewardPoolAdapterAbi;
type abi = typeof abi;

export class ConvexV1BaseRewardPoolAdapterContract extends AbstractAdapterContract<abi> {
  public readonly curveLPtoken: Address;
  public readonly stakingToken: Address;
  public readonly stakedPhantomToken: Address;
  public readonly extraRewards: [Address, Address, Address, Address];

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
        { type: "address", name: "curveLPtoken" },
        { type: "address", name: "stakingToken" },
        { type: "address", name: "stakedPhantomToken" },
        { type: "address[4]", name: "extraRewards" },
      ],
      args.baseParams.serializedParams,
    );

    this.curveLPtoken = decoded[2];
    this.stakingToken = decoded[3];
    this.stakedPhantomToken = decoded[4];
    this.extraRewards = [
      decoded[5][0],
      decoded[5][1],
      decoded[5][2],
      decoded[5][3],
    ];
  }
}
