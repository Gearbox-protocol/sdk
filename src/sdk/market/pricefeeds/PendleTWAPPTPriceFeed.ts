import type { Address } from "viem";
import { decodeAbiParameters } from "viem";

import { pendleTWAPPTPriceFeedAbi } from "../../abi/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";

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
    // https://github.com/Gearbox-protocol/periphery-v3/blob/8ae4c5f8835de9961c55403fcc810516cea3e29c/contracts/serializers/oracles/PendleTWAPPTPriceFeedSerializer.sol#L22
    // return abi.encode(pf.market(), pf.sy(), pf.yt(), pf.expiry(), pf.twapWindow(), priceToSy);
    // https://github.com/Gearbox-protocol/oracles-v3/blob/fc8d3a0ab5bd7eb50ce3f6b87dde5cd3d887bafe/contracts/oracles/pendle/PendleTWAPPTPriceFeed.sol#L79
    // abi.encode(market, sy, yt, expiry, twapWindow, priceToSy);
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
