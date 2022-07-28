import { BigNumberish } from "ethers";

import { YearnV2Adapter__factory } from "../types";

import { MultiCallStruct } from "../types/contracts/interfaces/ICreditFacade.sol/ICreditFacade";

export class YearnV2Calls {
  public static deposit(amount?: BigNumberish, recipient?: string): string {
    const contractInterface = YearnV2Adapter__factory.createInterface();
    if (amount && recipient) {
      return contractInterface.encodeFunctionData("deposit(uint256,address)", [
        amount,
        recipient
      ]);
    }
    if (amount) {
      return contractInterface.encodeFunctionData("deposit(uint256)", [amount]);
    }
    return contractInterface.encodeFunctionData("deposit()");
  }

  public static withdraw(
    maxShares?: BigNumberish,
    recipient?: string,
    maxLoss?: BigNumberish
  ): string {
    const contractInterface = YearnV2Adapter__factory.createInterface();
    if (maxShares && recipient && maxLoss) {
      return contractInterface.encodeFunctionData(
        "withdraw(uint256,address,uint256)",
        [maxShares, recipient, maxLoss]
      );
    }
    if (maxShares && recipient) {
      return contractInterface.encodeFunctionData("withdraw(uint256,address)", [
        maxShares,
        recipient
      ]);
    }
    if (maxShares) {
      return contractInterface.encodeFunctionData("withdraw(uint256)", [
        maxShares
      ]);
    }
    return contractInterface.encodeFunctionData("withdraw()");
  }
}

export class YearnV2Multicaller {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  deposit(amount?: BigNumberish, recipient?: string): MultiCallStruct {
    return {
      target: this._address,
      callData: YearnV2Calls.deposit(amount, recipient)
    };
  }

  withdraw(
    maxShares?: BigNumberish,
    recipient?: string,
    maxLoss?: BigNumberish
  ): MultiCallStruct {
    return {
      target: this._address,
      callData: YearnV2Calls.withdraw(maxShares, recipient, maxLoss)
    };
  }
}
