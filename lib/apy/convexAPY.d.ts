import { BigNumber, providers } from "ethers";
import { ConvexPoolContract } from "../contracts/contracts";
import { NetworkType } from "../core/constants";
import { CurveAPYResult } from "./curveAPY";
export interface GetConvexAPYProps {
    pool: ConvexPoolContract;
    provider: providers.Provider;
    networkType: NetworkType;
    getTokenPrice: (tokenAddress: string) => BigNumber;
    curveAPY: CurveAPYResult;
}
export declare function getConvexAPY({ pool, provider, networkType, getTokenPrice, curveAPY }: GetConvexAPYProps): Promise<BigNumber>;
