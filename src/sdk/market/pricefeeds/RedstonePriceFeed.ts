import type { Address, Hex } from "viem";
import { bytesToString, decodeAbiParameters, toBytes } from "viem";

import { redstonePriceFeedAbi } from "../../abi/index.js";
import { ADDRESS_0X0, isV310 } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { RawTx, RedstonePriceFeedStateHuman } from "../../types/index.js";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed.js";
import { AbstractPriceFeedContract } from "./AbstractPriceFeed.js";
import type { IUpdatablePriceFeedContract } from "./types.js";

type abi = typeof redstonePriceFeedAbi;

export class RedstonePriceFeedContract
  extends AbstractPriceFeedContract<abi>
  implements IUpdatablePriceFeedContract
{
  public readonly token: Address;
  public readonly dataServiceId: string;
  public readonly dataId: string;
  public readonly signers: Hex[];
  public readonly signersThreshold: number;
  public readonly lastPrice: bigint;
  public readonly lastPayloadTimestamp: number;

  constructor(sdk: GearboxSDK, args: PartialPriceFeedTreeNode) {
    super(sdk, {
      ...args,
      name: `RedstonePriceFeed`,
      abi: redstonePriceFeedAbi,
    });

    if (isV310(args.baseParams.version)) {
      // https://github.com/Gearbox-protocol/oracles-v3/blob/fc8d3a0ab5bd7eb50ce3f6b87dde5cd3d887bafe/contracts/oracles/updatable/RedstonePriceFeed.sol#L161
      // abi.encode(token, dataFeedId, dataServiceId, signers, _signersThreshold, lastPrice, lastPayloadTimestamp);
      const decoder = decodeAbiParameters(
        [
          { type: "address", name: "token" },
          { type: "bytes32", name: "dataFeedId" },
          { type: "string", name: "dataServiceId" },
          { type: "address[10]", name: "signers" },
          { type: "uint8", name: "signersThreshold" },
          { type: "uint128", name: "lastPrice" },
          { type: "uint40", name: "lastPayloadTimestamp" },
        ],
        args.baseParams.serializedParams,
      );

      this.token = decoder[0];
      this.dataId = bytesToString(toBytes(decoder[1])).replaceAll("\x00", "");
      this.dataServiceId = decoder[2];
      this.signers = [...decoder[3]];
      this.signersThreshold = Number(decoder[4]);
      this.lastPrice = decoder[5];
      this.lastPayloadTimestamp = Number(decoder[6]);
    } else {
      // https://github.com/Gearbox-protocol/periphery-v3/blob/8ae4c5f8835de9961c55403fcc810516cea3e29c/contracts/serializers/oracles/RedstonePriceFeedSerializer.sol#L26
      //   return abi.encode(
      //     pf.token(),
      //     pf.dataFeedId(),
      //     signers,
      //     pf.getUniqueSignersThreshold(),
      //     pf.lastPrice(),
      //     pf.lastPayloadTimestamp()
      // );
      const decoder = decodeAbiParameters(
        [
          { type: "address" }, // pf.token(),
          { type: "bytes32" }, // pf.dataFeedId(),
          { type: "address[10]" }, // signers,
          { type: "uint8" }, // pf.getUniqueSignersThreshold(),
          { type: "uint128" }, //  pf.lastPrice(),
          { type: "uint40" }, // pf.lastPayloadTimestamp()
        ],
        args.baseParams.serializedParams,
      );

      this.token = decoder[0];
      this.dataId = bytesToString(toBytes(decoder[1])).replaceAll("\x00", "");
      this.signers = [...decoder[2]];
      this.signersThreshold = Number(decoder[3]);
      this.dataServiceId = ["GMX", "BAL"].includes(this.dataId)
        ? "redstone-arbitrum-prod"
        : "redstone-primary-prod";
      this.lastPrice = decoder[4];
      this.lastPayloadTimestamp = Number(decoder[5]);
    }
  }

  public override stateHuman(
    raw = true,
  ): Omit<RedstonePriceFeedStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      contractType: "PRICE_FEED::REDSTONE",
      dataId: this.dataId,
      signers: this.signers.filter(s => s !== ADDRESS_0X0),
      signersThreshold: this.signersThreshold,
      skipCheck: true,
      lastPrice: this.lastPrice.toString(),
      lastPayloadTimestamp: this.lastPayloadTimestamp.toString(),
    };
  }

  public createPriceUpdateTx(data: `0x${string}`): RawTx {
    return this.createRawTx({
      functionName: "updatePrice",
      args: [data],
      description: `updating redstone price for ${this.dataId} [${this.labelAddress(this.address)}]`,
    });
  }
}
