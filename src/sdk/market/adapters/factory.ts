import type { Hex } from "viem";

import type { AdapterData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { bytes32ToString } from "../../utils";
import { BalancerV2VaultAdapterContract } from "./BalancerAdapterContract";
import { CamelotV3AdapterContract } from "./CamelotV3AdapterContract";
import { ConvexV1BaseRewardPoolAdapterContract } from "./ConvexV1BaseRewardPoolAdapterContract";
import { ConvexV1BoosterAdapterContract } from "./ConvexV1BoosterAdapterContract";
import { Curve2AssetsAdapterContract } from "./Curve2AssetsAdapterContract";
import { Curve3AssetsAdapterContract } from "./Curve3AssetsAdapterContract";
import { Curve4AssetsAdapterContract } from "./Curve4AssetsAdapterContract";
import { CurveV1AdapterStableNGContract } from "./CurveV1AdapterStableNGContract";
import { CurveV1AdapterStETHContract } from "./CurveV1AdapterStETHContract";
import { CurveV1StableNGAdapterContract } from "./CurveV1StableNGAdapterContract";
import { DaiUsdsAdapterContract } from "./DaiUsdsAdapterContract";
import { ERC4626AdapterContract } from "./ERC4626AdapterContract";
import { MellowVaultAdapterContract } from "./MellowVaultAdapterContract";
import { PendleRouterAdapterContract } from "./PendleRouterAdapterContract";
import { StakingRewardsAdapterContract } from "./StakingRewardsAdapterContract";
import type { AdapterContractType, IAdapterContract } from "./types";
import { UniswapV2AdapterContract } from "./UniswapV2AdapterContract";
import { UniswapV3AdapterContract } from "./UniswapV3AdapterContract";
import { VelodromeV2RouterAdapterContract } from "./VelodromeV2AdapterContract";
import { WstETHV1AdapterContract } from "./WstETHV1AdapterContract";
import { YearnV2RouterAdapterContract } from "./YearnV2AdapterContract";

export function createAdapter(
  sdk: GearboxSDK,
  args: AdapterData,
): IAdapterContract {
  const adapterType = bytes32ToString(
    args.baseParams.contractType as Hex,
  ) as AdapterContractType;
  switch (adapterType) {
    case "AD_UNISWAP_V2_ROUTER":
      return new UniswapV2AdapterContract(sdk, args);
    case "AD_UNISWAP_V3_ROUTER":
      return new UniswapV3AdapterContract(sdk, args);
    case "AD_CURVE_V1_2ASSETS":
      return new Curve2AssetsAdapterContract(sdk, args);
    case "AD_CURVE_V1_3ASSETS":
      return new Curve3AssetsAdapterContract(sdk, args);
    case "AD_CURVE_V1_4ASSETS":
      return new Curve4AssetsAdapterContract(sdk, args);
    case "AD_CURVE_V1_STECRV_POOL":
      return new CurveV1AdapterStETHContract(sdk, args);
    case "AD_CURVE_V1_WRAPPER":
      return new CurveV1AdapterStableNGContract(sdk, args);
    case "AD_CONVEX_V1_BASE_REWARD_POOL":
      return new ConvexV1BaseRewardPoolAdapterContract(sdk, args);
    case "AD_CONVEX_V1_BOOSTER":
      return new ConvexV1BoosterAdapterContract(sdk, args);
    case "AD_CURVE_STABLE_NG":
      return new CurveV1StableNGAdapterContract(sdk, args);
    case "AD_LIDO_WSTETH_V1":
      return new WstETHV1AdapterContract(sdk, args);
    case "AD_BALANCER_VAULT":
      return new BalancerV2VaultAdapterContract(sdk, args);
    case "AD_ERC4626_VAULT":
      return new ERC4626AdapterContract(sdk, args);
    case "AD_VELODROME_V2_ROUTER":
      return new VelodromeV2RouterAdapterContract(sdk, args);
    case "AD_CAMELOT_V3_ROUTER":
      return new CamelotV3AdapterContract(sdk, args);
    case "AD_YEARN_V2":
      return new YearnV2RouterAdapterContract(sdk, args);
    case "AD_MELLOW_LRT_VAULT":
      return new MellowVaultAdapterContract(sdk, args);
    case "AD_PENDLE_ROUTER":
      return new PendleRouterAdapterContract(sdk, args);
    case "AD_DAI_USDS_EXCHANGE":
      return new DaiUsdsAdapterContract(sdk, args);
    case "AD_STAKING_REWARDS":
      return new StakingRewardsAdapterContract(sdk, args);
    default:
      throw new Error(
        `adapter for ${adapterType} at ${args.baseParams.addr} is not implemented`,
      );
  }
}
