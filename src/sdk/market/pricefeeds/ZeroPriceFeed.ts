import { zeroPriceFeedAbi } from "../../abi/index.js";
import type { ConstructOptions } from "../../base/Construct.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";

type abi = typeof zeroPriceFeedAbi;

export class ZeroPriceFeedContract extends AbstractPriceFeedContract<abi> {
  constructor(options: ConstructOptions, args: PartialPriceFeedTreeNode) {
    super(options, {
      ...args,
      name: "ZeroPriceFeed",
      abi: zeroPriceFeedAbi,
      decimals: 8,
    });
  }
}
