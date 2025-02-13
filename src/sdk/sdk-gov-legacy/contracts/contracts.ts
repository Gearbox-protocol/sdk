import { NOT_DEPLOYED } from "../../constants";
import type { CurveLPToken, ERC4626LPToken, NormalToken } from "../tokens";
import { AdapterInterface } from "./adapters";
import { Protocols } from "./protocols";

type UniswapV2Contract =
  | "UNISWAP_V2_ROUTER"
  | "SUSHISWAP_ROUTER"
  | "FRAXSWAP_ROUTER";

export type CurvePoolContract =
  | "CURVE_3CRV_POOL"
  | "CURVE_FRAX_USDC_POOL"
  | "CURVE_STETH_GATEWAY"
  | "CURVE_FRAX_POOL"
  | "CURVE_LUSD_POOL"
  | "CURVE_GUSD_POOL"
  | "CURVE_SUSD_POOL"
  | "CURVE_SUSD_DEPOSIT"
  | "CURVE_CRVETH_POOL"
  | "CURVE_CVXETH_POOL"
  | "CURVE_3CRYPTO_POOL"
  | "CURVE_LDOETH_POOL"
  | "CURVE_CRVUSD_USDC_POOL"
  | "CURVE_CRVUSD_USDT_POOL"
  | "CURVE_CRVUSD_FRAX_POOL"
  | "CURVE_TRI_CRV_POOL"
  | "CURVE_RETH_ETH_POOL"
  | "CURVE_USDE_USDC_POOL"
  | "CURVE_FRAX_USDE_POOL"
  | "CURVE_USDE_CRVUSD_POOL"
  | "CURVE_FRAX_SDAI_POOL"
  | "CURVE_DOLA_SUSDE_POOL"
  | "CURVE_DOLA_FRAXBP_POOL"
  | "CURVE_DOLA_CRVUSD_POOL"
  | "CURVE_USDE_DAI_POOL"
  | "CURVE_SDAI_SUSDE_POOL"
  | "CURVE_GHO_USDE_POOL"
  | "CURVE_PUFETH_WSTETH_POOL"
  | "CURVE_GHO_CRVUSD_POOL"
  | "CURVE_EZETH_ETH_POOL"
  | "CURVE_EZPZ_ETH_POOL"
  | "CURVE_LBTC_WBTC_POOL"
  | "CURVE_EBTC_WBTC_POOL"
  | "CURVE_PUMPBTC_WBTC_POOL"
  | "CURVE_TRIBTC_POOL"
  | "CURVE_tBTC_WBTC_POOL"
  | "CURVE_2CRV_POOL_ARB"
  | "CURVE_TRICRYPTO_CRVUSD_POOL_ARB"
  | "CURVE_CRVUSD_USDC_POOL_ARB"
  | "CURVE_CRVUSD_USDT_POOL_ARB"
  | "CURVE_CRVUSD_USDC_E_POOL_ARB"
  | "CURVE_USDE_USDC_POOL_ARB"
  | "CURVE_3CRV_POOL_OP"
  | "CURVE_ETH_WSTETH_GATEWAY_OP"
  | "CURVE_CRVUSD_SUSDE_POOL"
  | "CURVE_LLAMA_THENA_POOL"
  | "CURVE_tETH_wstETH_POOL"
  | "CURVE_tETH_weETH_POOL"
  | "CURVE_pzETH_stETH_POOL";

export type YearnVaultContract =
  | "YEARN_DAI_VAULT"
  | "YEARN_USDC_VAULT"
  | "YEARN_USDC_E_VAULT"
  | "YEARN_WETH_VAULT"
  | "YEARN_WBTC_VAULT"
  | "YEARN_USDT_VAULT"
  | "YEARN_OP_VAULT"
  | "YEARN_CURVE_FRAX_VAULT"
  | "YEARN_CURVE_STETH_VAULT";

