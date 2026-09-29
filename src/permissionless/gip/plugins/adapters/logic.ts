import type { Abi, Address, Chain, PublicClient, Transport } from "viem";
import type { AbstractAdapterContract } from "../../../../onchain/index.js";
import type { MarketState } from "../../core/market-state/types.js";
import type { DeployParams, MarketStateChanges } from "../../core/market-tx.js";
import type { Plugin } from "../logic.js";
import {
  type AbstractAdapterDeployParams,
  type AbstractAdapterState,
  getAbstractAdapterPlugin,
} from "./abstract-adapter/index.js";
import {
  type BalancerV3AdapterDeployParams,
  type BalancerV3AdapterState,
  type BalancerV3MarketActions,
  balancerV3Plugin,
} from "./balancer-v3/index.js";
import {
  type CamelotV3AdapterDeployParams,
  type CamelotV3AdapterState,
  type CamelotV3MarketActions,
  camelotV3Plugin,
} from "./camelot-v3/index.js";
import {
  type ConvexV1BaseRewardPoolAdapterDeployParams,
  type ConvexV1BaseRewardPoolAdapterState,
  convexV1BaseRewardPoolPlugin,
} from "./convex-v1-base-reward-pool/index.js";
import {
  type ConvexV1BoosterAdapterDeployParams,
  type ConvexV1BoosterAdapterState,
  type ConvexV1BoosterMarketActions,
  convexV1BoosterPlugin,
} from "./convex-v1-booster/index.js";
import {
  type CurveV1AdapterDeployParams,
  type CurveV1AdapterState,
  getCurveV1Plugin,
} from "./curve-v1/index.js";
import {
  type CurveV1StETHAdapterDeployParams,
  type CurveV1StETHAdapterState,
  curveV1StETHPlugin,
} from "./curve-v1-steth/index.js";
import {
  type DaiUsdsAdapterDeployParams,
  type DaiUsdsAdapterState,
  daiUsdsAdapterPlugin,
} from "./dai-usds/index.js";
import {
  type Erc4626AdapterDeployParams,
  type Erc4626AdapterState,
  erc4626AdapterPlugin,
} from "./erc4626/index.js";
import {
  type Erc4626ReferralAdapterDeployParams,
  type Erc4626ReferralAdapterState,
  erc4626ReferralAdapterPlugin,
} from "./erc4626-referral/index.js";
import type { InfinifiAdapterState } from "./infinifi/index.js";
import {
  type InfinifiGatewayAdapterDeployParams,
  type InfinifiGatewayMarketActions,
  infinifiGatewayPlugin,
} from "./infinifi/infinifi-gateway/index.js";
import {
  type InfinifiUnwindingAdapterDeployParams,
  type InfinifiUnwindingMarketActions,
  infinifiUnwindingPlugin,
} from "./infinifi/infinifi-unwinding/index.js";
import {
  type KelpLRTDepositPoolAdapterDeployParams,
  type KelpLRTDepositPoolAdapterState,
  type KelpLRTDepositPoolMarketActions,
  kelpLRTDepositPoolPlugin,
} from "./kelp-lrt-deposit-pool/index.js";
import {
  type KelpLRTWithdrawalManagerAdapterDeployParams,
  type KelpLRTWithdrawalManagerAdapterState,
  type KelpLRTWithdrawalManagerMarketActions,
  kelpLRTWithdrawalManagerPlugin,
} from "./kelp-lrt-withdrawal-manager/index.js";
import {
  type MellowClaimerAdapterDeployParams,
  type MellowClaimerAdapterState,
  type MellowClaimerMarketActions,
  mellowClaimerAdapterPlugin,
} from "./mellow-claimer/index.js";
import {
  type MellowErc4626AdapterDeployParams,
  type MellowErc4626AdapterState,
  mellowErc4626AdapterPlugin,
} from "./mellow-erc4626/index.js";
import {
  type MellowWrapperAdapterDeployParams,
  type MellowWrapperAdapterState,
  type MellowWrapperMarketActions,
  mellowWrapperAdapterPlugin,
} from "./mellow-wrapper/index.js";
import {
  type MidasGatewayAdapterDeployParams,
  type MidasGatewayAdapterState,
  midasGatewayAdapterPlugin,
} from "./midas-gateway/index.js";
import {
  type MidasIssuanceAdapterDeployParams,
  type MidasIssuanceAdapterState,
  type MidasIssuanceMarketActions,
  midasIssuanceAdapterPlugin,
} from "./midas-issuance/index.js";
import {
  type MidasRedemptionAdapterDeployParams,
  type MidasRedemptionAdapterState,
  type MidasRedemptionMarketActions,
  midasRedemptionAdapterPlugin,
} from "./midas-redemption/index.js";
import {
  type PendleAdapterDeployParams,
  type PendleAdapterState,
  type PendleMarketActions,
  pendlePlugin,
} from "./pendle/index.js";
import {
  type SecuritizeRedemptionAdapterDeployParams,
  type SecuritizeRedemptionAdapterState,
  securitizeRedemptionAdapterPlugin,
} from "./securitize-redemption/index.js";
import {
  type StakingRewardsAdapterDeployParams,
  type StakingRewardsAdapterState,
  stakingRewardsPlugin,
} from "./staking-rewards/index.js";
import {
  type TraderJoeAdapterDeployParams,
  type TraderJoeAdapterState,
  type TraderJoeMarketActions,
  traderJoePlugin,
} from "./traderjoe/index.js";
import {
  type UniswapV2AdapterDeployParams,
  type UniswapV2AdapterState,
  type UniswapV2MarketActions,
  uniswapV2Plugin,
} from "./uniswap-v2/index.js";
import {
  type UniswapV3AdapterDeployParams,
  type UniswapV3AdapterState,
  type UniswapV3MarketActions,
  uniswapV3Plugin,
} from "./uniswap-v3/index.js";
import {
  type UniswapV4AdapterDeployParams,
  type UniswapV4AdapterState,
  type UniswapV4MarketActions,
  uniswapV4Plugin,
} from "./uniswap-v4/index.js";
import {
  type UpshiftAdapterDeployParams,
  type UpshiftAdapterState,
  upshiftPlugin,
} from "./upshift/index.js";
import {
  type VelodromeV2AdapterDeployParams,
  type VelodromeV2AdapterState,
  type VelodromeV2MarketActions,
  velodromeV2Plugin,
} from "./velodrome-v2/index.js";

