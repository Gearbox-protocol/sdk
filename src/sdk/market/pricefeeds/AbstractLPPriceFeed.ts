import type { Abi, Address, UnionOmit } from "viem";
import { decodeAbiParameters, hexToBytes } from "viem";
import type { ConstructOptions } from "../../base/Construct.js";
import { isV310 } from "../../constants/versions.js";
import type { LPPriceFeedStateHuman } from "../../types/state-human.js";
import {
  AbstractPriceFeedContract,
  type PriceFeedConstructorArgs,
} from "./AbstractPriceFeed.js";

export abstract class AbstractLPPriceFeedContract<
  const abi extends Abi | readonly unknown[],
> extends AbstractPriceFeedContract<abi> {
  public readonly lpContract: Address;
  public readonly lpToken: Address;
  public readonly lowerBound: bigint;
  public readonly upperBound: bigint;
  // v3.0 optionals
  public readonly exchangeRate?: bigint;
  public readonly aggregatePrice?: bigint;
  public readonly scale?: bigint;

  constructor(options: ConstructOptions, args: PriceFeedConstructorArgs<abi>) {
    super(options, { ...args, decimals: 8 });
    this.hasLowerBoundCap = true;

    if (isV310(args.baseParams.version)) {
      // https://github.com/Gearbox-protocol/oracles-v3/blob/fc8d3a0ab5bd7eb50ce3f6b87dde5cd3d887bafe/contracts/oracles/LPPriceFeed.sol#L69
      const decoder = decodeAbiParameters(
        [
          { type: "address", name: "lpToken" },
          { type: "address", name: "lpContract" },
          { type: "uint256", name: "lowerBound" },
          { type: "uint256", name: "upperBound" },
        ],
        hexToBytes(args.baseParams.serializedParams),
      );

      this.lpToken = decoder[0];
      this.lpContract = decoder[1];
      this.lowerBound = decoder[2];
      this.upperBound = decoder[3];
    } else {
      // https://github.com/Gearbox-protocol/periphery-v3/blob/8ae4c5f8835de9961c55403fcc810516cea3e29c/contracts/serializers/oracles/LPPriceFeedSerializer.sol#L21
      const decoder = decodeAbiParameters(
        [
          { type: "address", name: "lpToken" },
          { type: "address", name: "lpContract" },
          { type: "uint256", name: "lowerBound" },
          { type: "uint256", name: "upperBound" },
          {
            type: "tuple",
            name: "price",
            components: [
              { type: "uint256", name: "exchangeRate" },
              { type: "int256", name: "aggregatePrice" },
              { type: "uint256", name: "scale" },
              { type: "bool", name: "exchangeRateSuccess" },
              { type: "bool", name: "aggregatePriceSuccess" },
            ],
          },
        ],
        hexToBytes(args.baseParams.serializedParams),
      );

      this.lpToken = decoder[0];
      this.lpContract = decoder[1];
      this.lowerBound = decoder[2];
      this.upperBound = decoder[3];

      this.exchangeRate = decoder[4].exchangeRate;
      this.aggregatePrice = decoder[4].aggregatePrice;
      this.scale = decoder[4].scale;
    }
  }

  public override stateHuman(
    raw?: boolean,
  ): UnionOmit<LPPriceFeedStateHuman, "stalenessPeriod"> {
    return {
      ...super.stateHuman(raw),
      lpContract: this.lpContract,
      lpToken: this.lpToken,
      lowerBound: this.lowerBound,
      upperBound: this.upperBound,
      // v3.0 optionals
      exchangeRate: this.exchangeRate?.toString(),
      aggregatePrice: this.aggregatePrice?.toString(),
      scale: this.scale?.toString(),
    };
  }
}

export function isLPPriceFeed(
  priceFeed: unknown,
): priceFeed is AbstractLPPriceFeedContract<any> {
  return priceFeed instanceof AbstractLPPriceFeedContract;
}
