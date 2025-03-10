import type { Address, Hex, UnionOmit } from "viem";
import { decodeAbiParameters, hexToBytes } from "viem";

import { bptWeightedPriceFeedAbi, iBalancerWeightedPoolAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { BalancerWeightedPriceFeedStateHuman } from "../../types/state-human";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

type abi = typeof bptWeightedPriceFeedAbi;

export class BalancerWeightedPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  public readonly vault: Address;
  public readonly poolId: Hex;
  public readonly weights: readonly [
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
    bigint,
  ];

  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    const decoded = decodeAbiParameters(
      [
        { type: "bytes", name: "superParams" },
        { type: "address", name: "vault" },
        { type: "bytes32", name: "poolId" },
        { type: "uint256[8]", name: "weights" },
      ],
      hexToBytes(args.baseParams.serializedParams),
    );

    super(sdk, {
      ...args,
      baseParams: {
        ...args.baseParams,
        serializedParams: decoded[0],
      },
      name: "BalancerWeighedPriceFeed",
      abi: bptWeightedPriceFeedAbi,
    });
    this.vault = decoded[1];
    this.poolId = decoded[2];
    this.weights = decoded[3];
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iBalancerWeightedPoolAbi,
      address: this.lpContract,
      functionName: "getRate",
    });
  }

  public override stateHuman(
    raw?: boolean,
  ): UnionOmit<BalancerWeightedPriceFeedStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      contractType: "PRICE_FEED::BALANCER_WEIGHTED",
      vault: this.vault,
      poolId: this.poolId,
      weights: [...this.weights],
    };
  }
}
