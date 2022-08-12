import { BigNumber } from "ethers";
import { TokensWithAPY } from "../apy";
export interface StrategyPayload {
    apy?: number;
    apyTokenSymbol: TokensWithAPY;
    name: string;
    lpToken: string;
    pools: Array<string>;
    unleveragableCollateral: Array<string>;
    leveragableCollateral: Array<string>;
    baseAssets: Array<string>;
}
interface PoolStats {
    borrowRate: number;
}
declare type PoolList = Record<string, PoolStats>;
interface TokenDescription {
    price: BigNumber;
    amount: BigNumber;
    decimals: number | undefined;
}
export declare class Strategy {
    apy: number | undefined;
    name: string;
    lpToken: string;
    pools: Array<string>;
    unleveragableCollateral: Array<string>;
    leveragableCollateral: Array<string>;
    baseAssets: Array<string>;
    constructor(payload: StrategyPayload);
    maxAPY(maxLeverage: number, poolApy: PoolList): number;
    overallAPY(apy: number, leverage: number, depositCollateral: string, borrowAPY: number): number;
    liquidationPrice(borrowed: TokenDescription, collateral: TokenDescription, lp: TokenDescription, ltCollateral: BigNumber): BigNumber;
    protected farmLev(leverage: number, depositCollateral: string): number;
    protected inBaseAssets(depositCollateral: string): boolean;
    protected inLeveragableAssets(depositCollateral: string): boolean;
}
export {};
