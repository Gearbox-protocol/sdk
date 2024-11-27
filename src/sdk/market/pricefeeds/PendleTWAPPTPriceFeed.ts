import { pendleTWAPPTPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

const abi = pendleTWAPPTPriceFeedAbi;
type abi = typeof abi;

export class PendleTWAPPTPriceFeed extends AbstractPriceFeedContract<abi> {
  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "PendleTWAPPTPriceFeed",
      abi,
    });
  }
}