export type ERC4626VaultContract =
  | "MAKER_DSR_VAULT"
  | "YIELD_ETH_VAULT"
  | "STAKED_USDE_VAULT"
  | "STAKED_USDS_VAULT"
  | "SAVINGS_CRVUSD_VAULT"
  | "TREEHOUSE_ETH_VAULT";

export type ConvexPoolContract =
  | "CONVEX_3CRV_POOL"
  | "CONVEX_FRAX_USDC_POOL"
  | "CONVEX_GUSD_POOL"
  | "CONVEX_SUSD_POOL"
  | "CONVEX_STECRV_POOL"
  | "CONVEX_FRAX3CRV_POOL"
  | "CONVEX_LUSD3CRV_POOL"
  | "CONVEX_CRVETH_POOL"
  | "CONVEX_CVXETH_POOL"
  | "CONVEX_3CRYPTO_POOL"
  | "CONVEX_LDOETH_POOL"
  | "CONVEX_CRVUSD_USDC_POOL"
  | "CONVEX_CRVUSD_USDT_POOL"
  | "CONVEX_CRVUSD_FRAX_POOL"
  | "CONVEX_TRI_CRV_POOL"
  | "CONVEX_GHO_CRVUSD_POOL"
  | "CONVEX_CRVUSD_USDT_POOL_ARB"
  | "CONVEX_LLAMA_THENA_POOL";

export type AuraPoolContract =
  | "AURA_B_RETH_STABLE_POOL"
  | "AURA_WEETH_RETH_POOL"
  | "AURA_OSETH_WETH_POOL"
  | "AURA_BPT_RETH_ETH_POOL"
  | "AURA_BPT_WSTETH_ETH_POOL"
  | "AURA_WSTETH_WETH_POOL_ARB"
  | "AURA_WSTETH_RETH_SFRXETH_POOL_ARB"
  | "AURA_CBETH_RETH_WSTETH_POOL_ARB"
  | "AURA_RETH_WETH_POOL_ARB";

type AaveV2TokenWrapperContract =
  | "AAVE_V2_DAI_TOKEN_WRAPPER"
  | "AAVE_V2_USDC_TOKEN_WRAPPER"
  | "AAVE_V2_USDT_TOKEN_WRAPPER"
  | "AAVE_V2_WETH_TOKEN_WRAPPER";

type CompoundV2PoolContract =
  | "COMPOUND_V2_DAI_POOL"
  | "COMPOUND_V2_USDC_POOL"
  | "COMPOUND_V2_USDT_POOL"
  | "COMPOUND_V2_ETH_GATEWAY"
  | "COMPOUND_V2_LINK_POOL"
  | "FLUX_USDC_POOL";

type MellowVaultContract =
  | "MELLOW_STEAKHOUSE_VAULT"
  | "MELLOW_RE7_LABS_VAULT"
  | "MELLOW_AMPHOR_VAULT"
  | "MELLOW_RESTAKING_VAULT"
  | "MELLOW_RENZO_VAULT"
  | "MELLOW_DECENTALIZED_VALIDATOR_VAULT";

export type StakingRewardsContract = "SKY_STAKING_REWARDS";

export type SupportedContract =
  | UniswapV2Contract
  | "UNISWAP_V3_ROUTER"
  | "PANCAKESWAP_V3_ROUTER"
  | CurvePoolContract
  | "CURVE_GEAR_POOL"
  | YearnVaultContract
  | "CONVEX_BOOSTER"
  | "CONVEX_BOOSTER_ARB"
  | ConvexPoolContract
  | "AURA_BOOSTER"
  | AuraPoolContract
  | "LIDO_STETH_GATEWAY"
  | "LIDO_WSTETH"
  | "UNIVERSAL_ADAPTER"
  | "BALANCER_VAULT"
  | "BEETS_VAULT"
  | "AAVE_V2_LENDING_POOL"
  | AaveV2TokenWrapperContract
  | CompoundV2PoolContract
  | ERC4626VaultContract
  | MellowVaultContract
  | "VELODROME_V2_ROUTER"
  | "EQUALIZER_ROUTER"
  | "VELODROME_CL_ROUTER"
  | "SHADOW_ROUTER"
  | "CAMELOT_V3_ROUTER"
  | "AAVE_V3_LENDING_POOL"
  | "ZIRCUIT_POOL"
  | "PENDLE_ROUTER"
  | StakingRewardsContract
  | "DAI_USDS";

