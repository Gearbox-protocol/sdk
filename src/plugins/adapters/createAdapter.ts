import { isHex } from "viem";

import type {
  ConstructOptions,
  IBaseContract,
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
  options: ConstructOptions,
  data: AdapterFactoryArgs,
  strict?: boolean,
): IBaseContract {
  const contractType = data.baseParams.contractType;
  const adapterType = (
    isHex(contractType) ? bytes32ToString(contractType) : contractType
  ) as AdapterContractType;

  switch (adapterType) {
    case "ADAPTER::ACCOUNT_MIGRATOR":
      return new AccountMigratorAdapterContract(options, data);
    case "ADAPTER::BALANCER_V3_ROUTER":
      return new BalancerV3RouterAdapterContract(options, data);
    case "ADAPTER::BALANCER_V3_WRAPPER":
      return new BalancerV3WrapperAdapterContract(options, data);
    case "ADAPTER::CAMELOT_V3_ROUTER":
      return new CamelotV3AdapterContract(options, data);
    case "ADAPTER::CURVE_STABLE_NG":
      return new CurveV1StableNGAdapterContract(options, data);
    case "ADAPTER::CURVE_V1_2ASSETS":
      return new Curve2AssetsAdapterContract(options, data);
    case "ADAPTER::CURVE_V1_3ASSETS":
      return new Curve3AssetsAdapterContract(options, data);
    case "ADAPTER::CURVE_V1_4ASSETS":
      return new Curve4AssetsAdapterContract(options, data);
    case "ADAPTER::CURVE_V1_STECRV_POOL":
      return new CurveV1AdapterStETHContract(options, data);
    case "ADAPTER::CVX_V1_BASE_REWARD_POOL":
      return new ConvexV1BaseRewardPoolAdapterContract(options, data);
    case "ADAPTER::CVX_V1_BOOSTER":
      return new ConvexV1BoosterAdapterContract(options, data);
    case "ADAPTER::DAI_USDS_EXCHANGE":
      return new DaiUsdsAdapterContract(options, data);
    case "ADAPTER::ERC4626_VAULT":
      return new ERC4626AdapterContract(options, data);
    case "ADAPTER::ERC4626_VAULT_REFERRAL":
      return new ERC4626ReferralAdapterContract(options, data);
    case "ADAPTER::FLUID_DEX":
      return new FluidDexAdapterContract(options, data);
    case "ADAPTER::INFINIFI_GATEWAY":
      return new InfinifiGatewayAdapterContract(options, data);
    case "ADAPTER::INFINIFI_UNWINDING":
      return new InfinifiUnwindingGatewayAdapterContract(options, data);
    case "ADAPTER::KELP_DEPOSIT_POOL":
      return new KelpLRTDepositPoolAdapterContract(options, data);
    case "ADAPTER::KELP_WITHDRAWAL":
      return new KelpLRTWithdrawalManagerAdapterContract(options, data);
    case "ADAPTER::LIDO_V1":
      return new LidoV1AdapterContract(options, data);
    case "ADAPTER::LIDO_WSTETH_V1":
      return new WstETHV1AdapterContract(options, data);
    case "ADAPTER::MELLOW_CLAIMER":
      return new MellowClaimerAdapterContract(options, data);
    case "ADAPTER::MELLOW_DVV":
      return new MellowDVVAdapterContract(options, data);
    case "ADAPTER::MELLOW_ERC4626_VAULT":
      return new MellowERC4626VaultAdapterContract(options, data);
    case "ADAPTER::MELLOW_WRAPPER":
      return new MellowWrapperAdapterContract(options, data);
    case "ADAPTER::MIDAS_ISSUANCE_VAULT":
      return new MidasIssuanceVaultAdapterContract(options, data);
    case "ADAPTER::MIDAS_REDEMPTION_VAULT":
      return new MidasRedemptionVaultAdapterContract(options, data);
    case "ADAPTER::PENDLE_ROUTER":
      return new PendleRouterAdapterContract(options, data);
    case "ADAPTER::SECURITIZE_ONRAMP":
      return new SecuritizeOnRampAdapterContract(options, data);
    case "ADAPTER::SECURITIZE_REDEMPTION":
      return new SecuritizeRedemptionGatewayAdapterContract(options, data);
    case "ADAPTER::STAKING_REWARDS":
      return new StakingRewardsAdapterContract(options, data);
    case "ADAPTER::TRADERJOE_ROUTER":
      return new TraderJoeRouterAdapterContract(options, data);
    case "ADAPTER::UNISWAP_V2_ROUTER":
      return new UniswapV2AdapterContract(options, data);
    case "ADAPTER::UNISWAP_V3_ROUTER":
      return new UniswapV3AdapterContract(options, data);
    case "ADAPTER::UNISWAP_V4_GATEWAY":
      return new UniswapV4AdapterContract(options, data);
    case "ADAPTER::UPSHIFT_VAULT":
      return new UpshiftVaultAdapterContract(options, data);
    case "ADAPTER::VELODROME_V2_ROUTER":
      return new VelodromeV2RouterAdapterContract(options, data);
    default: {
      if (strict) {
        throw new Error(
          `Adapter type ${adapterType} not supported for adapter at ${data.baseParams.addr}`,
        );
      }
      return new AbstractAdapterContract(options, {
        ...data,
        abi: [],
        protocolAbi: [],
      });
    }
  }
}
