import type { Hex } from "viem";
import type {
  AdapterData,
  BaseState,
  IBaseContract,
  IGearboxSDKPlugin,
} from "../../sdk/index.js";
import { BasePlugin, bytes32ToString } from "../../sdk/index.js";
import { AccountMigratorAdapterContract } from "./contracts/AccountMigratorAdapterContract.js";
import { InfinifiGatewayAdapterContract } from "./contracts/InfinifiGatewayAdapterContract.js";
import { InfinifiUnwindingGatewayAdapterContract } from "./contracts/InfinifiUnwindingGatewayAdapterContract.js";
import {
  BalancerV2VaultAdapterContract,
  BalancerV3RouterAdapterContract,
  BalancerV3WrapperAdapterContract,
  CamelotV3AdapterContract,
  ConvexV1BaseRewardPoolAdapterContract,
  ConvexV1BoosterAdapterContract,
  Curve2AssetsAdapterContract,
  Curve3AssetsAdapterContract,
  Curve4AssetsAdapterContract,
  CurveV1AdapterDeposit,
  CurveV1AdapterStETHContract,
  CurveV1StableNGAdapterContract,
  DaiUsdsAdapterContract,
  EqualizerRouterAdapterContract,
  ERC4626AdapterContract,
  ERC4626ReferralAdapterContract,
  FluidDexAdapterContract,
  InfraredVaultAdapterContract,
  KelpLRTDepositPoolAdapterContract,
  KelpLRTWithdrawalManagerAdapterContract,
  KodiakIslandGatewayAdapterContract,
  LidoV1AdapterContract,
  MellowClaimerAdapterContract,
  MellowDepositQueueAdapterContract,
  MellowDVVAdapterContract,
  MellowERC4626VaultAdapterContract,
  MellowRedeemQueueAdapterContract,
  MellowVaultAdapterContract,
  MellowWrapperAdapterContract,
  MidasIssuanceVaultAdapterContract,
  MidasRedemptionVaultAdapterContract,
  PendleRouterAdapterContract,
  StakingRewardsAdapterContract,
  TraderJoeRouterAdapterContract,
  UniswapV2AdapterContract,
  UniswapV3AdapterContract,
  UpshiftVaultAdapterContract,
  VelodromeV2RouterAdapterContract,
  WstETHV1AdapterContract,
  YearnV2RouterAdapterContract,
} from "./contracts/index.js";
import { UniswapV4AdapterContract } from "./contracts/UniswapV4AdapterContract.js";
import type { AdapterContractType } from "./types.js";

