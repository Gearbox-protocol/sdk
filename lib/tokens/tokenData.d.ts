import { BigNumber } from "ethers";
import { TokenDataPayload } from "../payload/token";
import { NetworkType } from "../core/constants";
import { SupportedToken } from "./token";
export declare class TokenData {
    readonly id: string;
    readonly symbol: string;
    readonly address: string;
    readonly decimals: number;
    readonly icon?: string;
    constructor(payload: TokenDataPayload);
    compareBySymbol(b: TokenData): number;
}
export interface TokenBalance {
    id: string;
    balance: BigNumber;
}
export interface TokenAllowance {
    id: string;
    allowance: BigNumber;
}
export declare const WETHToken: Record<NetworkType, string>;
export declare const connectors: Record<NetworkType, Array<SupportedToken>>;
export declare function getConnectors(networkType: NetworkType): string[];
