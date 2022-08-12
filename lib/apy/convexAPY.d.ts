import { BigNumber, providers } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { CurveLPToken } from "../tokens/curveLP";
import { NetworkType } from "../core/constants";
declare type SupportedPools = ConvexPoolContract;
export declare function getConvexApy(pool: SupportedPools, provider: providers.Provider, networkType: NetworkType, getTokenPrice: (tokenAddress: string) => BigNumber): Promise<BigNumber>;
export declare function getCurveBaseApy(curveLPToken: CurveLPToken): Promise<BigNumber>;
export {};
