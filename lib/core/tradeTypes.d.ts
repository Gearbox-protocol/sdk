import { ConvexPoolContract, CurvePoolContract, UniswapV2Contract, YearnVaultContract } from "./contracts";
import { NormalToken, CurveLPToken, YearnLPToken, ConvexLPToken, ConvexStakedPhantomToken } from "./token";
export declare enum TradeType {
    UniswapV2Swap = 0,
    UniswapV3Swap = 1,
    CurveExchange = 2,
    CurveExchangeUnderlying = 3,
    CurveDepositLP = 4,
    CurveWithdrawLP = 5,
    YearnDeposit = 6,
    YearnWithdraw = 7,
    LidoStake = 8,
    ConvexDeposit = 9,
    ConvexStake = 10,
    ConvexDepositAndStake = 11
}
export declare type TradeAction = {
    type: TradeType.UniswapV2Swap;
    contract: UniswapV2Contract;
} | {
    type: TradeType.UniswapV3Swap;
    contract: "UNISWAP_V3_ROUTER";
} | {
    type: TradeType.CurveExchange;
    contract: CurvePoolContract;
    tokenOut: Array<NormalToken | CurveLPToken>;
} | {
    type: TradeType.CurveDepositLP;
    contract: CurvePoolContract;
    tokenOut: CurveLPToken;
} | {
    type: TradeType.CurveWithdrawLP;
    contract: CurvePoolContract;
    tokenOut: Array<CurveLPToken | NormalToken>;
} | {
    type: TradeType.YearnDeposit;
    contract: YearnVaultContract;
    tokenOut: YearnLPToken;
} | {
    type: TradeType.YearnWithdraw;
    contract: YearnVaultContract;
    tokenOut: NormalToken | CurveLPToken;
} | {
    type: TradeType.LidoStake;
    contract: "LIDO_STETH_GATEWAY";
    tokenOut: NormalToken;
} | {
    type: TradeType.ConvexDeposit;
    contract: ConvexPoolContract;
    tokenOut: ConvexLPToken;
} | {
    type: TradeType.ConvexStake;
    contract: ConvexPoolContract;
    tokenOut: ConvexStakedPhantomToken;
} | {
    type: TradeType.ConvexDepositAndStake;
    contract: ConvexPoolContract;
    tokenOut: ConvexStakedPhantomToken;
};
