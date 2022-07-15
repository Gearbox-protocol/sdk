import { BigNumber, providers } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { CurveLPToken } from "../tokens/curveLP";
import { NetworkType } from "../core/constants";
declare type SupportedPools = Extract<ConvexPoolContract, "CONVEX_3CRV_POOL" | "CONVEX_FRAX3CRV_POOL" | "CONVEX_LUSD3CRV_POOL" | "CONVEX_GUSD_POOL" | "CONVEX_SUSD_POOL">;
export declare function getConvexApy(pool: SupportedPools, provider: providers.Provider, networkType: NetworkType, getTokenPrice: (tokenAddress: string) => BigNumber): Promise<BigNumber>;
export declare function getCurveBaseApy(curveLPToken: CurveLPToken): Promise<BigNumber>;
export {};
