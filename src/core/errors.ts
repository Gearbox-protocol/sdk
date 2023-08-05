export interface MetamaskError {
  code: number;
  message: string;
  data: string;
}
export type OpenAccountErrorTypes =
  | "insufficientDebtLimit"
  | "insufficientPoolLiquidity"
  | "leverageGreaterMax"
  | "wrongLeverage"
  | "amountGreaterMax"
  | "amountLessMin";

export class OpenAccountError extends Error {
  message: OpenAccountErrorTypes;

  payload: { amount: bigint };

  constructor(errorType: OpenAccountErrorTypes, amount: bigint) {
    super();
    Object.setPrototypeOf(this, OpenAccountError.prototype);
    this.message = errorType;
    this.payload = { amount };
  }

  static isOpenAccountError(e: unknown): e is OpenAccountError {
    return e instanceof OpenAccountError;
  }
}
