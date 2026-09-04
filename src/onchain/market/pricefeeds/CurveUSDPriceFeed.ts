import { curveUsdPriceFeedAbi } from "../../abi/index.js";
import type { ConstructOptions } from "../../base/Construct.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof curveUsdPriceFeedAbi;

export class CurveUSDPriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(options: ConstructOptions, args: PartialPriceFeedTreeNode) {
    super(options, {
      ...args,
      name: "CurveUSDPriceFeed",
      abi: curveUsdPriceFeedAbi,
    });
  }
}
