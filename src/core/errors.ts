import { BigNumber } from "ethers";

export interface MetamaskError {
  code: number;
  message: string;
  data: string;
}
export type OpenAccountErrorTypes =
  | "insufficientPoolLiquidity"
  | "leverageGreaterMax"
  | "wrongLeverage"
  | "amountGreaterMax"
  | "amountLessMin";

export class OpenAccountError extends Error {
  message: OpenAccountErrorTypes;

  payload: { amount: BigNumber };

  constructor(errorType: OpenAccountErrorTypes, amount: BigNumber) {
    super();
    Object.setPrototypeOf(this, OpenAccountError.prototype);
    this.message = errorType;
    this.payload = { amount };
  }

  static isOpenAccountError(e: unknown): e is OpenAccountError {
    return e instanceof OpenAccountError;
  }
}
