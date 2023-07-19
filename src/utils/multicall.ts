import { CallOverrides, ethers, Signer } from "ethers";

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

export interface KeyedCall<T extends ethers.utils.Interface> extends MCall<T> {
  key: string;
}

export async function multicall<R extends Array<any>>(
  calls: Array<MCall<any>>,
  p: Signer | ethers.providers.Provider,
  overrides?: CallOverrides,
): Promise<R> {
  const multiCallContract = Multicall2__factory.connect(MULTICALL_ADDRESS, p);

  const { returnData } = await multiCallContract.callStatic.aggregate(
    calls.map(c => ({
      target: c.address,
      callData: c.interface.encodeFunctionData(c.method as string, c.params),
    })),
    overrides || {},
  );

  return returnData
    .map((d, num) =>
      calls[num].interface.decodeFunctionResult(calls[num].method as string, d),
    )
    .map(unwrapArray) as R;
}

/**
 * Like multicall from sdk, but uses tryAggregate instead of aggregate
 * @param calls
 * @param p
 * @param overrides
 * @returns
 */
export default async function safeMulticall<
  V = any,
  T extends MCall<any> = MCall<any>,
>(
  calls: T[],
  p: Signer | ethers.providers.Provider,
  overrides?: CallOverrides,
): Promise<Array<{ error: boolean; value?: V }>> {
  if (!calls.length) {
    return [];
  }
  const multiCallContract = Multicall2__factory.connect(
    "0xcA11bde05977b3631167028862bE2a173976CA11",
    p,
  );

  const resp = await multiCallContract.callStatic.tryAggregate(
    false,
    calls.map(c => ({
      target: c.address,
      callData: c.interface.encodeFunctionData(c.method as string, c.params),
    })),
    overrides ?? {},
  );

  return resp.map((d, num) => ({
    error: !d.success,
    value: d.success
      ? unwrapArray(
          calls[num].interface.decodeFunctionResult(
            calls[num].method as string,
            d.returnData,
          ),
        )
      : undefined,
  }));
}

function unwrapArray<V>(data: unknown): V {
  if (!data) {
    return data as V;
  }
  if (Array.isArray(data)) {
    return data.length === 1 ? data[0] : data;
  }
  return data as V;
}

export class MultiCallContract<T extends ethers.utils.Interface> {
  private readonly _address: string;

  private readonly _interface: T;

  protected _multiCall: Multicall2;

  constructor(
    address: string,
    intrerface: T,
    provider: ethers.providers.Provider | Signer,
  ) {
    this._address = address;
    this._interface = intrerface;

    this._multiCall = Multicall2__factory.connect(MULTICALL_ADDRESS, provider);
  }

  async call<R extends Array<any>>(
    data: Array<CallData<T>>,
    overrides?: CallOverrides,
  ): Promise<R> {
    const { returnData } = await this._multiCall.callStatic.aggregate(
      data.map(c => ({
        target: this._address,
        callData: this._interface.encodeFunctionData(
          c.method as string,
          c.params,
        ),
      })),
      overrides || {},
    );

    return returnData
      .map((d, num) =>
        this._interface.decodeFunctionResult(data[num].method as string, d),
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