export type AdapterState =
  | AbstractAdapterState
  | BalancerV3AdapterState
  | CamelotV3AdapterState
  | ConvexV1BaseRewardPoolAdapterState
  | ConvexV1BoosterAdapterState
  | CurveV1AdapterState
  | CurveV1StETHAdapterState
  | DaiUsdsAdapterState
  | Erc4626AdapterState
  | Erc4626ReferralAdapterState
  | InfinifiAdapterState
  | KelpLRTDepositPoolAdapterState
  | KelpLRTWithdrawalManagerAdapterState
  | MellowClaimerAdapterState
  | MellowErc4626AdapterState
  | MellowWrapperAdapterState
  | MidasGatewayAdapterState
  | MidasIssuanceAdapterState
  | MidasRedemptionAdapterState
  | PendleAdapterState
  | SecuritizeRedemptionAdapterState
  | StakingRewardsAdapterState
  | TraderJoeAdapterState
  | UniswapV2AdapterState
  | UniswapV3AdapterState
  | UniswapV4AdapterState
  | UpshiftAdapterState
  | VelodromeV2AdapterState;

export type AdapterDeployParams =
  | AbstractAdapterDeployParams
  | BalancerV3AdapterDeployParams
  | CamelotV3AdapterDeployParams
  | ConvexV1BaseRewardPoolAdapterDeployParams
  | ConvexV1BoosterAdapterDeployParams
  | CurveV1AdapterDeployParams
  | CurveV1StETHAdapterDeployParams
  | DaiUsdsAdapterDeployParams
  | Erc4626AdapterDeployParams
  | Erc4626ReferralAdapterDeployParams
  | InfinifiGatewayAdapterDeployParams
  | InfinifiUnwindingAdapterDeployParams
  | KelpLRTDepositPoolAdapterDeployParams
  | KelpLRTWithdrawalManagerAdapterDeployParams
  | MellowClaimerAdapterDeployParams
  | MellowErc4626AdapterDeployParams
  | MellowWrapperAdapterDeployParams
  | MidasGatewayAdapterDeployParams
  | MidasIssuanceAdapterDeployParams
  | MidasRedemptionAdapterDeployParams
  | PendleAdapterDeployParams
  | SecuritizeRedemptionAdapterDeployParams
  | StakingRewardsAdapterDeployParams
  | TraderJoeAdapterDeployParams
  | UniswapV2AdapterDeployParams
  | UniswapV3AdapterDeployParams
  | UniswapV4AdapterDeployParams
  | UpshiftAdapterDeployParams
  | VelodromeV2AdapterDeployParams;

export type AdapterType = AdapterDeployParams["type"];

export type BaseAdapterState = {
  type: AdapterType;
  version: number;
  target: Address;
  adapter: Address;
  isForbidden: boolean;
};

export interface ValidateAdapterParamsArgs<DeployParams> {
  client: PublicClient<Transport, Chain>;
  instance: { assets: Array<{ address: Address; symbol: string }> };
  marketChanges: MarketStateChanges;
  creditManager: Address;
  params: DeployParams;
  marketConfigurator: Address;
}

// type GetStateFromSDKFunction<
//   T extends Abi,
//   A extends AbstractAdapterContract<T>
// > = (sdkAdapter: A) => AdapterState;

export interface AdapterPlugin
  extends Plugin<AdapterDeployParams, AdapterState, object> {
  isEditable: boolean;
  deprecated?: boolean;
  getDeployParams(args: {
    creditManager: Address;
    params: AdapterDeployParams;
  }): DeployParams;
  validateParams?(
    args: ValidateAdapterParamsArgs<AdapterDeployParams>,
  ): Promise<false | string>;

  getStateFromSDK(adapter: AbstractAdapterContract<Abi, Abi>): AdapterState;
}

