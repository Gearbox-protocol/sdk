import { NetworkType } from "../core/constants";
import { NormalToken, NormalTokenData } from "./normal";
import { CurveLPToken, CurveLPTokenData, MetaCurveLPTokenData } from "./curveLP";
import { YearnLPToken, YearnVaultOfCurveLPTokenData, YearnVaultOfMetaCurveLPTokenData, YearnVaultTokenData } from "./yearn";
import { ConvexLPToken, ConvexLPTokenData, ConvexPhantomTokenData, ConvexStakedPhantomToken } from "./convex";
import { DieselTokenData, DieselTokenTypes, GearboxToken, GearboxTokenData } from "./gear";
export declare type LPTokens = YearnLPToken | CurveLPToken | ConvexLPToken | ConvexStakedPhantomToken;
export declare type SupportedToken = NormalToken | LPTokens | DieselTokenTypes | GearboxToken;
export interface TokenBase {
    name: string;
    symbol: string;
    decimals: number;
}
export declare type LPTokenDataI = CurveLPTokenData | MetaCurveLPTokenData | YearnVaultTokenData | YearnVaultOfCurveLPTokenData | YearnVaultOfMetaCurveLPTokenData | ConvexLPTokenData | ConvexPhantomTokenData;
export declare type TokenDataI = NormalTokenData | LPTokenDataI | DieselTokenData | GearboxTokenData;
export declare const lpTokens: Record<LPTokens, LPTokenDataI>;
export declare const supportedTokens: Record<SupportedToken, TokenDataI>;
export declare const tokenDataByNetwork: Record<NetworkType, Record<SupportedToken, string>>;
export declare const tokenSymbolByAddress: Record<string, SupportedToken>;
export declare const isSupportedToken: (t: unknown) => t is SupportedToken;
export declare const isLPToken: (t: unknown) => t is LPTokens;
