import { Multicall2 } from "../types/Multicall2";
import { ethers } from "ethers";
export interface CallData<T extends ethers.utils.Interface> {
    method: keyof T["functions"];
    params?: any;
}
export declare class MultiCallContract<T extends ethers.utils.Interface> {
    private readonly _address;
    private readonly _interface;
    protected _multiCall: Multicall2;
    constructor(address: string, intrerface: T, provider: ethers.providers.Provider);
    call<R extends Array<any>>(data: Array<CallData<T>>): Promise<R>;
    get address(): string;
    get interface(): T;
}
