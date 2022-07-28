import { BigNumber } from "ethers";
export interface StrategyPayload {
    apy?: number;
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
    private farmLev;
    private inBaseAssets;
    private inLeveragableAssets;
}
export {};
