import type { Address, Hex, UnionOmit } from "viem";
import { decodeAbiParameters, hexToBytes } from "viem";

import {
  bptWeightedPriceFeedAbi,
  iBalancerWeightedPoolAbi,
} from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { BalancerWeightedPriceFeedStateHuman } from "../../types/state-human.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

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
    // https://github.com/Gearbox-protocol/periphery-v3/blob/8ae4c5f8835de9961c55403fcc810516cea3e29c/contracts/serializers/oracles/BPTWeightedPriceFeedSerializer.sol#L24
    // return abi.encode(super.serialize(priceFeed), pf.vault(), pf.poolId(), weights);
    // https://github.com/Gearbox-protocol/oracles-v3/blob/fc8d3a0ab5bd7eb50ce3f6b87dde5cd3d887bafe/contracts/oracles/balancer/BPTWeightedPriceFeed.sol#L173C9-L173C70
    // return abi.encode(super.serialize(), vault, poolId, weights);
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
    return await this.sdk.client.readContract({
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
