import {TradeAction, TradeType} from "../core/tradeTypes";
import {TokenBase, TokenType} from "./token";
import {CurveLPToken} from "./curveLP";
import {NormalToken} from "./normal";

export type YearnLPToken =
    | "yvDAI"
    | "yvUSDC"
    | "yvWETH"
    | "yvWBTC"
    | "yvCurve_stETH"
    | "yvCURVE_FRAX_POOL";

export type YearnVaultTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT;
    underlying: NormalToken;
    lpActions: Array<TradeAction>;
} & TokenBase;

export type YearnVaultOfCurveLPTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} & TokenBase;

export type YearnVaultOfMetaCurveLPTokenData = {
    symbol: YearnLPToken;
    type: TokenType.YEARN_VAULT_OF_META_CURVE_LP;
    underlying: CurveLPToken;
    lpActions: Array<TradeAction>;
} & TokenBase;

export const yearnTokens: Record<YearnLPToken,
    | YearnVaultTokenData
    | YearnVaultOfCurveLPTokenData
    | YearnVaultOfMetaCurveLPTokenData> = {
    // YEARN TOKENS
    yvDAI: {
        name: "yvDAI",
        decimals: 18,

        symbol: "yvDAI",
        type: TokenType.YEARN_VAULT,
        underlying: "DAI",
        lpActions: [
            {
                type: TradeType.YearnWithdraw,
                contract: "YEARN_DAI_VAULT",
                tokenOut: "DAI"
            }
        ]
    },

    yvUSDC: {
        name: "yvUSDC",
        decimals: 6,

        symbol: "yvUSDC",
        type: TokenType.YEARN_VAULT,
        underlying: "USDC",
        lpActions: [
            {
                type: TradeType.YearnWithdraw,
                contract: "YEARN_USDC_VAULT",
                tokenOut: "USDC"
            }
        ]
    },

    yvWETH: {
        name: "yvWETH",
        decimals: 18,

        symbol: "yvWETH",
        type: TokenType.YEARN_VAULT,
        underlying: "WETH",
        lpActions: [
            {
                type: TradeType.YearnWithdraw,
                contract: "YEARN_WETH_VAULT",
                tokenOut: "WETH"
            }
        ]
    },

    yvWBTC: {
        name: "yvWBTC",
        decimals: 8,

        symbol: "yvWBTC",
        type: TokenType.YEARN_VAULT,
        underlying: "WBTC",
        lpActions: [
            {
                type: TradeType.YearnWithdraw,
                contract: "YEARN_WBTC_VAULT",
                tokenOut: "WBTC"
            }
        ]
    },

    // YEARN- CURVE TOKENS
    yvCurve_stETH: {
        name: "yvCurve-stETH",
        decimals: 18,

        symbol: "yvCurve_stETH",
        type: TokenType.YEARN_VAULT_OF_CURVE_LP,
        underlying: "steCRV",
        lpActions: [
            {
                type: TradeType.YearnWithdraw,
                contract: "YEARN_CURVE_STETH_VAULT",
                tokenOut: "steCRV"
            }
        ]
    },

    yvCURVE_FRAX_POOL: {
        name: "yvCurve-FRAX",
        decimals: 18,

        symbol: "yvCURVE_FRAX_POOL",
        type: TokenType.YEARN_VAULT_OF_META_CURVE_LP,
        underlying: "FRAX3CRV",
        lpActions: [
            {
                type: TradeType.YearnWithdraw,
                contract: "YEARN_CURVE_FRAX_VAULT",
                tokenOut: "FRAX3CRV"
            }
        ]
    }
};
