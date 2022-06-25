import { TradeAction } from "../core/tradeTypes";
import { TokenBase } from "./token";
import { CurveLPToken } from "./curveLP";
import { NormalToken } from "./normal";
import { TokenType } from "./tokenType";
export declare type YearnLPToken = "yvDAI" | "yvUSDC" | "yvWETH" | "yvWBTC" | "yvCurve_stETH" | "yvCURVE_FRAX_POOL";
export declare type YearnVaultTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT;
    underlying: NormalToken;
    lpActions: Array<TradeAction>;
} & TokenBase;
export declare type YearnVaultOfCurveLPTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} & TokenBase;
export declare type YearnVaultOfMetaCurveLPTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_META_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} & TokenBase;
export declare const yearnTokens: Record<YearnLPToken, YearnVaultTokenData | YearnVaultOfCurveLPTokenData | YearnVaultOfMetaCurveLPTokenData>;
