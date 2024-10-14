import type { Hex } from "viem";
import { bytesToString, decodeAbiParameters, toBytes } from "viem";

import { redstonePriceFeedAbi } from "../../abi";
import type { PriceFeedTreeNode } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { RedstonePriceFeedStateHuman } from "../../types";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed";

type abi = typeof redstonePriceFeedAbi;

export class RedstonePriceFeedContract extends AbstractPriceFeedContract<abi> {
  decimals = 8;

  dataServiceId: string;
  dataId: string;
  signers: Array<string>;
  signersThreshold: number;

  constructor(sdk: GearboxSDK, args: PriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: `RedstonePriceFeed`,
      abi: redstonePriceFeedAbi,
    });
    const decoder = decodeAbiParameters(
      [
        { type: "address" }, //  [0]: pf.token(),
        { type: "bytes32" }, //  [1]: pf.dataFeedId(),
        { type: "address" }, //  [2]: pf.signerAddress0(),
        { type: "address" }, //  [3]: pf.signerAddress1(),
        { type: "address" }, //  [4]: pf.signerAddress2(),
        { type: "address" }, //  [5]: pf.signerAddress3(),
        { type: "address" }, //  [6]: pf.signerAddress4(),
        { type: "address" }, //  [7]: pf.signerAddress5()
        { type: "address" }, //  [8]: pf.signerAddress6(),
        { type: "address" }, //  [9]: pf.signerAddress7(),
        { type: "address" }, // [10]: pf.signerAddress8(),
        { type: "address" }, // [11]: pf.signerAddress9(),
        { type: "uint8" }, //   [12]: pf.getUniqueSignersThreshold()
        { type: "uint128" }, // [13]: pf.lastPrice(),
        { type: "uint40" }, //  [14]: pf.lastPayloadTimestamp()
      ],
      args.baseParams.serializedParams,
    );

    this.dataId = bytesToString(toBytes(decoder[1])).replaceAll("\x00", "");
    this.signers = decoder.slice(2, 11) as Array<Hex>;
    this.signersThreshold = Number(decoder[12]);
    this.dataServiceId = ["GMX", "BAL"].includes(this.dataId)
      ? "redstone-arbitrum-prod"
      : "redstone-primary-prod";
  }

  public override stateHuman(
    raw = true,
  ): Omit<RedstonePriceFeedStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      contractType: "PF_REDSTONE_ORACLE",
      dataId: this.dataId,
      signers: this.signers,
      signersThreshold: this.signersThreshold,
      skipCheck: true,
    };
  }
}
