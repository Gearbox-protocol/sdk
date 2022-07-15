import { BigNumber, Signer } from "ethers";
import { PoolDataPayload } from "../payload/pool";
import { IPoolService } from "../types";
export declare class PoolData {
    readonly id: string;
    readonly address: string;
    readonly underlyingToken: string;
    readonly dieselToken: string;
    readonly isWETH: boolean;
    readonly expectedLiquidity: BigNumber;
    readonly expectedLiquidityLimit: BigNumber;
    readonly availableLiquidity: BigNumber;
    readonly totalBorrowed: BigNumber;
    readonly depositAPY: number;
    readonly borrowAPY: number;
    readonly borrowAPYRay: BigNumber;
    readonly dieselRate: number;
    readonly dieselRateRay: BigNumber;
    readonly withdrawFee: number;
    readonly timestampLU: BigNumber;
    readonly cumulativeIndex_RAY: BigNumber;
    constructor(payload: PoolDataPayload);
    getContractETH(signer: Signer): IPoolService;
    get isPaused(): boolean;
}
export interface PoolsStat {
    tvl: number;
    totalBorrowed: number;
}
