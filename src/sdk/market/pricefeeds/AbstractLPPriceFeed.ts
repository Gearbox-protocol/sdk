import type { Abi, Address, UnionOmit } from "viem";
import { decodeAbiParameters, hexToBytes } from "viem";
import type { ConstructOptions } from "../../base/Construct.js";
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

  constructor(options: ConstructOptions, args: PriceFeedConstructorArgs<abi>) {
    super(options, { ...args, decimals: 8 });
    this.hasLowerBoundCap = true;

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
    };
  }
}

export function isLPPriceFeed(
  priceFeed: unknown,
): priceFeed is AbstractLPPriceFeedContract<any> {
  return priceFeed instanceof AbstractLPPriceFeedContract;
}