export class AdaptersPlugin
  extends BasePlugin<{}>
  implements IGearboxSDKPlugin<{}>
{
  public readonly name = "Adapters";
  public readonly version = 1;
  public readonly loaded = true;

  public createContract(data: BaseState): IBaseContract | undefined {
    const args = data as AdapterData;
    const adapterType = bytes32ToString(
      args.baseParams.contractType as Hex,
    ) as AdapterContractType;

    switch (adapterType) {
      case "ADAPTER::ACCOUNT_MIGRATOR":
        return new AccountMigratorAdapterContract(this.sdk, args);
      case "ADAPTER::BALANCER_V3_ROUTER":
        return new BalancerV3RouterAdapterContract(this.sdk, args);
      case "ADAPTER::BALANCER_V3_WRAPPER":
        return new BalancerV3WrapperAdapterContract(this.sdk, args);
      case "ADAPTER::BALANCER_VAULT":
        return new BalancerV2VaultAdapterContract(this.sdk, args);
      case "ADAPTER::CAMELOT_V3_ROUTER":
        return new CamelotV3AdapterContract(this.sdk, args);
      case "ADAPTER::CURVE_STABLE_NG":
        return new CurveV1StableNGAdapterContract(this.sdk, args);
      case "ADAPTER::CURVE_V1_2ASSETS":
        return new Curve2AssetsAdapterContract(this.sdk, args);
      case "ADAPTER::CURVE_V1_3ASSETS":
        return new Curve3AssetsAdapterContract(this.sdk, args);
      case "ADAPTER::CURVE_V1_4ASSETS":
        return new Curve4AssetsAdapterContract(this.sdk, args);
      case "ADAPTER::CURVE_V1_STECRV_POOL":
        return new CurveV1AdapterStETHContract(this.sdk, args);
      case "ADAPTER::CURVE_V1_WRAPPER":
        return new CurveV1AdapterDeposit(this.sdk, args);
      case "ADAPTER::CVX_V1_BASE_REWARD_POOL":
        return new ConvexV1BaseRewardPoolAdapterContract(this.sdk, args);
      case "ADAPTER::CVX_V1_BOOSTER":
        return new ConvexV1BoosterAdapterContract(this.sdk, args);
      case "ADAPTER::DAI_USDS_EXCHANGE":
        return new DaiUsdsAdapterContract(this.sdk, args);
      case "ADAPTER::EQUALIZER_ROUTER":
        return new EqualizerRouterAdapterContract(this.sdk, args);
      case "ADAPTER::ERC4626_VAULT":
        return new ERC4626AdapterContract(this.sdk, args);
      case "ADAPTER::ERC4626_VAULT_REFERRAL":
        return new ERC4626ReferralAdapterContract(this.sdk, args);
      case "ADAPTER::FLUID_DEX":
        return new FluidDexAdapterContract(this.sdk, args);
      case "ADAPTER::INFINIFI_GATEWAY":
        return new InfinifiGatewayAdapterContract(this.sdk, args);
      case "ADAPTER::INFINIFI_UNWINDING":
        return new InfinifiUnwindingGatewayAdapterContract(this.sdk, args);
      case "ADAPTER::INFRARED_VAULT":
        return new InfraredVaultAdapterContract(this.sdk, args);
      case "ADAPTER::KELP_DEPOSIT_POOL":
        return new KelpLRTDepositPoolAdapterContract(this.sdk, args);
      case "ADAPTER::KELP_WITHDRAWAL":
        return new KelpLRTWithdrawalManagerAdapterContract(this.sdk, args);
      case "ADAPTER::KODIAK_ISLAND_GATEWAY":
        return new KodiakIslandGatewayAdapterContract(this.sdk, args);
      case "ADAPTER::LIDO_V1":
        return new LidoV1AdapterContract(this.sdk, args);
      case "ADAPTER::LIDO_WSTETH_V1":
        return new WstETHV1AdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_CLAIMER":
        return new MellowClaimerAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_DVV":
        return new MellowDVVAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_ERC4626_VAULT":
        return new MellowERC4626VaultAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_LRT_VAULT":
        return new MellowVaultAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_WRAPPER":
        return new MellowWrapperAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_DEPOSIT_QUEUE":
        return new MellowDepositQueueAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_REDEEM_QUEUE":
        return new MellowRedeemQueueAdapterContract(this.sdk, args);
      case "ADAPTER::MIDAS_ISSUANCE_VAULT":
        return new MidasIssuanceVaultAdapterContract(this.sdk, args);
      case "ADAPTER::MIDAS_REDEMPTION_VAULT":
        return new MidasRedemptionVaultAdapterContract(this.sdk, args);
      case "ADAPTER::PENDLE_ROUTER":
        return new PendleRouterAdapterContract(this.sdk, args);
      case "ADAPTER::STAKING_REWARDS":
        return new StakingRewardsAdapterContract(this.sdk, args);
      case "ADAPTER::TRADERJOE_ROUTER":
        return new TraderJoeRouterAdapterContract(this.sdk, args);
      case "ADAPTER::UNISWAP_V2_ROUTER":
        return new UniswapV2AdapterContract(this.sdk, args);
      case "ADAPTER::UNISWAP_V3_ROUTER":
        return new UniswapV3AdapterContract(this.sdk, args);
      case "ADAPTER::UNISWAP_V4_GATEWAY":
        return new UniswapV4AdapterContract(this.sdk, args);
      case "ADAPTER::UPSHIFT_VAULT":
        return new UpshiftVaultAdapterContract(this.sdk, args);
      case "ADAPTER::VELODROME_V2_ROUTER":
        return new VelodromeV2RouterAdapterContract(this.sdk, args);
      case "ADAPTER::YEARN_V2":
        return new YearnV2RouterAdapterContract(this.sdk, args);
      default: {
        const err = new Error(
          `Adapter type ${adapterType} not supported for adapter at ${args.baseParams.addr}`,
        );
        if (this.sdk.strictContractTypes) {
          throw err;
        }
        this.sdk.logger?.error(err);
        return undefined;
      }
    }
  }

  public async load(_force?: boolean): Promise<{}> {
    return {};
  }

  public stateHuman(_?: boolean): {} {
    return {};
  }

  public get state(): {} {
    return {};
  }
}
