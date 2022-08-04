import { TradeAction } from "../pathfinder/tradeTypes";
import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";
export declare type NormalToken = "1INCH" | "AAVE" | "COMP" | "CRV" | "DPI" | "FEI" | "LINK" | "SNX" | "SUSHI" | "UNI" | "USDT" | "USDC" | "DAI" | "WETH" | "WBTC" | "YFI" | "STETH" | "FTM" | "CVX" | "FRAX" | "FXS" | "LDO" | "SPELL" | "LUSD" | "sUSD" | "GUSD" | "LUNA" | "LQTY";
export declare type NormalTokenData = {
    symbol: NormalToken;
    type: TokenType.CONNECTOR | TokenType.NORMAL_TOKEN;
    swapActions: Array<TradeAction>;
    lpActions?: Array<TradeAction>;
} & TokenBase;
export declare const normalTokens: Record<NormalToken, NormalTokenData>;
export declare const isNormalToken: (t: unknown) => t is NormalToken;
