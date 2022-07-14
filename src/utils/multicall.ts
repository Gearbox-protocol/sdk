import { ethers } from "ethers";
import { MULTICALL_ADDRESS } from "../config";
import { Multicall2, Multicall2__factory } from "../types";

export interface CallData<T extends ethers.utils.Interface> {
  method: keyof T["functions"];
  params?: any;
}

export interface MCall<T extends ethers.utils.Interface> {
  address: string;
  interface: T;
  method: keyof T["functions"];
  params?: any;
}

export async function multicall<R extends Array<any>>(
  calls: Array<MCall<any>>,
  p: ethers.providers.Provider
): Promise<R> {
  const multiCallContract = Multicall2__factory.connect(MULTICALL_ADDRESS, p);

  const { returnData } = await multiCallContract.callStatic.aggregate(
    calls.map(c => ({
      target: c.address,
      callData: c.interface.encodeFunctionData(c.method as string, c.params)
    }))
  );

  return returnData
    .map((d, num) =>
      calls[num].interface.decodeFunctionResult(calls[num].method as string, d)
    )
    .map(r => r[0]) as R;
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

    this._multiCall = Multicall2__factory.connect(MULTICALL_ADDRESS, provider);
  }

  async call<R extends Array<any>>(data: Array<CallData<T>>): Promise<R> {
    const { returnData } = await this._multiCall.callStatic.aggregate(
      data.map(c => ({
        target: this._address,
        callData: this._interface.encodeFunctionData(
          c.method as string,
          c.params
        )
      }))
    );

    return returnData
      .map((d, num) =>
        this._interface.decodeFunctionResult(data[num].method as string, d)
      )
      .map(r => r[0]) as R;
  }

  get address(): string {
    return this._address;
  }

  get interface(): T {
    return this._interface;
  }
}
