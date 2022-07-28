import { BigNumberish } from "ethers";

import {
  ICreditFacade__factory,
  ICreditFacadeBalanceChecker__factory
} from "../types";
import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";

export class CreditFacadeCalls {
  public static addCollateral(
    onBehalfOf: string,
    token: string,
    amount: BigNumberish
  ) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "addCollateral",
      [onBehalfOf, token, amount]
    );
  }

  public static increaseDebt(amount: BigNumberish) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "increaseDebt",
      [amount]
    );
  }

  public static decreaseDebt(amount: BigNumberish) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "decreaseDebt",
      [amount]
    );
  }

  public static revertIfBalanceLessThan(
    token: string,
    minBalance: BigNumberish
  ) {
    return ICreditFacadeBalanceChecker__factory.createInterface().encodeFunctionData(
      "revertIfBalanceLessThan",
      [token, minBalance]
    );
  }
}

export class CreditFacadeMulticaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  addCollateral(
    onBehalfOf: string,
    token: string,
    amount: BigNumberish
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.addCollateral(onBehalfOf, token, amount)
    };
  }

  increaseDebt(amount: BigNumberish): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.increaseDebt(amount)
    };
  }

  decreaseDebt(amount: BigNumberish): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.decreaseDebt(amount)
    };
  }

  revertIfBalanceLessThan(
    token: string,
    minBalance: BigNumberish
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.revertIfBalanceLessThan(token, minBalance)
    };
  }
}
