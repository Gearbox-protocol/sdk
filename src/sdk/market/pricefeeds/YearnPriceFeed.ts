import { iyVaultAbi, yearnPriceFeedAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

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
    return await this.sdk.client.readContract({
      abi: iyVaultAbi,
      address: this.lpContract,
      functionName: "pricePerShare",
    });
  }
}
