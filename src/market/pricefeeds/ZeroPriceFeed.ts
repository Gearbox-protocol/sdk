import { zeroPriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AssetPriceFeedState } from "../../state";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof zeroPriceFeedAbi;

export class ZeroPriceFeedContract extends AbstractPriceFeedContract<abi> {
  readonly priceFeedType = "PF_ZERO_ORACLE";

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "ZeroPriceFeed",
      abi: zeroPriceFeedAbi,
      decimals: 8,
    });
  }

  public get state(): AssetPriceFeedState {
    return {
      ...this.contractData,
      contractType: this.priceFeedType,
      skipCheck: true,
      stalenessPeriod: 0,
      pricefeeds: [],
    };
  }
}
