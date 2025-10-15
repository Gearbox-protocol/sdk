import { AdapterType, type VersionedAbi } from "../types";
import {
  ADDRESS_REFERRAL_ADAPTER_ABI,
  BASIC_ADAPTER_ABI,
  CURVE_V1_ADAPTER_310_ABI,
  CURVE_V1_ADAPTER_311_ABI,
  CURVE_V1_WRAPPER_ADAPTER_ABI,
  GATEWAY_ADAPTER_ABI,
  LP_ADAPTER_ABI,
  STAKED_TOKEN_ADAPTER_ABI,
  STAKING_REWARDS_ADAPTER_ABI,
  UINT_REFERRAL_ADAPTER_ABI,
} from "./conctructorAbiPatterns";

/**
 * Mapping from adapter type to ABI for decoding deploy params
 * These ABIs correspond to the constructor parameters used in each adapter's getDeployParams method
 * Based on the actual encodeAbiParameters calls in the adapter implementations
 */
export const adapterConstructorAbi: Record<AdapterType, VersionedAbi> = {
  // DEX and protocol adapters - basic pattern [creditManager, target]
  [AdapterType.BALANCER_VAULT]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.BALANCER_V3_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.CAMELOT_V3_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.CVX_V1_BOOSTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.EQUALIZER_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.FLUID_DEX]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.KODIAK_ISLAND_GATEWAY]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.LIDO_V1]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.LIDO_WSTETH_V1]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.PENDLE_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.DAI_USDS_EXCHANGE]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.TRADERJOE_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.UNISWAP_V2_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.UNISWAP_V3_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.VELODROME_V2_ROUTER]: {
    310: BASIC_ADAPTER_ABI,
  },

  [AdapterType.YEARN_V2]: {
    310: BASIC_ADAPTER_ABI,
  },

  // Curve adapters
  // curve pattern [creditManager, target, lpToken, basePool, use256]
  [AdapterType.CURVE_V1_2ASSETS]: {
    310: CURVE_V1_ADAPTER_310_ABI,
    311: CURVE_V1_ADAPTER_311_ABI,
  },
  [AdapterType.CURVE_V1_3ASSETS]: {
    310: CURVE_V1_ADAPTER_310_ABI,
    311: CURVE_V1_ADAPTER_311_ABI,
  },
  [AdapterType.CURVE_V1_4ASSETS]: {
    310: CURVE_V1_ADAPTER_310_ABI,
    311: CURVE_V1_ADAPTER_311_ABI,
  },
  [AdapterType.CURVE_STABLE_NG]: {
    310: CURVE_V1_ADAPTER_310_ABI,
    311: CURVE_V1_ADAPTER_311_ABI, // Note: CURVE_STABLE_NG forces use256 to false
  },

  // other patterns
  [AdapterType.CURVE_V1_WRAPPER]: {
    310: CURVE_V1_WRAPPER_ADAPTER_ABI,
    311: CURVE_V1_WRAPPER_ADAPTER_ABI,
  },
  [AdapterType.CURVE_V1_STECRV_POOL]: {
    310: LP_ADAPTER_ABI,
    311: LP_ADAPTER_ABI,
  },

  // ERC4626 adapters
  [AdapterType.ERC4626_VAULT]: {
    310: BASIC_ADAPTER_ABI,
    311: BASIC_ADAPTER_ABI,
    312: GATEWAY_ADAPTER_ABI,
  },
  [AdapterType.ERC4626_VAULT_REFERRAL]: {
    310: UINT_REFERRAL_ADAPTER_ABI,
  },

  // Mellow adapters
  [AdapterType.MELLOW_ERC4626_VAULT]: {
    310: BASIC_ADAPTER_ABI,
    311: STAKED_TOKEN_ADAPTER_ABI,
    312: STAKED_TOKEN_ADAPTER_ABI,
  },
  [AdapterType.MELLOW_CLAIMER]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.MELLOW_DVV]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.MELLOW_LRT_VAULT]: {
    310: BASIC_ADAPTER_ABI,
  },
  [AdapterType.MELLOW_WRAPPER]: {
    310: ADDRESS_REFERRAL_ADAPTER_ABI,
  },

  // Other adapters
  // address pattern [creditManager, target, address]
  [AdapterType.CVX_V1_BASE_REWARD_POOL]: {
    310: STAKED_TOKEN_ADAPTER_ABI,
    311: STAKED_TOKEN_ADAPTER_ABI,
  },
  [AdapterType.INFRARED_VAULT]: {
    310: STAKED_TOKEN_ADAPTER_ABI,
    311: STAKED_TOKEN_ADAPTER_ABI,
  },
  [AdapterType.UPSHIFT_VAULT]: {
    310: STAKED_TOKEN_ADAPTER_ABI,
  },

  // other patterns
  [AdapterType.STAKING_REWARDS]: {
    310: STAKED_TOKEN_ADAPTER_ABI,
    311: STAKING_REWARDS_ADAPTER_ABI,
    312: STAKING_REWARDS_ADAPTER_ABI,
  },
} as const;
