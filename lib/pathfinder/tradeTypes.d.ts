import type { ConvexPoolContract, CurvePoolContract, UniswapV2Contract, YearnVaultContract } from "../contracts/contracts";
import type { NormalToken } from "../tokens/normal";
import type { CurveLPToken } from "../tokens/curveLP";
import type { YearnLPToken } from "../tokens/yearn";
import type { ConvexLPToken, ConvexStakedPhantomToken } from "../tokens/convex";
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
    ConvexDepositLP = 9,
    ConvexStake = 10,
    ConvexDepositLPAndStake = 11,
    ConvexWithdrawLP = 12,
    ConvexWithdraw = 13,
    ConvexWithdrawAndUnwrap = 14
}
export declare type TradeAction = {
    type: TradeType.UniswapV2Swap;
    contract: UniswapV2Contract;
    tokenOut?: NormalToken;
} | {
    type: TradeType.UniswapV3Swap;
    contract: "UNISWAP_V3_ROUTER";
    tokenOut?: NormalToken;
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
    type: TradeType.ConvexDepositLP;
    contract: "CONVEX_BOOSTER";
    tokenOut: ConvexLPToken;
} | {
    type: TradeType.ConvexStake;
    contract: ConvexPoolContract;
    tokenOut: ConvexStakedPhantomToken;
} | {
    type: TradeType.ConvexDepositLPAndStake;
    contract: "CONVEX_BOOSTER";
    tokenOut: ConvexStakedPhantomToken;
} | {
    type: TradeType.ConvexWithdrawLP;
    contract: "CONVEX_BOOSTER";
    tokenOut: CurveLPToken;
} | {
    type: TradeType.ConvexWithdraw;
    contract: ConvexPoolContract;
    tokenOut: ConvexLPToken;
} | {
    type: TradeType.ConvexWithdrawAndUnwrap;
    contract: ConvexPoolContract;
    tokenOut: CurveLPToken;
};
export declare enum SwapType {
    ExactInput = 1,
    ExactOutput = 2
}
