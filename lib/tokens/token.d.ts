import { NetworkType } from "../core/constants";
import { NormalToken, NormalTokenData } from "./normal";
import { CurveLPToken, CurveLPTokenData, MetaCurveLPTokenData } from "./curveLP";
import { YearnLPToken, YearnVaultOfCurveLPTokenData, YearnVaultOfMetaCurveLPTokenData, YearnVaultTokenData } from "./yearn";
import { ConvexLPToken, ConvexLPTokenData, ConvexPhantomTokenData, ConvexStakedPhantomToken } from "./convex";
import { DieselTokenData, DieselTokenTypes, GearboxToken, GearboxTokenData } from "./gear";
export declare enum TokenType {
    CONNECTOR = 0,
    NORMAL_TOKEN = 1,
    CURVE_LP = 2,
    META_CURVE_LP = 3,
    YEARN_VAULT = 4,
    YEARN_VAULT_OF_CURVE_LP = 5,
    YEARN_VAULT_OF_META_CURVE_LP = 6,
    CONVEX_LP_TOKEN = 7,
    CONVEX_STAKED_PHANTOM_TOKEN = 8,
    DIESEL_LP_TOKEN = 9
}
export declare type SupportedToken = NormalToken | YearnLPToken | CurveLPToken | ConvexLPToken | ConvexStakedPhantomToken | DieselTokenTypes | GearboxToken;
export interface TokenBase {
    name: string;
    symbol: string;
    decimals: number;
}
export declare type TokenDataI = NormalTokenData | CurveLPTokenData | MetaCurveLPTokenData | YearnVaultTokenData | YearnVaultOfCurveLPTokenData | YearnVaultOfMetaCurveLPTokenData | ConvexLPTokenData | ConvexPhantomTokenData | DieselTokenData | GearboxTokenData;
export declare const supportedTokens: Record<SupportedToken, TokenDataI>;
export declare const tokenDataByNetwork: Record<NetworkType, Record<SupportedToken, string>>;
export declare const tokenDataByAddress: Record<string, SupportedToken>;
