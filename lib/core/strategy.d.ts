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
    borrowAPY: number;
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
    overallAPY(leverage: number, depositCollateral: string, pool: PoolStats | undefined): number;
    liquidationPrice(leverage: number, maxLeverage: number, ltCollateral: number, depositCollateral: string): number;
    private roi;
    private minBorrowApy;
    private borrowApy;
    private farmLev;
    private inBaseAssets;
    private inLeveragableAssets;
    private ltStrategyLP;
}
export {};
