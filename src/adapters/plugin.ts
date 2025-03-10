import type { Hex } from "viem";

import type {
  AdapterData,
  BaseState,
  GearboxSDK,
  IBaseContract,
  IGearboxSDKPlugin,
} from "../sdk/index.js";
import { bytes32ToString } from "../sdk/index.js";
import { BalancerV2VaultAdapterContract } from "./BalancerV2VaultAdapterContract.js";
import { BalancerV3RouterAdapterContract } from "./BalancerV3RouterAdapterContract.js";
import { CamelotV3AdapterContract } from "./CamelotV3AdapterContract.js";
import { ConvexV1BaseRewardPoolAdapterContract } from "./ConvexV1BaseRewardPoolAdapterContract.js";
import { ConvexV1BoosterAdapterContract } from "./ConvexV1BoosterAdapterContract.js";
import { Curve2AssetsAdapterContract } from "./Curve2AssetsAdapterContract.js";
import { Curve3AssetsAdapterContract } from "./Curve3AssetsAdapterContract.js";
import { Curve4AssetsAdapterContract } from "./Curve4AssetsAdapterContract.js";
import { CurveV1AdapterStETHContract } from "./CurveV1AdapterStETHContract.js";
import { CurveV1StableNGAdapterContract } from "./CurveV1StableNGAdapterContract.js";
import { DaiUsdsAdapterContract } from "./DaiUsdsAdapterContract.js";
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