interface BaseContractParams {
  name: string;
}

export type CurveParams = {
  protocol: Protocols.Curve;
  type:
    | AdapterInterface.CURVE_V1_2ASSETS
    | AdapterInterface.CURVE_V1_3ASSETS
    | AdapterInterface.CURVE_V1_4ASSETS
    | AdapterInterface.CURVE_V1_WRAPPER
    | AdapterInterface.CURVE_STABLE_NG;
  version: number;
  lpToken: CurveLPToken;
  tokens: Array<NormalToken | CurveLPToken | ERC4626LPToken>;
  underlyings?: Array<NormalToken>;
  wrapper?: CurvePoolContract;
} & BaseContractParams;

export const contractParams: Record<CurvePoolContract, CurveParams> = {
  CURVE_3CRV_POOL: {
    name: "Curve 3Pool",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    version: 10,
    lpToken: "3Crv",
    tokens: ["DAI", "USDC", "USDT"],
  },
  CURVE_FRAX_USDC_POOL: {
    name: "Curve crvFRAX",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
    lpToken: "crvFRAX",
    tokens: ["FRAX", "USDC"],
  },
  CURVE_STETH_GATEWAY: {
    name: "Curve stETH",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_STECRV_POOL,
    version: 10,
    pool: {
      Mainnet: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
      Arbitrum: NOT_DEPLOYED, // CURVE_STECRV_POOL
      Optimism: NOT_DEPLOYED,
      Base: NOT_DEPLOYED,
      Sonic: NOT_DEPLOYED,
    },
    tokens: ["WETH", "STETH"],
    lpToken: "steCRV",
  },
  CURVE_ETH_WSTETH_GATEWAY_OP: {
    name: "Curve wstETH Gateway (Optimism)",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_STECRV_POOL,
    version: 10,
    pool: {
      Mainnet: NOT_DEPLOYED,
      Arbitrum: NOT_DEPLOYED,
      Optimism: "0xb90b9b1f91a01ea22a182cd84c1e22222e39b415",
      Base: NOT_DEPLOYED,
      Sonic: NOT_DEPLOYED,
    },
    tokens: ["WETH", "wstETH"],
    lpToken: "wstETHCRV",
  },
  CURVE_FRAX_POOL: {
    name: "Curve FRAX",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
    lpToken: "FRAX3CRV",
    tokens: ["FRAX", "3Crv"],
    underlyings: ["FRAX", "DAI", "USDC", "USDT"],
  },
  CURVE_LUSD_POOL: {
    name: "Curve LUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
    lpToken: "LUSD3CRV",
    tokens: ["LUSD", "3Crv"],
    underlyings: ["LUSD", "DAI", "USDC", "USDT"],
  },
  CURVE_SUSD_POOL: {
    name: "Curve SUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_4ASSETS,
    version: 10,
    lpToken: "crvPlain3andSUSD",
    tokens: ["DAI", "USDC", "USDT", "sUSD"],
    wrapper: "CURVE_SUSD_DEPOSIT",
  },
  CURVE_SUSD_DEPOSIT: {
    name: "Curve SUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_WRAPPER,
    version: 10,
    lpToken: "crvPlain3andSUSD",
    tokens: ["DAI", "USDC", "USDT", "sUSD"],
  },
  CURVE_GUSD_POOL: {
    name: "Curve GUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
    lpToken: "gusd3CRV",
    tokens: ["GUSD", "3Crv"],
    underlyings: ["GUSD", "DAI", "USDC", "USDT"],
  },

  CURVE_CRVETH_POOL: {
    name: "Curve CRVETH",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 20,
    lpToken: "crvCRVETH",
    tokens: ["WETH", "CRV"],
  },
  CURVE_CVXETH_POOL: {
    name: "Curve CVXETH",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 20,
    lpToken: "crvCVXETH",
    tokens: ["WETH", "CVX"],
  },
  CURVE_3CRYPTO_POOL: {
    name: "Curve 3Crypto",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    version: 20,
    lpToken: "crvUSDTWBTCWETH",
    tokens: ["USDT", "WBTC", "WETH"],
  },
  CURVE_LDOETH_POOL: {
    name: "Curve LDOETH",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 20,
    lpToken: "LDOETH",
    tokens: ["WETH", "LDO"],
  },

  CURVE_CRVUSD_USDC_POOL: {
    name: "Curve crvUSDUSDC",
    protocol: Protocols.Curve,
    version: 10,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUSDUSDC",
    tokens: ["crvUSD", "USDC"],
  },

  CURVE_CRVUSD_USDT_POOL: {
    name: "Curve crvUSDUSDT",
    protocol: Protocols.Curve,
    version: 10,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUSDUSDT",
    tokens: ["crvUSD", "USDT"],
  },
  CURVE_CRVUSD_SUSDE_POOL: {
    name: "Curve crvUsUSDe",
    protocol: Protocols.Curve,
    version: 10,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUsUSDe",
    tokens: ["crvUSD", "sUSDe"],
  },
  CURVE_LLAMA_THENA_POOL: {
    name: "Curve llamathena",
    protocol: Protocols.Curve,
    version: 10,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "llamathena",
    tokens: ["scrvUSD", "sUSDe"],
  },

  CURVE_CRVUSD_FRAX_POOL: {
    name: "Curve crvUSDFRAX",
    protocol: Protocols.Curve,
    version: 10,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUSDFRAX",
    tokens: ["crvUSD", "FRAX"],
  },

  CURVE_TRI_CRV_POOL: {
    name: "Curve crvUSDUSDC",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    lpToken: "crvUSDETHCRV",
    tokens: ["crvUSD", "WETH", "CRV"],
  },

  CURVE_RETH_ETH_POOL: {
    name: "Curve rETH",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "rETH_f",
    tokens: ["WETH", "rETH"],
  },

  CURVE_DOLA_FRAXBP_POOL: {
    name: "Curve DOLAFRAXBP3CRV",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "DOLAFRAXBP3CRV_f",
    tokens: ["DOLA", "crvFRAX"],
  },

  CURVE_DOLA_CRVUSD_POOL: {
    name: "Curve crvUSDDOLA",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUSDDOLA_f",
    tokens: ["DOLA", "crvUSD"],
  },

  CURVE_USDE_USDC_POOL: {
    name: "Curve USDeUSDC",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "USDeUSDC",
    tokens: ["USDe", "USDC"],
  },

  CURVE_FRAX_USDE_POOL: {
    name: "Curve FRAXUSDe",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "FRAXUSDe",
    tokens: ["FRAX", "USDe"],
  },

  CURVE_USDE_CRVUSD_POOL: {
    name: "Curve USDecrvUSD",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "USDecrvUSD",
    tokens: ["USDe", "crvUSD"],
  },

  CURVE_USDE_DAI_POOL: {
    name: "Curve USDeDAI",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "USDeDAI",
    tokens: ["USDe", "DAI"],
  },

  CURVE_SDAI_SUSDE_POOL: {
    name: "Curve MtEthena",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "MtEthena",
    tokens: ["sDAI", "sUSDe"],
  },

  CURVE_GHO_USDE_POOL: {
    name: "Curve GHOUSDe",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "GHOUSDe",
    tokens: ["GHO", "USDe"],
  },

  CURVE_FRAX_SDAI_POOL: {
    name: "Curve FRAXsDAI",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "FRAXsDAI",
    tokens: ["FRAX", "sDAI"],
  },
  CURVE_DOLA_SUSDE_POOL: {
    name: "Curve DOLAsUSDe",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "DOLAsUSDe",
    tokens: ["DOLA", "sUSDe"],
  },

  CURVE_PUFETH_WSTETH_POOL: {
    name: "Curve pufETH/wstETH",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "pufETHwstE",
    tokens: ["pufETH", "wstETH"],
  },

  CURVE_GHO_CRVUSD_POOL: {
    name: "Curve GHO/crvUSD Pool",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "GHOcrvUSD",
    tokens: ["GHO", "crvUSD"],
  },

  CURVE_EZETH_ETH_POOL: {
    name: "Curve ezETH/WETH Pool",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "ezETHWETH",
    tokens: ["ezETH", "WETH"],
  },
  CURVE_EZPZ_ETH_POOL: {
    name: "Curve ezpz ETH Pool",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "ezpzETH",
    tokens: ["ezETH", "pzETH"],
  },
  CURVE_LBTC_WBTC_POOL: {
    name: "Curve LBTC/WBTC Pool",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "LBTCWBTC",
    tokens: ["LBTC", "WBTC"],
  },

  CURVE_EBTC_WBTC_POOL: {
    name: "Curve eBTC/WBTC LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "eBTCWBTC",
    tokens: ["eBTC", "WBTC"],
  },
  CURVE_PUMPBTC_WBTC_POOL: {
    name: "Curve pumpBTC/WBTC LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "pumpBTCWBTC",
    tokens: ["pumpBTC", "WBTC"],
  },
  CURVE_TRIBTC_POOL: {
    name: "Curve Tri BTC-Fi LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "TriBTC",
    tokens: ["eBTC", "LBTC", "WBTC"],
  },
  CURVE_tBTC_WBTC_POOL: {
    name: "Curve tBTC/WBTC LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "2BTC-f",
    tokens: ["WBTC", "tBTC"],
  },
  CURVE_tETH_wstETH_POOL: {
    name: "Curve tETH/wstETH LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "tETHwstETH",
    tokens: ["tETH", "wstETH"],
  },
  CURVE_tETH_weETH_POOL: {
    name: "Curve tETH/weETH LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "tETHweETH",
    tokens: ["tETH", "weETH"],
  },
  CURVE_pzETH_stETH_POOL: {
    name: "Curve pzETH/wstETH LP",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "pzETHstETH",
    tokens: ["pzETH", "wstETH"],
  },

  CURVE_2CRV_POOL_ARB: {
    name: "Curve USDC/USDT Pool (Arbitrum)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "2CRV",
    tokens: ["USDC_e", "USDT"],
  },

  CURVE_TRICRYPTO_CRVUSD_POOL_ARB: {
    name: "Curve Tricrypto-crvUSD Pool (Arbitrum)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    lpToken: "3c-crvUSD",
    tokens: ["crvUSD", "WBTC", "WETH"],
  },

  CURVE_CRVUSD_USDC_POOL_ARB: {
    name: "Curve crvUSD/USDC Pool (Arbitrum)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "crvUSDC",
    tokens: ["crvUSD", "USDC"],
  },

  CURVE_CRVUSD_USDC_E_POOL_ARB: {
    name: "Curve crvUSD/USDC.e Pool (Arbitrum)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "crvUSDC_e",
    tokens: ["crvUSD", "USDC_e"],
  },

  CURVE_CRVUSD_USDT_POOL_ARB: {
    name: "Curve crvUSD/USDT Pool (Arbitrum)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "crvUSDT",
    tokens: ["crvUSD", "USDT"],
  },

  CURVE_USDE_USDC_POOL_ARB: {
    name: "Curve USDe/USDC Pool (Arbitrum)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_STABLE_NG,
    lpToken: "USDEUSDC",
    tokens: ["USDC", "USDe"],
  },

  CURVE_3CRV_POOL_OP: {
    name: "Curve 3CRV Pool (Optimism)",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    lpToken: "3CRV",
    tokens: ["DAI", "USDC_e", "USDT"],
  },
};
