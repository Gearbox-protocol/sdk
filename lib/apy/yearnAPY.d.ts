import { BigNumber } from "ethers";
import { YearnLPToken } from "../tokens/yearn";
export declare type YearnAPYResult = Record<YearnLPToken, BigNumber>;
export declare function getYearnAPY(): Promise<YearnAPYResult>;
