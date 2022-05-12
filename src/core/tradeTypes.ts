import {
  ConvexPoolContract,
  CurvePoolContract,
  SupportedContract,
  UniswapV2Contract,
  YearnVaultContract
} from "./contracts";
import {
  NormalToken,
  CurveLPToken,
  YearnLPToken,
  ConvexLPToken,
  ConvexStakedPhantomToken
} from "./token";

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
  ConvexDeposit,
  ConvexStake,
  ConvexDepositAndStake
}

export type TradeAction =
  | {
      type: TradeType.UniswapV2Swap;
      contract: UniswapV2Contract;
    }
  | {
      type: TradeType.UniswapV3Swap;
      contract: "UNISWAP_V3_ROUTER";
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
      type: TradeType.ConvexDeposit;
      contract: ConvexPoolContract;
      tokenOut: ConvexLPToken;
    }
  | {
      type: TradeType.ConvexStake;
      contract: ConvexPoolContract;
      tokenOut: ConvexStakedPhantomToken;
    }
  | {
      type: TradeType.ConvexDepositAndStake;
      contract: ConvexPoolContract;
      tokenOut: ConvexStakedPhantomToken;
    };
