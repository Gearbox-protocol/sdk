import { BigNumber } from "ethers";

export interface MetamaskError {
  code: number;
  message: string;
  data: string;
}

export class NetworkError extends Error {
  constructor() {
    super("errors.networkError");
  }
}
export class IncorrectEthAddressError extends Error {
  constructor() {
    super("errors.incorrectEthAddressError");
  }
}

export class PoolNotExistsError extends Error {
  constructor() {
    super("errors.poolDoesntExistsError");
  }
}

export class CreditManagerNotExistsError extends Error {
  constructor() {
    super("errors.creditManagerDoesntExistsError");
  }
}
export class UserHasNotAccountError extends Error {
  constructor() {
    super("errors.noOpenedAccountsError");
  }
}

export class PathNotFoundError extends Error {
  constructor() {
    super("errors.pathNotFoundError");
  }
}

export class AccountsInAlllCreditManagersError extends Error {
  constructor() {
    super("errors.youOpenedAccountsInAllCreditManagersError");
  }
}

export type OpenAccountErrorTypes =
  | "insufficientPoolLiquidity"
  | "leverageGreaterMax"
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
