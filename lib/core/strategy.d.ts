export interface StrategyPayload {
    apy: number;
    poolApy: Record<string, number>;
    ltStrategyLP: number;
    name: string;
    lpToken: string;
    pools: Array<string>;
    unleveragableCollateral: Array<string>;
    leveragableCollateral: Array<string>;
    baseAssets: Array<string>;
}
export declare class Strategy {
    apy: number;
    poolApy: Record<string, number>;
    ltStrategyLP: number;
    name: string;
    lpToken: string;
    pools: Array<string>;
    unleveragableCollateral: Array<string>;
    leveragableCollateral: Array<string>;
    baseAssets: Array<string>;
    constructor(payload: StrategyPayload);
    roiMax(): number;
    maxLeverage(): number;
    private minBorrowApy;
    private roi;
    private borrowApy;
    private farmLev;
    overallAPY(leverage: number, depositCollateral: string): number;
    liquidationPrice(leverage: number, depositCollateral: string): number;
}
