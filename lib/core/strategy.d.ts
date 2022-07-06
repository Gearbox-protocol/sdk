export interface StrategyPayload {
    apy: number;
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
export declare class Strategy {
    apy: number;
    name: string;
    lpToken: string;
    pools: Array<string>;
    unleveragableCollateral: Array<string>;
    leveragableCollateral: Array<string>;
    baseAssets: Array<string>;
    constructor(payload: StrategyPayload);
    roiMax(maxLeverage: number, poolApy: PoolList): number;
    overallAPY(leverage: number, depositCollateral: string, borrowAPY: number): number;
    liquidationPrice(leverage: number, ltStrategy: number, ltCollateral: number, depositCollateral: string): number;
    ltStrategyLP(maxLeverage: number): number;
    private roi;
    private minBorrowApy;
    private farmLev;
    private inBaseAssets;
    private inLeveragableAssets;
}
export {};
