import { iMellowVaultAbi, mellowLrtPriceFeedAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof mellowLrtPriceFeedAbi;

export class MellowLRTPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "MellowLRTPriceFeed",
      abi: mellowLrtPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    const stack = await this.sdk.client.readContract({
      abi: iMellowVaultAbi,
      address: this.lpContract,
      functionName: "calculateStack",
    });

    return (stack.totalValue * BigInt(1e18)) / stack.totalSupply;
  }
}
