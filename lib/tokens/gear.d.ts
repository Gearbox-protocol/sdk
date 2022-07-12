import { TokenBase } from "./token";
import { TradeAction } from "../pathfinder/tradeTypes";
import { TokenType } from "./tokenType";
export declare type DieselTokenTypes = "dDAI" | "dUSDC" | "dWBTC" | "dWETH";
export declare type GearboxToken = "GEAR";
export declare type DieselTokenData = {
    symbol: DieselTokenTypes;
    type: TokenType.DIESEL_LP_TOKEN;
} & TokenBase;
export declare type GearboxTokenData = {
    symbol: GearboxToken;
    swapActions?: Array<TradeAction>;
    type: TokenType.NORMAL_TOKEN;
} & TokenBase;
export declare const gearTokens: Record<DieselTokenTypes | GearboxToken, DieselTokenData | GearboxTokenData>;
