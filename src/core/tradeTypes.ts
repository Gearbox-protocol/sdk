import {
    ConvexPoolContract,
    CurvePoolContract,
    UniswapV2Contract,
    YearnVaultContract
} from "./contracts";
import {NormalToken} from "../tokens/normal";
import {CurveLPToken} from "../tokens/curveLP";
import {YearnLPToken} from "../tokens/yearn";
import {ConvexLPToken, ConvexStakedPhantomToken} from "../tokens/convex";


export enum TradeType {
    UniswapV2Swap,
    UniswapV3Swap,
    CurveExchange,
    CurveExchangeUnderlying,
    CurveDepositLP,
    CurveWithdrawLP,
    YearnDeposit,
    YearnWithdraw,
    LidoStake,
    ConvexDepositLP,
    ConvexStake,
    ConvexDepositLPAndStake,
    ConvexWithdrawLP,
    ConvexWithdraw,
    ConvexWithdrawAndUnwrap
}

export type TradeAction =
    | {
    type: TradeType.UniswapV2Swap;
    contract: UniswapV2Contract;
    tokenOut?: NormalToken;
}
    | {
    type: TradeType.UniswapV3Swap;
    contract: "UNISWAP_V3_ROUTER";
    tokenOut?: NormalToken;
}
    | {
    type: TradeType.CurveExchange;
    contract: CurvePoolContract;
    tokenOut: Array<NormalToken | CurveLPToken>;
}
    | {
    type: TradeType.CurveDepositLP;
    contract: CurvePoolContract;
    tokenOut: CurveLPToken;
}
    | {
    type: TradeType.CurveWithdrawLP;
    contract: CurvePoolContract;
    tokenOut: Array<CurveLPToken | NormalToken>;
}
    | {
    type: TradeType.YearnDeposit;
    contract: YearnVaultContract;
    tokenOut: YearnLPToken;
}
    | {
    type: TradeType.YearnWithdraw;
    contract: YearnVaultContract;
    tokenOut: NormalToken | CurveLPToken;
}
    | {
    type: TradeType.LidoStake;
    contract: "LIDO_STETH_GATEWAY";
    tokenOut: NormalToken;
}
    | {
    type: TradeType.ConvexDepositLP;
    contract: "CONVEX_BOOSTER";
    tokenOut: ConvexLPToken;
}
    | {
    type: TradeType.ConvexStake;
    contract: ConvexPoolContract;
    tokenOut: ConvexStakedPhantomToken;
}
    | {
    type: TradeType.ConvexDepositLPAndStake;
    contract: "CONVEX_BOOSTER";
    tokenOut: ConvexStakedPhantomToken;
}
    | {
    type: TradeType.ConvexWithdrawLP;
    contract: "CONVEX_BOOSTER";
    tokenOut: CurveLPToken;
}
    | {
    type: TradeType.ConvexWithdraw;
    contract: ConvexPoolContract;
    tokenOut: ConvexLPToken;
}
    | {
    type: TradeType.ConvexWithdrawAndUnwrap;
    contract: ConvexPoolContract;
    tokenOut: CurveLPToken;
};
