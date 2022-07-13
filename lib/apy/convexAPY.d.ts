import { BigNumber, providers } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { SupportedToken } from "../tokens/token";
import { CurveLPToken } from "../tokens/curveLP";
export declare function getConvexApyRAY(pool: ConvexPoolContract, provider: providers.Provider, getTokenPrice: (token: SupportedToken) => BigNumber): Promise<BigNumber>;
export declare function getCurveBaseApy(curveLPToken: CurveLPToken): Promise<number>;
export declare function getRewards(pool: ConvexPoolContract): Array<SupportedToken>;
