import {TokenBase} from "./token";
import {TradeAction} from "../pathfinder/tradeTypes";
import {TokenType} from "./tokenType";

export type DieselTokenTypes = "dDAI" | "dUSDC" | "dWBTC" | "dWETH";
export type GearboxToken = "GEAR";

export type DieselTokenData = {
    symbol: DieselTokenTypes;
    type: TokenType.DIESEL_LP_TOKEN;
} & TokenBase;

export type GearboxTokenData = {
    symbol: GearboxToken;
    swapActions?: Array<TradeAction>;
    type: TokenType.NORMAL_TOKEN;
} & TokenBase;

export const gearTokens: Record<DieselTokenTypes | GearboxToken,
    DieselTokenData | GearboxTokenData> = {
    //GEARBOX
    dDAI: {
        name: "dDAI",
        decimals: 18,
        symbol: "dDAI",
        type: TokenType.DIESEL_LP_TOKEN
    },

    dUSDC: {
        name: "dUSDC",
        decimals: 6,
        symbol: "dUSDC",
        type: TokenType.DIESEL_LP_TOKEN
    },

    dWBTC: {
        name: "dWBTC",
        decimals: 8,
        symbol: "dWBTC",
        type: TokenType.DIESEL_LP_TOKEN
    },

    dWETH: {
        name: "dWETH",
        decimals: 18,
        symbol: "dWETH",
        type: TokenType.DIESEL_LP_TOKEN
    },

    GEAR: {
        name: "GEAR",
        decimals: 18,
        symbol: "GEAR",
        type: TokenType.NORMAL_TOKEN
    }
};
