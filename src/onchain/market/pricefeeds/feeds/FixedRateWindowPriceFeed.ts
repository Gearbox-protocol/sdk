import { fixedRateWindowPriceFeedAbi } from "../../../abi/index.js";
import type { ConstructOptions } from "../../../base/Construct.js";
import type { PartialPriceFeedTreeNode } from "../AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "../AbstractPriceFeed.js";

type abi = typeof fixedRateWindowPriceFeedAbi;

export class FixedRateWindowPriceFeedContract extends AbstractPriceFeedContract<abi> {
  constructor(options: ConstructOptions, args: PartialPriceFeedTreeNode) {
    super(options, {
      ...args,
      name: "FixedRateWindowPriceFeed",
      abi: fixedRateWindowPriceFeedAbi,
    });
  }
}
