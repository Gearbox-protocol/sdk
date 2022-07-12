import { TradeAction } from "../pathfinder/tradeTypes";
import { SupportedToken, TokenBase } from "./token";
import { PartialRecord } from "../utils/types";
import { BigNumber } from "ethers";
import { TokenType } from "./tokenType";
export declare type CurveLPToken = "3Crv" | "steCRV" | "FRAX3CRV" | "LUSD3CRV" | "crvPlain3andSUSD" | "gusd3CRV";
export declare type CurveLPTokenData = {
    symbol: CurveLPToken;
    type: TokenType.CURVE_LP;
    swapActions?: Array<TradeAction>;
    lpActions: Array<TradeAction>;
} & TokenBase;
export declare type MetaCurveLPTokenData = {
    symbol: CurveLPToken;
    type: TokenType.META_CURVE_LP;
    lpActions: Array<TradeAction>;
} & TokenBase;
export declare const Curve3CrvUnderlyingTokenIndex: PartialRecord<SupportedToken, BigNumber>;
export declare const curveTokens: Record<CurveLPToken, CurveLPTokenData | MetaCurveLPTokenData>;
