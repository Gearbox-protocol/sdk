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
export declare class Strategy {
    apy: number | undefined;
    name: string;
    lpToken: string;
    pools: Array<string>;
    unleveragableCollateral: Array<string>;
    leveragableCollateral: Array<string>;
    baseAssets: Array<string>;
    constructor(payload: StrategyPayload);
    roiMax(apy: number, maxLeverage: number, poolApy: PoolList): number;
    overallAPY(apy: number, leverage: number, depositCollateral: string, borrowAPY: number): number;
    liquidationPrice(underlyingPrice: number, collateralPrice: number, lpPrice: number, borrowedAmount: number, collateralAmount: number, lpAmount: number, ltCollateral: number): number;
    ltStrategyLP(maxLeverage: number): number;
    maxLeverage(ltStrategyLP: number): number;
    private roi;
    private minBorrowApy;
    private farmLev;
    private inBaseAssets;
    private inLeveragableAssets;
}
export {};
