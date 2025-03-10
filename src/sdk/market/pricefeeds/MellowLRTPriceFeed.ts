import { iMellowVaultAbi, mellowLrtPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

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
    const stack = await this.sdk.provider.publicClient.readContract({
      abi: iMellowVaultAbi,
      address: this.lpContract,
      functionName: "calculateStack",
    });

    return (stack.totalValue * BigInt(1e18)) / stack.totalSupply;
  }
}
