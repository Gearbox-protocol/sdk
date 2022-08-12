import type { YearnVaultContract } from "../contracts/contracts";
import { TradeAction, TradeType } from "../pathfinder/tradeTypes";
import type { TokenBase } from "./token";
import type { CurveLPToken } from "./curveLP";
import { NormalToken } from "./normal";
import { TokenType } from "./tokenType";

export type YearnLPToken =
  | "yvDAI"
  | "yvUSDC"
  | "yvWETH"
  | "yvWBTC"
  | "yvCurve_stETH"
  | "yvCurve_FRAX";

export type YearnVaultTokenData = {
  symbol: YearnLPToken;
  type: TokenType.YEARN_VAULT;
  underlying: NormalToken;
  lpActions: Array<TradeAction>;
  vault: YearnVaultContract;
} & TokenBase;

export type YearnVaultOfCurveLPTokenData = {
  symbol: YearnLPToken;
  type: TokenType.YEARN_VAULT_OF_CURVE_LP;
  underlying: CurveLPToken;
  lpActions: Array<TradeAction>;
  vault: YearnVaultContract;
} & TokenBase;

export type YearnVaultOfMetaCurveLPTokenData = {
  symbol: YearnLPToken;
  type: TokenType.YEARN_VAULT_OF_META_CURVE_LP;
  underlying: CurveLPToken;
  lpActions: Array<TradeAction>;
  vault: YearnVaultContract;
} & TokenBase;

export const yearnTokens: Record<
  YearnLPToken,
  | YearnVaultTokenData
  | YearnVaultOfCurveLPTokenData
  | YearnVaultOfMetaCurveLPTokenData
> = {
  // YEARN TOKENS
  yvDAI: {
    name: "Yearn yvDAI",
    decimals: 18,
    symbol: "yvDAI",
    type: TokenType.YEARN_VAULT,
    underlying: "DAI",
    vault: "YEARN_DAI_VAULT",
    lpActions: [
      {
        type: TradeType.YearnWithdraw,
        contract: "YEARN_DAI_VAULT",
        tokenOut: "DAI"
      }
    ]
  },

  yvUSDC: {
    name: "Yearn yvUSDC",
    decimals: 6,
    symbol: "yvUSDC",
    type: TokenType.YEARN_VAULT,
    underlying: "USDC",
    vault: "YEARN_USDC_VAULT",
    lpActions: [
      {
        type: TradeType.YearnWithdraw,
        contract: "YEARN_USDC_VAULT",
        tokenOut: "USDC"
      }
    ]
  },

  yvWETH: {
    name: "Yearn yvWETH",
    decimals: 18,
    symbol: "yvWETH",
    type: TokenType.YEARN_VAULT,
    underlying: "WETH",
    vault: "YEARN_WETH_VAULT",
    lpActions: [
      {
        type: TradeType.YearnWithdraw,
        contract: "YEARN_WETH_VAULT",
        tokenOut: "WETH"
      }
    ]
  },

  yvWBTC: {
    name: "Yearn yvWBTC",
    decimals: 8,
    symbol: "yvWBTC",
    type: TokenType.YEARN_VAULT,
    underlying: "WBTC",
    vault: "YEARN_WBTC_VAULT",
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
    name: "Yearn yvCurve-stETH",
    decimals: 18,
    symbol: "yvCurve_stETH",
    type: TokenType.YEARN_VAULT_OF_CURVE_LP,
    underlying: "steCRV",
    vault: "YEARN_CURVE_STETH_VAULT",
    lpActions: [
      {
        type: TradeType.YearnWithdraw,
        contract: "YEARN_CURVE_STETH_VAULT",
        tokenOut: "steCRV"
      }
    ]
  },

  yvCurve_FRAX: {
    name: "Yearn yvCurve-FRAX",
    decimals: 18,
    symbol: "yvCurve_FRAX",
    type: TokenType.YEARN_VAULT_OF_META_CURVE_LP,
    underlying: "FRAX3CRV",
    vault: "YEARN_CURVE_FRAX_VAULT",
    lpActions: [
      {
        type: TradeType.YearnWithdraw,
        contract: "YEARN_CURVE_FRAX_VAULT",
        tokenOut: "FRAX3CRV"
      }
    ]
  }
};

export const isYearnLPToken = (t: unknown): t is YearnLPToken =>
  typeof t === "string" && !!yearnTokens[t as YearnLPToken];
