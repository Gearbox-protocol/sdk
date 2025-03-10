import { iwstEthAbi, wstEthPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

type abi = typeof wstEthPriceFeedAbi;

export class WstETHPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "WstETHPriceFeed",
      abi: wstEthPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iwstEthAbi,
      address: this.lpContract,
      functionName: "stEthPerToken",
    });
  }
}
