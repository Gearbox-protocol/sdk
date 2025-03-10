import type { Address } from "viem";
import { decodeAbiParameters } from "viem";

import { pendleTWAPPTPriceFeedAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

const abi = pendleTWAPPTPriceFeedAbi;
type abi = typeof abi;

export class PendleTWAPPTPriceFeed extends AbstractPriceFeedContract<abi> {
  public readonly market: Address;
  public readonly sy: Address;
  public readonly yt: Address;
  public readonly expiry: bigint;
  public readonly twapWindow: number;
  public readonly priceToSy: boolean;

  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: "PendleTWAPPTPriceFeed",
      abi,
    });
    const decoded = decodeAbiParameters(
      [
        { type: "address", name: "market" },
        { type: "address", name: "sy" },
        { type: "address", name: "yt" },
        { type: "uint256", name: "expiry" },
        { type: "uint32", name: "twapWindow" },
        { type: "bool", name: "priceToSy" },
      ],
      args.baseParams.serializedParams,
    );
    this.market = decoded[0];
    this.sy = decoded[1];
    this.yt = decoded[2];
    this.expiry = decoded[3];
    this.twapWindow = decoded[4];
    this.priceToSy = decoded[5];
  }
}
