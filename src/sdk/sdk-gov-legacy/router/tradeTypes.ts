import type {
  AuraPoolContract,
  CompoundV2PoolContract,
  ConvexPoolContract,
  CurvePoolContract,
  ERC4626VaultContract,
  UniswapV2Contract,
  YearnVaultContract,
} from "../contracts";
import type {
  AaveV2LPToken,
  AuraStakedToken,
  BalancerLPToken,
  CompoundV2LPToken,
  ConvexLPToken,
  ConvexStakedPhantomToken,
  CurveLPToken,
  ERC4626LPToken,
  NormalToken,
  YearnLPToken,
} from "../tokens";

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
  ConvexWithdrawAndUnwrap,
  BalancerJoin,
  BalancerExit,
  AaveV2Deposit,
  AaveV2Withdraw,
  AaveV2Unwrap,
  CompoundV2Deposit,
  CompoundV2Withdraw,
  ERC4626Deposit,
  ERC4626Withdraw,
  AuraDepositLP,
  AuraStake,
  AuraDepositLPAndStake,
  AuraWithdrawLP,
  AuraWithdraw,
  AuraWithdrawAndUnwrap,
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
    }
  | {
      type: TradeType.BalancerJoin;
      contract: "BALANCER_VAULT";
      tokenOut: BalancerLPToken;
    }
  | {
      type: TradeType.BalancerExit;
      contract: "BALANCER_VAULT";
      tokenOut: Array<NormalToken | BalancerLPToken>;
    }
  | {
      type: TradeType.AuraStake;
      contract: AuraPoolContract;
      tokenOut: AuraStakedToken;
    }
  | {
      type: TradeType.AuraDepositLPAndStake;
      contract: "AURA_BOOSTER";
      tokenOut: AuraStakedToken;
    }
  | {
      type: TradeType.AuraWithdrawLP;
      contract: "AURA_BOOSTER";
      tokenOut: BalancerLPToken;
    }
  | {
      type: TradeType.AaveV2Deposit;
      contract: "AAVE_V2_LENDING_POOL";
      tokenOut: AaveV2LPToken;
    }
  | {
      type: TradeType.AaveV2Withdraw;
      contract: "AAVE_V2_LENDING_POOL";
      tokenOut: NormalToken;
    }
  | {
      type: TradeType.CompoundV2Deposit;
      contract: CompoundV2PoolContract;
      tokenOut: CompoundV2LPToken;
    }
  | {
      type: TradeType.CompoundV2Withdraw;
      contract: CompoundV2PoolContract;
      tokenOut: NormalToken;
    }
  | {
      type: TradeType.ERC4626Deposit;
      contract: ERC4626VaultContract;
      tokenOut: ERC4626LPToken;
    }
  | {
      type: TradeType.ERC4626Withdraw;
      contract: ERC4626VaultContract;
      tokenOut: NormalToken | CurveLPToken;
    };
