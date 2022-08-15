import { BigNumber, providers } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { CurveLPToken } from "../tokens/curveLP";
import { NetworkType } from "../core/constants";
export declare function getConvexApy(pool: ConvexPoolContract, provider: providers.Provider, networkType: NetworkType, getTokenPrice: (tokenAddress: string) => BigNumber): Promise<BigNumber>;
export declare function getCurveBaseApy(curveLPToken: CurveLPToken): Promise<BigNumber>;
