import { ethers } from "ethers";
import { Multicall2 } from "../types/Multicall2";

import { Multicall2__factory } from "../types/factories/Multicall2__factory";

export interface CallData<T extends ethers.utils.Interface> {
  method: keyof T["functions"];
  params?: any;
}

export class MultiCallContract<T extends ethers.utils.Interface> {
  private readonly _address: string;
  private readonly _interface: T;
  protected _multiCall: Multicall2;

  constructor(
    address: string,
    intrerface: T,
    provider: ethers.providers.Provider
  ) {
    this._address = address;
    this._interface = intrerface;

    this._multiCall = Multicall2__factory.connect(
      "0x5ba1e12693dc8f9c48aad8770482f4739beed696",
      provider
    );
  }

  async call<R extends Array<any>>(data: Array<CallData<T>>): Promise<R> {
    const { returnData } = await this._multiCall.callStatic.aggregate(
      data.map((c) => ({
        target: this._address,
        callData: this._interface.encodeFunctionData(
          c.method as string,
          c.params
        ),
      }))
    );

    return returnData
      .map((d, num) =>
        this._interface.decodeFunctionResult(data[num].method as string, d)
      )
      .map((r) => r[0]) as R;
  }

  get address(): string {
    return this._address;
  }

  get interface(): T {
    return this._interface;
  }
}
