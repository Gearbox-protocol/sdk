import type { Hex } from "viem";
import { iPriceOracleConfigureActionsAbi } from "../../../abi/310/configure/iPriceOracleConfigureActions.js";
import type { SetPriceFeedParams, SetReservePriceFeedParams } from "../types";
import { AbstractFactory } from "./abstract-factory";

const abi = iPriceOracleConfigureActionsAbi;

export class PriceOracleFactory extends AbstractFactory<typeof abi> {
  constructor() {
    super(abi);
  }

  setPriceFeed(params: SetPriceFeedParams): Hex {
    return this.createCallData({
      functionName: "setPriceFeed",
      args: [params.token, params.priceFeed],
    });
  }

  setReservePriceFeed(params: SetReservePriceFeedParams): Hex {
    return this.createCallData({
      functionName: "setReservePriceFeed",
      args: [params.token, params.priceFeed],
    });
  }
}
