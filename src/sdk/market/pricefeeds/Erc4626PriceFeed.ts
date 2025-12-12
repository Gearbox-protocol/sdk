import { erc4626PriceFeedAbi } from "../../abi/index.js";
import type { ConstructOptions } from "../../base/Construct.js";
import { AbstractLPPriceFeedContract } from "./AbstractLPPriceFeed.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";

type abi = typeof erc4626PriceFeedAbi;

export class Erc4626PriceFeedContract extends AbstractLPPriceFeedContract<abi> {
  constructor(options: ConstructOptions, args: PartialPriceFeedTreeNode) {
    super(options, {
      ...args,
      name: "ERC4626PriceFeed",
      abi: erc4626PriceFeedAbi,
    });
  }
}
