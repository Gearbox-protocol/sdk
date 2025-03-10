import { iyVaultAbi, yearnPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";

type abi = typeof yearnPriceFeedAbi;

export class YearnPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "YearnPriceFeed",
      abi: yearnPriceFeedAbi,
    });
  }

  public override async getValue(): Promise<bigint> {
    return await this.sdk.provider.publicClient.readContract({
      abi: iyVaultAbi,
      address: this.lpContract,
      functionName: "pricePerShare",
    });
  }
}
