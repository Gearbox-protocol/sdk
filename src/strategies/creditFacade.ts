import { BigNumberish } from "ethers";

import {
  ICreditFacade__factory,
  ICreditFacadeExtended__factory,
} from "../types";
import { MultiCallStruct } from "../types/@gearbox-protocol/router/contracts/interfaces/IClosePathResolver";

export class CreditFacadeCalls {
  public static addCollateral(
    onBehalfOf: string,
    token: string,
    amount: BigNumberish,
  ) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "addCollateral",
      [onBehalfOf, token, amount],
    );
  }

  public static increaseDebt(amount: BigNumberish) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "increaseDebt",
      [amount],
    );
  }

  public static decreaseDebt(amount: BigNumberish) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "decreaseDebt",
      [amount],
    );
  }

  public static revertIfBalanceLessThan(
    token: string,
    minBalance: BigNumberish,
  ) {
    return ICreditFacadeExtended__factory.createInterface().encodeFunctionData(
      "revertIfReceivedLessThan",
      [[{ token, balance: minBalance }]],
    );
  }

  public static disableToken(token: string) {
    return ICreditFacadeExtended__factory.createInterface().encodeFunctionData(
      "disableToken",
      [token],
    );
  }

  public static enableToken(token: string) {
    return ICreditFacade__factory.createInterface().encodeFunctionData(
      "enableToken",
      [token],
    );
  }
}

export class CreditFacadeMulticaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  static connect(address: string) {
    return new CreditFacadeMulticaller(address);
  }

  addCollateral(
    onBehalfOf: string,
    token: string,
    amount: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.addCollateral(onBehalfOf, token, amount),
    };
  }

  increaseDebt(amount: BigNumberish): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.increaseDebt(amount),
    };
  }

  decreaseDebt(amount: BigNumberish): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.decreaseDebt(amount),
    };
  }

  revertIfBalanceLessThan(
    token: string,
    minBalance: BigNumberish,
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.revertIfBalanceLessThan(token, minBalance),
    };
  }

  disableToken(token: string): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.disableToken(token),
    };
  }

  enableToken(token: string): MultiCallStruct {
    return {
      target: this._address,
      callData: CreditFacadeCalls.enableToken(token),
    };
  }
}
