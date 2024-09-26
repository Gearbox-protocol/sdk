import { Address, PRICE_FEED_GROUP } from "@gearbox-protocol/sdk-gov";
import { Abi, Hex, decodeAbiParameters, hexToBytes, parseAbi } from "viem";
import { createRawTx } from "../../utils/create-raw-tx";
import { AbstractDependentPriceFeed } from "./AbstractDependentPriceFeed";
import { PriceFeedConstructorArgs } from "./AbstractPriceFeed";

const LOWER_BOUND_FACTOR = 99n;

export interface LPPriceFeedConstructorArgs extends PriceFeedConstructorArgs {
  lpContract: Address;
}

interface SuperLPPriceFeedConstructorArgs<abi extends Abi | readonly unknown[]>
  extends LPPriceFeedConstructorArgs {
  name: string;
  abi: abi;
}

const SET_CONTROLLER_ABI = [
  "function setController(address newController) external",
];

export abstract class AbstractLPPriceFeedContract<
  const abi extends Abi | readonly unknown[],
> extends AbstractDependentPriceFeed<abi> {
  lpContract: Address;
  lpToken: Address;
  lowerBound: bigint;
  upperBound: bigint;
  decimals = 8;
  hasLowerBoundCap = true;

  constructor(args: SuperLPPriceFeedConstructorArgs<abi>) {
    super(args);
    this.lpContract = args.lpContract;
  }

  abstract getValue(): Promise<bigint>;

  async getLowerBound(): Promise<bigint> {
    const value = await this.getValue();
    const lowerBound = AbstractLPPriceFeedContract.toLowerBound(value);

    this.v3.logger.debug(
      `Lowerbound for ${this.addressLabels.get(this.address)}: ${lowerBound}`,
    );
    return lowerBound;
  }

  static toLowerBound(value: bigint): bigint {
    return (value * LOWER_BOUND_FACTOR) / 100n;
  }

  public setupController(controller: Address) {
    // this.factory.setupTxs.push(
    //   createRawTx(
    //     this.address,
    //     {
    //       abi: parseAbi(SET_CONTROLLER_ABI),
    //       functionName: "setController",
    //       args: [controller],
    //     },
    //     `${this.name}.setController({newController: ${this.addressLabels.get(controller)}})`,
    //   ),
    // );
    // const groupTx = this.factory.controllerTimelock.setGroup(
    //   this.address,
    //   PRICE_FEED_GROUP,
    // );
    // if (groupTx) this.factory.setupTxs.push(groupTx);
  }

  protected parseCompressorSpecificParams(params: Hex) {
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
      hexToBytes(params),
    );

    this.lpContract = decoder[0];
    this.lpToken = decoder[1];
    this.lowerBound = decoder[2];
    this.upperBound = decoder[3];
    //(uint40);

    // function getAggregatePrice() external view returns (int256 answer);
    // function getLPExchangeRate() external view returns (uint256 exchangeRate);
    // function getScale() external view returns (uint256 scale);
  }
}