export const adapterPlugins: Record<AdapterType, AdapterPlugin> = {
  UNISWAP_V2_ROUTER: uniswapV2Plugin,
  UNISWAP_V3_ROUTER: uniswapV3Plugin,
  UNISWAP_V4_GATEWAY: uniswapV4Plugin,

  BALANCER_V3_ROUTER: balancerV3Plugin,
  BALANCER_V3_WRAPPER: getAbstractAdapterPlugin("BALANCER_V3_WRAPPER"),

  CURVE_V1_2ASSETS: getCurveV1Plugin("CURVE_V1_2ASSETS"),
  CURVE_V1_3ASSETS: getCurveV1Plugin("CURVE_V1_3ASSETS"),
  CURVE_V1_4ASSETS: getCurveV1Plugin("CURVE_V1_4ASSETS"),
  CURVE_STABLE_NG: getCurveV1Plugin("CURVE_STABLE_NG"),
  CURVE_V1_STECRV_POOL: curveV1StETHPlugin,

  ERC4626_VAULT: erc4626AdapterPlugin,
  ERC4626_VAULT_REFERRAL: erc4626ReferralAdapterPlugin,

  PENDLE_ROUTER: pendlePlugin,

  MIDAS_GATEWAY: midasGatewayAdapterPlugin,
  SECURITIZE_REDEMPTION: securitizeRedemptionAdapterPlugin,

  SECURITIZE_ONRAMP: getAbstractAdapterPlugin("SECURITIZE_ONRAMP"),

  ACCOUNT_MIGRATOR: getAbstractAdapterPlugin("ACCOUNT_MIGRATOR"),

  MELLOW_ERC4626_VAULT: mellowErc4626AdapterPlugin,
  MELLOW_DVV: getAbstractAdapterPlugin("MELLOW_DVV"),
  MELLOW_WRAPPER: mellowWrapperAdapterPlugin,
  MELLOW_CLAIMER: mellowClaimerAdapterPlugin,

  INFINIFI_GATEWAY: infinifiGatewayPlugin,
  INFINIFI_UNWINDING: infinifiUnwindingPlugin,

  KELP_DEPOSIT_POOL: kelpLRTDepositPoolPlugin,
  KELP_WITHDRAWAL: kelpLRTWithdrawalManagerPlugin,

  MIDAS_ISSUANCE_VAULT: midasIssuanceAdapterPlugin,
  MIDAS_REDEMPTION_VAULT: midasRedemptionAdapterPlugin,

  CVX_V1_BASE_REWARD_POOL: convexV1BaseRewardPoolPlugin,
  CVX_V1_BOOSTER: convexV1BoosterPlugin,

  FLUID_DEX: getAbstractAdapterPlugin("FLUID_DEX"),

  VELODROME_V2_ROUTER: velodromeV2Plugin,
  CAMELOT_V3_ROUTER: camelotV3Plugin,
  TRADERJOE_ROUTER: traderJoePlugin,
  UPSHIFT_VAULT: upshiftPlugin,

  DAI_USDS_EXCHANGE: daiUsdsAdapterPlugin,
  STAKING_REWARDS: stakingRewardsPlugin,

  LIDO_V1: getAbstractAdapterPlugin("LIDO_V1"),
  LIDO_WSTETH_V1: getAbstractAdapterPlugin("LIDO_WSTETH_V1"),
} as const;

export type AdapterMarketActions =
  | BalancerV3MarketActions
  | CamelotV3MarketActions
  | ConvexV1BoosterMarketActions
  | InfinifiGatewayMarketActions
  | InfinifiUnwindingMarketActions
  | KelpLRTDepositPoolMarketActions
  | KelpLRTWithdrawalManagerMarketActions
  | MellowClaimerMarketActions
  | MellowWrapperMarketActions
  | MidasIssuanceMarketActions
  | MidasRedemptionMarketActions
  | PendleMarketActions
  | TraderJoeMarketActions
  | UniswapV2MarketActions
  | UniswapV3MarketActions
  | UniswapV4MarketActions
  | VelodromeV2MarketActions;

export function updateAdapterState<T extends BaseAdapterState>(args: {
  state: MarketState;
  creditManager: Address;
  target: Address;
  update: (state: T) => T;
}): MarketState {
  const { state, creditManager, target, update } = args;
  const cmAddress = creditManager.toLowerCase() as Address;
  const targetAddress = target.toLowerCase() as Address;

  if (!state.creditManagers[cmAddress]) {
    throw new Error(`Credit manager ${creditManager} not found`);
  }

  const cm = state.creditManagers[cmAddress];
  const adapterState = cm.adapters[targetAddress] as unknown as T;

  if (!adapterState) {
    throw new Error(
      `AdapterState ${target} not found for credit manager ${creditManager}`,
    );
  }

  return {
    ...state,
    creditManagers: {
      ...state.creditManagers,
      [cmAddress]: {
        ...cm,
        adapters: {
          ...cm.adapters,
          [targetAddress]: update(adapterState as T),
        },
      },
    },
  };
}
