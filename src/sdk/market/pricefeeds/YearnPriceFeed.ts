import { yearnPriceFeedAbi } from "../../abi/index.js";
import type { ConstructOptions } from "../../base/Construct.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof yearnPriceFeedAbi;

export class YearnPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(options: ConstructOptions, args: PartialPriceFeedTreeNode) {
    super(options, {
      ...args,
      name: "YearnPriceFeed",
      abi: yearnPriceFeedAbi,
    });
  }
}
