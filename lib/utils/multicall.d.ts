import { ethers } from "ethers";
import { Multicall2 } from "../types";
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
export declare function multicall<R extends Array<any>>(calls: Array<MCall<any>>, p: ethers.providers.Provider): Promise<R>;
export declare class MultiCallContract<T extends ethers.utils.Interface> {
    private readonly _address;
    private readonly _interface;
    protected _multiCall: Multicall2;
    constructor(address: string, intrerface: T, provider: ethers.providers.Provider);
    call<R extends Array<any>>(data: Array<CallData<T>>): Promise<R>;
    get address(): string;
    get interface(): T;
}
