import type { YearnVaultContract } from "../contracts/contracts";
import { TradeAction } from "../pathfinder/tradeTypes";
import type { TokenBase } from "./token";
import type { CurveLPToken } from "./curveLP";
import { NormalToken } from "./normal";
import { TokenType } from "./tokenType";
export declare type YearnLPToken = "yvDAI" | "yvUSDC" | "yvWETH" | "yvWBTC" | "yvCurve_stETH" | "yvCurve_FRAX";
export declare type YearnVaultTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT;
    underlying: NormalToken;
    lpActions: Array<TradeAction>;
    vault: YearnVaultContract;
} & TokenBase;
export declare type YearnVaultOfCurveLPTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
    vault: YearnVaultContract;
} & TokenBase;
export declare type YearnVaultOfMetaCurveLPTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_META_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
    vault: YearnVaultContract;
} & TokenBase;
export declare const yearnTokens: Record<YearnLPToken, YearnVaultTokenData | YearnVaultOfCurveLPTokenData | YearnVaultOfMetaCurveLPTokenData>;
export declare const isYearnLPToken: (t: unknown) => t is YearnLPToken;
