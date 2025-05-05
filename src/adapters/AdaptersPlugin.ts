import type { Hex } from "viem";

import type {
  AdapterData,
  BaseState,
  IBaseContract,
  IGearboxSDKPlugin,
} from "../sdk/index.js";
import { bytes32ToString, SDKConstruct } from "../sdk/index.js";
import { BalancerV2VaultAdapterContract } from "./BalancerV2VaultAdapterContract.js";
import { BalancerV3RouterAdapterContract } from "./BalancerV3RouterAdapterContract.js";
import { CamelotV3AdapterContract } from "./CamelotV3AdapterContract.js";
import { ConvexV1BaseRewardPoolAdapterContract } from "./ConvexV1BaseRewardPoolAdapterContract.js";
import { ConvexV1BoosterAdapterContract } from "./ConvexV1BoosterAdapterContract.js";
import { Curve2AssetsAdapterContract } from "./Curve2AssetsAdapterContract.js";
import { Curve3AssetsAdapterContract } from "./Curve3AssetsAdapterContract.js";
import { Curve4AssetsAdapterContract } from "./Curve4AssetsAdapterContract.js";
import { CurveV1AdapterDeposit } from "./CurveV1AdapterDeposit.js";
import { CurveV1AdapterStETHContract } from "./CurveV1AdapterStETHContract.js";
import { CurveV1StableNGAdapterContract } from "./CurveV1StableNGAdapterContract.js";
import { DaiUsdsAdapterContract } from "./DaiUsdsAdapterContract.js";
import { EqualizerRouterAdapterContract } from "./EqualizerRouterAdapterContract.js";
import { ERC4626AdapterContract } from "./ERC4626AdapterContract.js";
import { MellowERC4626VaultAdapterContract } from "./MellowERC4626VaultAdapterContract.js";
import { MellowVaultAdapterContract } from "./MellowVaultAdapterContract.js";
import { PendleRouterAdapterContract } from "./PendleRouterAdapterContract.js";
import { StakingRewardsAdapterContract } from "./StakingRewardsAdapterContract.js";
import type { AdapterContractType } from "./types.js";
import { UniswapV2AdapterContract } from "./UniswapV2AdapterContract.js";
import { UniswapV3AdapterContract } from "./UniswapV3AdapterContract.js";
import { VelodromeV2RouterAdapterContract } from "./VelodromeV2AdapterContract.js";
import { WstETHV1AdapterContract } from "./WstETHV1AdapterContract.js";
import { YearnV2RouterAdapterContract } from "./YearnV2AdapterContract.js";

export class AdaptersPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin<undefined>
{
  public readonly name = "Adapters";

  public createContract(data: BaseState): IBaseContract | undefined {
    const args = data as AdapterData;
    const adapterType = bytes32ToString(
      args.baseParams.contractType as Hex,
    ) as AdapterContractType;

    switch (adapterType) {
      case "ADAPTER::BALANCER_V3_ROUTER":
        return new BalancerV3RouterAdapterContract(this.sdk, args);
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
      case "ADAPTER::LIDO_WSTETH_V1":
        return new WstETHV1AdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_ERC4626_VAULT":
        return new MellowERC4626VaultAdapterContract(this.sdk, args);
      case "ADAPTER::MELLOW_LRT_VAULT":
        return new MellowVaultAdapterContract(this.sdk, args);
      case "ADAPTER::PENDLE_ROUTER":
        return new PendleRouterAdapterContract(this.sdk, args);
      case "ADAPTER::STAKING_REWARDS":
        return new StakingRewardsAdapterContract(this.sdk, args);
      case "ADAPTER::UNISWAP_V2_ROUTER":
        return new UniswapV2AdapterContract(this.sdk, args);
      case "ADAPTER::UNISWAP_V3_ROUTER":
        return new UniswapV3AdapterContract(this.sdk, args);
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

  public stateHuman(_?: boolean): {} {
    return {};
  }

  public get state(): undefined {
    return undefined;
  }

  public hydrate(_: undefined): void {
    return;
  }
}
