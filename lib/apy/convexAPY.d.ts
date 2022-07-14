import { BigNumber, providers } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { SupportedToken } from "../tokens/token";
import { CurveLPToken } from "../tokens/curveLP";
import { PriceOracle } from "../types";
export declare function getConvexApyRAY(pool: ConvexPoolContract, provider: providers.Provider, priceOracle: PriceOracle, getTokenPrice: (token: SupportedToken) => BigNumber): Promise<BigNumber>;
export declare function getPrice(contractAddress: Array<string>, vsCoin: string): Promise<Array<number>>;
export declare function getCurveBaseApy(curveLPToken: CurveLPToken): Promise<BigNumber>;
export declare function getRewards(pool: ConvexPoolContract): Array<SupportedToken>;
