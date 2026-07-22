import { isHex } from "viem";

import type {
  IBaseContract,
  OnchainSDK,
  RelaxedBaseParams,
} from "../../sdk/index.js";
import { bytes32ToString } from "../../sdk/index.js";
import {
  AbstractAdapterContract,
  AccountMigratorAdapterContract,
  BalancerV3RouterAdapterContract,
  BalancerV3WrapperAdapterContract,
  CamelotV3AdapterContract,
  ConvexV1BaseRewardPoolAdapterContract,
  ConvexV1BoosterAdapterContract,
  Curve2AssetsAdapterContract,
  Curve3AssetsAdapterContract,
  Curve4AssetsAdapterContract,
  CurveV1AdapterStETHContract,
  CurveV1StableNGAdapterContract,
  DaiUsdsAdapterContract,
  ERC4626AdapterContract,
  ERC4626ReferralAdapterContract,
  FluidDexAdapterContract,
  InfinifiGatewayAdapterContract,
  InfinifiUnwindingGatewayAdapterContract,
  KelpLRTDepositPoolAdapterContract,
  KelpLRTWithdrawalManagerAdapterContract,
  LidoV1AdapterContract,
  MellowClaimerAdapterContract,
  MellowDVVAdapterContract,
  MellowERC4626VaultAdapterContract,
  MellowWrapperAdapterContract,
  MidasGatewayAdapterContract,
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
} from "./contracts/index.js";
import { SecuritizeOnRampAdapterContract } from "./contracts/SecuritizeOnRampAdapterContract.js";
import { SecuritizeRedemptionGatewayAdapterContract } from "./contracts/SecuritizeRedemptionGatewayAdapterContract.js";
import { UniswapV4AdapterContract } from "./contracts/UniswapV4AdapterContract.js";
import type { AdapterContractType } from "./types.js";

export interface AdapterFactoryArgs {
  baseParams: RelaxedBaseParams;
}

export function createAdapter(
  sdk: OnchainSDK,
  data: AdapterFactoryArgs,
  strict?: boolean,
): IBaseContract {
  const contractType = data.baseParams.contractType;
  const adapterType = (
    isHex(contractType) ? bytes32ToString(contractType) : contractType
  ) as AdapterContractType;

  switch (adapterType) {
    case "ADAPTER::ACCOUNT_MIGRATOR":
      return new AccountMigratorAdapterContract(sdk, data);
    case "ADAPTER::BALANCER_V3_ROUTER":
      return new BalancerV3RouterAdapterContract(sdk, data);
    case "ADAPTER::BALANCER_V3_WRAPPER":
      return new BalancerV3WrapperAdapterContract(sdk, data);
    case "ADAPTER::CAMELOT_V3_ROUTER":
      return new CamelotV3AdapterContract(sdk, data);
    case "ADAPTER::CURVE_STABLE_NG":
      return new CurveV1StableNGAdapterContract(sdk, data);
    case "ADAPTER::CURVE_V1_2ASSETS":
      return new Curve2AssetsAdapterContract(sdk, data);
    case "ADAPTER::CURVE_V1_3ASSETS":
      return new Curve3AssetsAdapterContract(sdk, data);
    case "ADAPTER::CURVE_V1_4ASSETS":
      return new Curve4AssetsAdapterContract(sdk, data);
    case "ADAPTER::CURVE_V1_STECRV_POOL":
      return new CurveV1AdapterStETHContract(sdk, data);
    case "ADAPTER::CVX_V1_BASE_REWARD_POOL":
      return new ConvexV1BaseRewardPoolAdapterContract(sdk, data);
    case "ADAPTER::CVX_V1_BOOSTER":
      return new ConvexV1BoosterAdapterContract(sdk, data);
    case "ADAPTER::DAI_USDS_EXCHANGE":
      return new DaiUsdsAdapterContract(sdk, data);
    case "ADAPTER::ERC4626_VAULT":
      return new ERC4626AdapterContract(sdk, data);
    case "ADAPTER::ERC4626_VAULT_REFERRAL":
      return new ERC4626ReferralAdapterContract(sdk, data);
    case "ADAPTER::FLUID_DEX":
      return new FluidDexAdapterContract(sdk, data);
    case "ADAPTER::INFINIFI_GATEWAY":
      return new InfinifiGatewayAdapterContract(sdk, data);
    case "ADAPTER::INFINIFI_UNWINDING":
      return new InfinifiUnwindingGatewayAdapterContract(sdk, data);
    case "ADAPTER::KELP_DEPOSIT_POOL":
      return new KelpLRTDepositPoolAdapterContract(sdk, data);
    case "ADAPTER::KELP_WITHDRAWAL":
      return new KelpLRTWithdrawalManagerAdapterContract(sdk, data);
    case "ADAPTER::LIDO_V1":
      return new LidoV1AdapterContract(sdk, data);
    case "ADAPTER::LIDO_WSTETH_V1":
      return new WstETHV1AdapterContract(sdk, data);
    case "ADAPTER::MELLOW_CLAIMER":
      return new MellowClaimerAdapterContract(sdk, data);
    case "ADAPTER::MELLOW_DVV":
      return new MellowDVVAdapterContract(sdk, data);
    case "ADAPTER::MELLOW_ERC4626_VAULT":
      return new MellowERC4626VaultAdapterContract(sdk, data);
    case "ADAPTER::MELLOW_WRAPPER":
      return new MellowWrapperAdapterContract(sdk, data);
    case "ADAPTER::MIDAS_GATEWAY":
      return new MidasGatewayAdapterContract(sdk, data);
    case "ADAPTER::MIDAS_ISSUANCE_VAULT":
      return new MidasIssuanceVaultAdapterContract(sdk, data);
    case "ADAPTER::MIDAS_REDEMPTION_VAULT":
      return new MidasRedemptionVaultAdapterContract(sdk, data);
    case "ADAPTER::PENDLE_ROUTER":
      return new PendleRouterAdapterContract(sdk, data);
    case "ADAPTER::SECURITIZE_ONRAMP":
      return new SecuritizeOnRampAdapterContract(sdk, data);
    case "ADAPTER::SECURITIZE_REDEMPTION":
      return new SecuritizeRedemptionGatewayAdapterContract(sdk, data);
    case "ADAPTER::STAKING_REWARDS":
      return new StakingRewardsAdapterContract(sdk, data);
    case "ADAPTER::TRADERJOE_ROUTER":
      return new TraderJoeRouterAdapterContract(sdk, data);
    case "ADAPTER::UNISWAP_V2_ROUTER":
      return new UniswapV2AdapterContract(sdk, data);
    case "ADAPTER::UNISWAP_V3_ROUTER":
      return new UniswapV3AdapterContract(sdk, data);
    case "ADAPTER::UNISWAP_V4_GATEWAY":
      return new UniswapV4AdapterContract(sdk, data);
    case "ADAPTER::UPSHIFT_VAULT":
      return new UpshiftVaultAdapterContract(sdk, data);
    case "ADAPTER::VELODROME_V2_ROUTER":
      return new VelodromeV2RouterAdapterContract(sdk, data);
    default: {
      if (strict) {
        throw new Error(
          `Adapter type ${adapterType} not supported for adapter at ${data.baseParams.addr}`,
        );
      }
      return new AbstractAdapterContract(sdk, {
        ...data,
        abi: [],
        protocolAbi: [],
      });
    }
  }
}
