import type { Hex } from "viem";

import type {
  AdapterData,
  BaseState,
  GearboxSDK,
  IBaseContract,
  IGearboxSDKPlugin,
} from "../sdk";
import { bytes32ToString } from "../sdk";
import { BalancerV2VaultAdapterContract } from "./BalancerV2VaultAdapterContract";
import { BalancerV3RouterAdapterContract } from "./BalancerV3RouterAdapterContract";
import { CamelotV3AdapterContract } from "./CamelotV3AdapterContract";
import { ConvexV1BaseRewardPoolAdapterContract } from "./ConvexV1BaseRewardPoolAdapterContract";
import { ConvexV1BoosterAdapterContract } from "./ConvexV1BoosterAdapterContract";
import { Curve2AssetsAdapterContract } from "./Curve2AssetsAdapterContract";
import { Curve3AssetsAdapterContract } from "./Curve3AssetsAdapterContract";
import { Curve4AssetsAdapterContract } from "./Curve4AssetsAdapterContract";
import { CurveV1AdapterStETHContract } from "./CurveV1AdapterStETHContract";
import { CurveV1StableNGAdapterContract } from "./CurveV1StableNGAdapterContract";
import { DaiUsdsAdapterContract } from "./DaiUsdsAdapterContract";
import { ERC4626AdapterContract } from "./ERC4626AdapterContract";
import { MellowERC4626VaultAdapterContract } from "./MellowERC4626VaultAdapterContract";
import { MellowVaultAdapterContract } from "./MellowVaultAdapterContract";
import { PendleRouterAdapterContract } from "./PendleRouterAdapterContract";
import { StakingRewardsAdapterContract } from "./StakingRewardsAdapterContract";
import type { AdapterContractType } from "./types";
import { UniswapV2AdapterContract } from "./UniswapV2AdapterContract";
import { UniswapV3AdapterContract } from "./UniswapV3AdapterContract";
import { VelodromeV2RouterAdapterContract } from "./VelodromeV2AdapterContract";
import { WstETHV1AdapterContract } from "./WstETHV1AdapterContract";
import { YearnV2RouterAdapterContract } from "./YearnV2AdapterContract";

export const GearboxAdaptersPlugin: IGearboxSDKPlugin = {
  name: "Adapters",
  createContract(sdk: GearboxSDK, data: BaseState): IBaseContract | undefined {
    const args = data as AdapterData;
    const adapterType = bytes32ToString(
      args.baseParams.contractType as Hex,
    ) as AdapterContractType;
    switch (adapterType) {
      case "ADAPTER::UNISWAP_V2_ROUTER":
        return new UniswapV2AdapterContract(sdk, args);
      case "ADAPTER::UNISWAP_V3_ROUTER":
        return new UniswapV3AdapterContract(sdk, args);
      case "ADAPTER::CURVE_V1_2ASSETS":
        return new Curve2AssetsAdapterContract(sdk, args);
      case "ADAPTER::CURVE_V1_3ASSETS":
        return new Curve3AssetsAdapterContract(sdk, args);
      case "ADAPTER::CURVE_V1_4ASSETS":
        return new Curve4AssetsAdapterContract(sdk, args);
      case "ADAPTER::CURVE_V1_STECRV_POOL":
        return new CurveV1AdapterStETHContract(sdk, args);
      case "ADAPTER::CURVE_V1_WRAPPER":
        return new CurveV1StableNGAdapterContract(sdk, args);
      case "ADAPTER::CVX_V1_BASE_REWARD_POOL":
        return new ConvexV1BaseRewardPoolAdapterContract(sdk, args);
      case "ADAPTER::CVX_V1_BOOSTER":
        return new ConvexV1BoosterAdapterContract(sdk, args);
      case "ADAPTER::CURVE_STABLE_NG":
        return new CurveV1StableNGAdapterContract(sdk, args);
      case "ADAPTER::LIDO_WSTETH_V1":
        return new WstETHV1AdapterContract(sdk, args);
      case "ADAPTER::BALANCER_VAULT":
        return new BalancerV2VaultAdapterContract(sdk, args);
      case "ADAPTER::BALANCER_V3_ROUTER":
        return new BalancerV3RouterAdapterContract(sdk, args);
      case "ADAPTER::ERC4626_VAULT":
        return new ERC4626AdapterContract(sdk, args);
      case "ADAPTER::VELODROME_V2_ROUTER":
        return new VelodromeV2RouterAdapterContract(sdk, args);
      case "ADAPTER::CAMELOT_V3_ROUTER":
        return new CamelotV3AdapterContract(sdk, args);
      case "ADAPTER::YEARN_V2":
        return new YearnV2RouterAdapterContract(sdk, args);
      case "ADAPTER::MELLOW_LRT_VAULT":
        return new MellowVaultAdapterContract(sdk, args);
      case "ADAPTER::MELLOW_ERC4626_VAULT":
        return new MellowERC4626VaultAdapterContract(sdk, args);
      case "ADAPTER::PENDLE_ROUTER":
        return new PendleRouterAdapterContract(sdk, args);
      case "ADAPTER::DAI_USDS_EXCHANGE":
        return new DaiUsdsAdapterContract(sdk, args);
      case "ADAPTER::STAKING_REWARDS":
        return new StakingRewardsAdapterContract(sdk, args);
      default:
        return undefined;
    }
  },
};
