import { zeroPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof zeroPriceFeedAbi;

export class ZeroPriceFeedContract extends AbstractPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "ZeroPriceFeed",
      abi: zeroPriceFeedAbi,
      decimals: 8,
    });
  }
}
