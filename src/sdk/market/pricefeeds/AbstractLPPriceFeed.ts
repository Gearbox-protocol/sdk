import type { Abi, Address, UnionOmit } from "viem";
import { decodeAbiParameters, hexToBytes } from "viem";

import type { GearboxSDK } from "../../GearboxSDK.js";
import type { LPPriceFeedStateHuman } from "../../types/state-human.js";
import {
  AbstractPriceFeedContract,
  type PriceFeedConstructorArgs,
} from "./AbstractPriceFeed.js";

const LOWER_BOUND_FACTOR = 99n;

export abstract class AbstractLPPriceFeedContract<
  const abi extends Abi | readonly unknown[],
> extends AbstractPriceFeedContract<abi> {
  public readonly lpContract: Address;
  public readonly lpToken: Address;
  public readonly lowerBound: bigint;
  public readonly upperBound: bigint;

  constructor(sdk: GearboxSDK, args: PriceFeedConstructorArgs<abi>) {
    super(sdk, { ...args, decimals: 8 });
    this.hasLowerBoundCap = true;
    const decoder = decodeAbiParameters(
      [
        { type: "address", name: "lpToken" },
        { type: "address", name: "lpContract" },
        { type: "uint256", name: "lowerBound" },
        { type: "uint256", name: "upperBound" },
        // { type: "bool", name: "updateBoundsAllowed" },
        // { type: "uint40", name: "lastBoundsUpdate" },
        { type: "int256", name: "aggregatePrice" },
        { type: "uint256", name: "lPExchangeRate" },
        { type: "uint256", name: "scale" },
      ],
      hexToBytes(args.baseParams.serializedParams),
    );

    this.lpToken = decoder[0];
    this.lpContract = decoder[1];
    this.lowerBound = decoder[2];
    this.upperBound = decoder[3];
  }

  abstract getValue(): Promise<bigint>;

  async getLowerBound(): Promise<bigint> {
    const value = await this.getValue();
    const lowerBound = AbstractLPPriceFeedContract.toLowerBound(value);
    this.logger?.debug(
      `Lowerbound for ${this.labelAddress(this.address)}: ${lowerBound}`,
    );
    return lowerBound;
  }

  static toLowerBound(value: bigint): bigint {
    return (value * LOWER_BOUND_FACTOR) / 100n;
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
