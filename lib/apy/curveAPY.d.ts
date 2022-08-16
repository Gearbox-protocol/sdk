import { BigNumber } from "ethers";
import { CurveLPToken } from "../tokens/curveLP";
export declare type CurveAPYResult = Record<CurveLPToken, BigNumber>;
export declare function getCurveAPY(): Promise<CurveAPYResult>;
