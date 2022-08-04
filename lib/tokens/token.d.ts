import { NetworkType } from "../core/constants";
import { NormalToken, NormalTokenData } from "./normal";
import { CurveLPToken, CurveLPTokenData, MetaCurveLPTokenData } from "./curveLP";
import { YearnLPToken, YearnVaultOfCurveLPTokenData, YearnVaultOfMetaCurveLPTokenData, YearnVaultTokenData } from "./yearn";
import { ConvexLPToken, ConvexLPTokenData, ConvexPhantomTokenData, ConvexStakedPhantomToken } from "./convex";
import { DieselTokenData, DieselTokenTypes, GearboxToken, GearboxTokenData } from "./gear";
export declare type SupportedToken = NormalToken | YearnLPToken | CurveLPToken | ConvexLPToken | ConvexStakedPhantomToken | DieselTokenTypes | GearboxToken;
export interface TokenBase {
    name: string;
    symbol: string;
    decimals: number;
}
export declare type TokenDataI = NormalTokenData | CurveLPTokenData | MetaCurveLPTokenData | YearnVaultTokenData | YearnVaultOfCurveLPTokenData | YearnVaultOfMetaCurveLPTokenData | ConvexLPTokenData | ConvexPhantomTokenData | DieselTokenData | GearboxTokenData;
export declare const supportedTokens: Record<SupportedToken, TokenDataI>;
export declare const tokenDataByNetwork: Record<NetworkType, Record<SupportedToken, string>>;
export declare const tokenSymbolByAddress: Record<string, SupportedToken>;
export declare const isSupportedTokens: (t: unknown) => t is SupportedToken;
