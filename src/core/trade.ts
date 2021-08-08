import { BigNumber } from "ethers";

export interface TradePath {
  rate: BigNumber;
  path: Array<string>;
  expectedAmount: BigNumber;
}

export interface Trade extends TradePath {
  rateIsLoading: boolean;
  rateError: boolean;
}
