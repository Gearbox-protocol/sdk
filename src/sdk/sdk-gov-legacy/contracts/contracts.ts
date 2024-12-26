import type { Address } from "viem";

import type { NetworkType } from "../../chain";
import { NOT_DEPLOYED } from "../../constants";
import type {
  AaveV2LPToken,
  AuraStakedToken,
  ConvexStakedPhantomToken,
  CurveLPToken,
  ERC4626LPToken,
  NormalToken,
  StakingRewardsPhantomToken,
  SupportedToken,
  YearnLPToken,
} from "../tokens";
import { tokenDataByNetwork } from "../tokens";
import { AdapterInterface } from "./adapters";
import { Protocols } from "./protocols";

export type UniswapV2Contract =
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
  | "CURVE_2CRV_POOL_ARB"
  | "CURVE_TRICRYPTO_CRVUSD_POOL_ARB"
  | "CURVE_CRVUSD_USDC_POOL_ARB"
  | "CURVE_CRVUSD_USDT_POOL_ARB"
  | "CURVE_CRVUSD_USDC_E_POOL_ARB"
  | "CURVE_USDE_USDC_POOL_ARB"
  | "CURVE_3CRV_POOL_OP"
  | "CURVE_ETH_WSTETH_GATEWAY_OP"
  | "CURVE_CRVUSD_SUSDE_POOL"
  | "CURVE_LLAMA_THENA_POOL";

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
  | "SAVINGS_CRVUSD_VAULT";

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

export type AaveV2TokenWrapperContract =
  | "AAVE_V2_DAI_TOKEN_WRAPPER"
  | "AAVE_V2_USDC_TOKEN_WRAPPER"
  | "AAVE_V2_USDT_TOKEN_WRAPPER"
  | "AAVE_V2_WETH_TOKEN_WRAPPER";

export type CompoundV2PoolContract =
  | "COMPOUND_V2_DAI_POOL"
  | "COMPOUND_V2_USDC_POOL"
  | "COMPOUND_V2_USDT_POOL"
  | "COMPOUND_V2_ETH_GATEWAY"
  | "COMPOUND_V2_LINK_POOL"
  | "FLUX_USDC_POOL";

export type MellowVaultContract =
  | "MELLOW_STEAKHOUSE_VAULT"
  | "MELLOW_RE7_LABS_VAULT"
  | "MELLOW_AMPHOR_VAULT"
  | "MELLOW_RESTAKING_VAULT"
  | "MELLOW_RENZO_VAULT";

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
  | "AAVE_V2_LENDING_POOL"
  | AaveV2TokenWrapperContract
  | CompoundV2PoolContract
  | ERC4626VaultContract
  | MellowVaultContract
  | "VELODROME_V2_ROUTER"
  | "VELODROME_CL_ROUTER"
  | "CAMELOT_V3_ROUTER"
  | "AAVE_V3_LENDING_POOL"
  | "ZIRCUIT_POOL"
  | "PENDLE_ROUTER"
  | StakingRewardsContract
  | "DAI_USDS";

export const contractsByNetwork: Record<
  NetworkType,
  Record<SupportedContract, Address>
> = {
  Mainnet: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    PANCAKESWAP_V3_ROUTER: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
    SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    FRAXSWAP_ROUTER: "0xC14d550632db8592D1243Edc8B95b0Ad06703867",
    VELODROME_V2_ROUTER: NOT_DEPLOYED,
    VELODROME_CL_ROUTER: NOT_DEPLOYED,
    CAMELOT_V3_ROUTER: NOT_DEPLOYED,
    PENDLE_ROUTER: "0x888888888889758F76e7103c6CbF23ABbF58F946",

    // CURVE
    CURVE_3CRV_POOL: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", // SEPARATE TOKEN
    CURVE_FRAX_USDC_POOL: "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2",
    CURVE_STETH_GATEWAY: "0xEf0D72C594b28252BF7Ea2bfbF098792430815b1", // SEPARATE TOKEN
    CURVE_FRAX_POOL: tokenDataByNetwork.Mainnet.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Mainnet.LUSD3CRV,
    CURVE_SUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD", // SEPARATE TOKEN
    CURVE_SUSD_DEPOSIT: "0xFCBa3E75865d2d561BE8D220616520c171F12851",
    CURVE_GUSD_POOL: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956", // SEPARATE TOKEN
    CURVE_CRVETH_POOL: "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511",
    CURVE_CVXETH_POOL: "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4",
    CURVE_3CRYPTO_POOL: tokenDataByNetwork.Mainnet.crvUSDTWBTCWETH,
    CURVE_LDOETH_POOL: "0x9409280DC1e6D33AB7A8C6EC03e5763FB61772B5",
    CURVE_ETH_WSTETH_GATEWAY_OP: NOT_DEPLOYED,
    CURVE_USDE_USDC_POOL: tokenDataByNetwork.Mainnet.USDeUSDC,
    CURVE_FRAX_USDE_POOL: tokenDataByNetwork.Mainnet.FRAXUSDe,
    CURVE_USDE_CRVUSD_POOL: tokenDataByNetwork.Mainnet.USDecrvUSD,
    CURVE_FRAX_SDAI_POOL: tokenDataByNetwork.Mainnet.FRAXsDAI,
    CURVE_DOLA_SUSDE_POOL: tokenDataByNetwork.Mainnet.DOLAsUSDe,
    CURVE_DOLA_FRAXBP_POOL: tokenDataByNetwork.Mainnet.DOLAFRAXBP3CRV_f,
    CURVE_DOLA_CRVUSD_POOL: tokenDataByNetwork.Mainnet.crvUSDDOLA_f,
    CURVE_USDE_DAI_POOL: tokenDataByNetwork.Mainnet.USDeDAI,
    CURVE_SDAI_SUSDE_POOL: tokenDataByNetwork.Mainnet.MtEthena,
    CURVE_GHO_USDE_POOL: tokenDataByNetwork.Mainnet.GHOUSDe,
    CURVE_PUFETH_WSTETH_POOL: tokenDataByNetwork.Mainnet.pufETHwstE,
    CURVE_GHO_CRVUSD_POOL: tokenDataByNetwork.Mainnet.GHOcrvUSD,
    CURVE_EZETH_ETH_POOL: tokenDataByNetwork.Mainnet.ezETHWETH,
    CURVE_EZPZ_ETH_POOL: tokenDataByNetwork.Mainnet.ezpzETH,
    CURVE_LBTC_WBTC_POOL: tokenDataByNetwork.Mainnet.LBTCWBTC,
    CURVE_EBTC_WBTC_POOL: tokenDataByNetwork.Mainnet.eBTCWBTC,
    CURVE_PUMPBTC_WBTC_POOL: tokenDataByNetwork.Mainnet.pumpBTCWBTC,
    CURVE_TRIBTC_POOL: tokenDataByNetwork.Mainnet.TriBTC,

    CURVE_GEAR_POOL: "0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2",

    CURVE_CRVUSD_USDC_POOL: tokenDataByNetwork.Mainnet.crvUSDUSDC,
    CURVE_CRVUSD_USDT_POOL: tokenDataByNetwork.Mainnet.crvUSDUSDT,
    CURVE_CRVUSD_FRAX_POOL: tokenDataByNetwork.Mainnet.crvUSDFRAX,
    CURVE_TRI_CRV_POOL: tokenDataByNetwork.Mainnet.crvUSDETHCRV,
    CURVE_CRVUSD_SUSDE_POOL: tokenDataByNetwork.Mainnet.crvUsUSDe,
    CURVE_LLAMA_THENA_POOL: tokenDataByNetwork.Mainnet.llamathena,

    CURVE_RETH_ETH_POOL: "0x0f3159811670c117c372428D4E69AC32325e4D0F",

    CURVE_3CRV_POOL_OP: NOT_DEPLOYED,
    CURVE_2CRV_POOL_ARB: tokenDataByNetwork.Mainnet["2CRV"],
    CURVE_TRICRYPTO_CRVUSD_POOL_ARB: tokenDataByNetwork.Mainnet["3c-crvUSD"],
    CURVE_CRVUSD_USDC_POOL_ARB: tokenDataByNetwork.Mainnet.crvUSDC,
    CURVE_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Mainnet.crvUSDT,
    CURVE_CRVUSD_USDC_E_POOL_ARB: tokenDataByNetwork.Mainnet.crvUSDC_e,
    CURVE_USDE_USDC_POOL_ARB: tokenDataByNetwork.Mainnet.USDEUSDC,

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Mainnet.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Mainnet.yvUSDC,
    YEARN_USDC_E_VAULT: tokenDataByNetwork.Mainnet.yvUSDC_e,
    YEARN_WETH_VAULT: tokenDataByNetwork.Mainnet.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Mainnet.yvWBTC,
    YEARN_USDT_VAULT: tokenDataByNetwork.Mainnet.yvUSDT,
    YEARN_OP_VAULT: tokenDataByNetwork.Mainnet.yvOP,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Mainnet.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Mainnet.yvCurve_stETH,

    // ERC4626
    MAKER_DSR_VAULT: tokenDataByNetwork.Mainnet.sDAI,
    YIELD_ETH_VAULT: tokenDataByNetwork.Mainnet.YieldETH,
    STAKED_USDE_VAULT: tokenDataByNetwork.Mainnet.sUSDe,
    STAKED_USDS_VAULT: tokenDataByNetwork.Mainnet.sUSDS,
    SAVINGS_CRVUSD_VAULT: tokenDataByNetwork.Mainnet.scrvUSD,

    // CONVEX
    CONVEX_BOOSTER: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
    CONVEX_3CRV_POOL: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8",
    CONVEX_FRAX_USDC_POOL: "0x7e880867363A7e321f5d260Cade2B0Bb2F717B02",
    CONVEX_GUSD_POOL: "0x7A7bBf95C44b144979360C3300B54A7D34b44985",
    CONVEX_SUSD_POOL: "0x22eE18aca7F3Ee920D01F25dA85840D12d98E8Ca",
    CONVEX_STECRV_POOL: "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03",
    CONVEX_FRAX3CRV_POOL: "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e",
    CONVEX_LUSD3CRV_POOL: "0x2ad92A7aE036a038ff02B96c88de868ddf3f8190",
    CONVEX_CRVETH_POOL: "0x085A2054c51eA5c91dbF7f90d65e728c0f2A270f",
    CONVEX_CVXETH_POOL: "0xb1Fb0BA0676A1fFA83882c7F4805408bA232C1fA",
    CONVEX_3CRYPTO_POOL: "0xb05262D4aaAA38D0Af4AaB244D446ebDb5afd4A7",
    CONVEX_LDOETH_POOL: "0x8CA990E954611E5E3d2cc51C013fCC372c8c1D38",
    CONVEX_CRVUSD_USDC_POOL: "0x44D8FaB7CD8b7877D5F79974c2F501aF6E65AbBA",
    CONVEX_CRVUSD_USDT_POOL: "0xD1DdB0a0815fD28932fBb194C84003683AF8a824",
    CONVEX_CRVUSD_FRAX_POOL: "0x3CfB4B26dc96B124D15A6f360503d028cF2a3c00",
    CONVEX_TRI_CRV_POOL: "0xF956a46DbA1A0a567168db8655bc18E9050C7738",
    CONVEX_GHO_CRVUSD_POOL: "0x5eC758f79b96AE74e7F1Ba9583009aFB3fc8eACB",
    CONVEX_LLAMA_THENA_POOL: "0x11fD8801a051b296E337a3e1168839fb346D5940",

    CONVEX_BOOSTER_ARB: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Mainnet.cvxcrvUSDT,

    // AURA
    AURA_BOOSTER: "0xA57b8d98dAE62B26Ec3bcC4a365338157060B234",
    AURA_WEETH_RETH_POOL: tokenDataByNetwork.Mainnet.auraweETH_rETH_vault,
    AURA_OSETH_WETH_POOL: tokenDataByNetwork.Mainnet.auraosETH_wETH_BPT_vault,
    AURA_B_RETH_STABLE_POOL: tokenDataByNetwork.Mainnet.auraB_rETH_STABLE_vault,
    AURA_BPT_RETH_ETH_POOL: tokenDataByNetwork.Mainnet.auraBPT_rETH_ETH_vault,
    AURA_BPT_WSTETH_ETH_POOL:
      tokenDataByNetwork.Mainnet.auraBPT_WSTETH_ETH_vault,
    AURA_RETH_WETH_POOL_ARB: tokenDataByNetwork.Mainnet.aurarETH_wETH_BPT_vault,
    AURA_WSTETH_WETH_POOL_ARB:
      tokenDataByNetwork.Mainnet.aurawstETH_WETH_BPT_vault,
    AURA_CBETH_RETH_WSTETH_POOL_ARB:
      tokenDataByNetwork.Mainnet.auracbETH_rETH_wstETH_vault,
    AURA_WSTETH_RETH_SFRXETH_POOL_ARB:
      tokenDataByNetwork.Mainnet.aurawstETH_rETH_sfrxETH_vault,

    // LIDO
    LIDO_STETH_GATEWAY: "0x6f4b4aB5142787c05b7aB9A9692A0f46b997C29D",
    LIDO_WSTETH: tokenDataByNetwork.Mainnet.wstETH,

    // BALANCER
    BALANCER_VAULT: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",

    // AAVE
    AAVE_V2_LENDING_POOL: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
    AAVE_V3_LENDING_POOL: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",

    AAVE_V2_DAI_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waDAI,
    AAVE_V2_USDC_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waUSDC,
    AAVE_V2_USDT_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waUSDT,
    AAVE_V2_WETH_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waWETH,

    COMPOUND_V2_DAI_POOL: tokenDataByNetwork.Mainnet.cDAI,
    COMPOUND_V2_USDC_POOL: tokenDataByNetwork.Mainnet.cUSDC,
    COMPOUND_V2_USDT_POOL: tokenDataByNetwork.Mainnet.cUSDT,
    COMPOUND_V2_LINK_POOL: tokenDataByNetwork.Mainnet.cLINK,
    COMPOUND_V2_ETH_GATEWAY: NOT_DEPLOYED,

    FLUX_USDC_POOL: tokenDataByNetwork.Mainnet.fUSDC,

    ZIRCUIT_POOL: "0xF047ab4c75cebf0eB9ed34Ae2c186f3611aEAfa6",

    // MELLOW
    MELLOW_STEAKHOUSE_VAULT: tokenDataByNetwork.Mainnet.steakLRT,
    MELLOW_RE7_LABS_VAULT: tokenDataByNetwork.Mainnet.Re7LRT,
    MELLOW_AMPHOR_VAULT: tokenDataByNetwork.Mainnet.amphrETH,
    MELLOW_RESTAKING_VAULT: tokenDataByNetwork.Mainnet.rstETH,
    MELLOW_RENZO_VAULT: tokenDataByNetwork.Mainnet.pzETH,

    // SKY
    SKY_STAKING_REWARDS: "0x0650CAF159C5A49f711e8169D4336ECB9b950275",
    DAI_USDS: "0x3225737a9Bbb6473CB4a45b7244ACa2BeFdB276A",
  },

  //
  //
  //
  //
  //  A R B I T R U M
  //
  //
  //
  //
  Arbitrum: {
    UNISWAP_V2_ROUTER: NOT_DEPLOYED,
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    PANCAKESWAP_V3_ROUTER: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
    SUSHISWAP_ROUTER: NOT_DEPLOYED,
    FRAXSWAP_ROUTER: NOT_DEPLOYED,
    VELODROME_V2_ROUTER: NOT_DEPLOYED,
    VELODROME_CL_ROUTER: NOT_DEPLOYED,
    CAMELOT_V3_ROUTER: "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18",
    PENDLE_ROUTER: NOT_DEPLOYED,

    // CURVE
    CURVE_3CRV_POOL: NOT_DEPLOYED,
    CURVE_FRAX_USDC_POOL: NOT_DEPLOYED,
    CURVE_STETH_GATEWAY: NOT_DEPLOYED,
    CURVE_FRAX_POOL: tokenDataByNetwork.Arbitrum.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Arbitrum.LUSD3CRV,
    CURVE_SUSD_POOL: NOT_DEPLOYED,
    CURVE_SUSD_DEPOSIT: NOT_DEPLOYED,
    CURVE_GUSD_POOL: NOT_DEPLOYED,
    CURVE_CRVETH_POOL: NOT_DEPLOYED,
    CURVE_CVXETH_POOL: NOT_DEPLOYED,
    CURVE_3CRYPTO_POOL: NOT_DEPLOYED,
    CURVE_LDOETH_POOL: NOT_DEPLOYED,
    CURVE_USDE_USDC_POOL: tokenDataByNetwork.Arbitrum.USDeUSDC,
    CURVE_FRAX_USDE_POOL: tokenDataByNetwork.Arbitrum.FRAXUSDe,
    CURVE_USDE_CRVUSD_POOL: tokenDataByNetwork.Arbitrum.USDecrvUSD,
    CURVE_FRAX_SDAI_POOL: tokenDataByNetwork.Arbitrum.FRAXsDAI,
    CURVE_DOLA_SUSDE_POOL: tokenDataByNetwork.Arbitrum.DOLAsUSDe,
    CURVE_DOLA_FRAXBP_POOL: tokenDataByNetwork.Arbitrum.DOLAFRAXBP3CRV_f,
    CURVE_DOLA_CRVUSD_POOL: tokenDataByNetwork.Arbitrum.crvUSDDOLA_f,
    CURVE_USDE_DAI_POOL: tokenDataByNetwork.Arbitrum.USDeDAI,
    CURVE_SDAI_SUSDE_POOL: tokenDataByNetwork.Arbitrum.MtEthena,
    CURVE_GHO_USDE_POOL: tokenDataByNetwork.Arbitrum.GHOUSDe,
    CURVE_PUFETH_WSTETH_POOL: tokenDataByNetwork.Arbitrum.pufETHwstE,
    CURVE_GHO_CRVUSD_POOL: tokenDataByNetwork.Arbitrum.GHOcrvUSD,
    CURVE_ETH_WSTETH_GATEWAY_OP: NOT_DEPLOYED,
    CURVE_EZETH_ETH_POOL: NOT_DEPLOYED,
    CURVE_EZPZ_ETH_POOL: NOT_DEPLOYED,
    CURVE_LBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_EBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_PUMPBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_TRIBTC_POOL: NOT_DEPLOYED,

    CURVE_GEAR_POOL: NOT_DEPLOYED,

    CURVE_CRVUSD_USDC_POOL: tokenDataByNetwork.Arbitrum.crvUSDUSDC,
    CURVE_CRVUSD_USDT_POOL: tokenDataByNetwork.Arbitrum.crvUSDUSDT,
    CURVE_CRVUSD_FRAX_POOL: tokenDataByNetwork.Arbitrum.crvUSDFRAX,
    CURVE_TRI_CRV_POOL: tokenDataByNetwork.Arbitrum.crvUSDETHCRV,
    CURVE_CRVUSD_SUSDE_POOL: tokenDataByNetwork.Arbitrum.crvUsUSDe,
    CURVE_LLAMA_THENA_POOL: tokenDataByNetwork.Arbitrum.llamathena,

    CURVE_RETH_ETH_POOL: NOT_DEPLOYED,
    CURVE_3CRV_POOL_OP: NOT_DEPLOYED,

    CURVE_2CRV_POOL_ARB: tokenDataByNetwork.Arbitrum["2CRV"],
    CURVE_TRICRYPTO_CRVUSD_POOL_ARB: tokenDataByNetwork.Arbitrum["3c-crvUSD"],
    CURVE_CRVUSD_USDC_POOL_ARB: tokenDataByNetwork.Arbitrum.crvUSDC,
    CURVE_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Arbitrum.crvUSDT,
    CURVE_CRVUSD_USDC_E_POOL_ARB: tokenDataByNetwork.Arbitrum.crvUSDC_e,
    CURVE_USDE_USDC_POOL_ARB: tokenDataByNetwork.Arbitrum.USDEUSDC,

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Arbitrum.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Arbitrum.yvUSDC,
    YEARN_USDC_E_VAULT: tokenDataByNetwork.Arbitrum.yvUSDC_e,
    YEARN_WETH_VAULT: tokenDataByNetwork.Arbitrum.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Arbitrum.yvWBTC,
    YEARN_USDT_VAULT: tokenDataByNetwork.Arbitrum.yvUSDT,
    YEARN_OP_VAULT: tokenDataByNetwork.Arbitrum.yvOP,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Arbitrum.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Arbitrum.yvCurve_stETH,

    /// ERC4626
    MAKER_DSR_VAULT: tokenDataByNetwork.Arbitrum.sDAI,
    YIELD_ETH_VAULT: tokenDataByNetwork.Arbitrum.YieldETH,
    STAKED_USDE_VAULT: tokenDataByNetwork.Arbitrum.sUSDe,
    STAKED_USDS_VAULT: tokenDataByNetwork.Arbitrum.sUSDS,
    SAVINGS_CRVUSD_VAULT: tokenDataByNetwork.Arbitrum.scrvUSD,

    // CONVEX
    CONVEX_BOOSTER: NOT_DEPLOYED,
    CONVEX_3CRV_POOL: NOT_DEPLOYED,
    CONVEX_FRAX_USDC_POOL: NOT_DEPLOYED,
    CONVEX_STECRV_POOL: NOT_DEPLOYED,
    CONVEX_SUSD_POOL: NOT_DEPLOYED,
    CONVEX_FRAX3CRV_POOL: NOT_DEPLOYED,
    CONVEX_LUSD3CRV_POOL: NOT_DEPLOYED,
    CONVEX_GUSD_POOL: NOT_DEPLOYED,
    CONVEX_CRVETH_POOL: NOT_DEPLOYED,
    CONVEX_CVXETH_POOL: NOT_DEPLOYED,
    CONVEX_3CRYPTO_POOL: NOT_DEPLOYED,
    CONVEX_LDOETH_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDC_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDT_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_FRAX_POOL: NOT_DEPLOYED,
    CONVEX_TRI_CRV_POOL: NOT_DEPLOYED,
    CONVEX_GHO_CRVUSD_POOL: NOT_DEPLOYED,
    CONVEX_LLAMA_THENA_POOL: NOT_DEPLOYED,

    CONVEX_BOOSTER_ARB: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
    CONVEX_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Arbitrum.cvxcrvUSDT,

    AURA_BOOSTER: "0x98Ef32edd24e2c92525E59afc4475C1242a30184",
    AURA_WEETH_RETH_POOL: tokenDataByNetwork.Arbitrum.auraweETH_rETH_vault,
    AURA_OSETH_WETH_POOL: tokenDataByNetwork.Arbitrum.auraosETH_wETH_BPT_vault,
    AURA_B_RETH_STABLE_POOL:
      tokenDataByNetwork.Arbitrum.auraB_rETH_STABLE_vault,
    AURA_BPT_RETH_ETH_POOL: tokenDataByNetwork.Arbitrum.auraBPT_rETH_ETH_vault,
    AURA_BPT_WSTETH_ETH_POOL:
      tokenDataByNetwork.Arbitrum.auraBPT_WSTETH_ETH_vault,
    AURA_RETH_WETH_POOL_ARB:
      tokenDataByNetwork.Arbitrum.aurarETH_wETH_BPT_vault,
    AURA_WSTETH_WETH_POOL_ARB:
      tokenDataByNetwork.Arbitrum.aurawstETH_WETH_BPT_vault,
    AURA_CBETH_RETH_WSTETH_POOL_ARB:
      tokenDataByNetwork.Arbitrum.auracbETH_rETH_wstETH_vault,
    AURA_WSTETH_RETH_SFRXETH_POOL_ARB:
      tokenDataByNetwork.Arbitrum.aurawstETH_rETH_sfrxETH_vault,

    // LIDO
    LIDO_STETH_GATEWAY: NOT_DEPLOYED,
    LIDO_WSTETH: NOT_DEPLOYED,

    // BALANCER
    BALANCER_VAULT: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",

    // AAVE
    AAVE_V2_LENDING_POOL: NOT_DEPLOYED,
    AAVE_V3_LENDING_POOL: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",

    AAVE_V2_DAI_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waDAI,
    AAVE_V2_USDC_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waUSDC,
    AAVE_V2_USDT_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waUSDT,
    AAVE_V2_WETH_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waWETH,

    COMPOUND_V2_DAI_POOL: tokenDataByNetwork.Arbitrum.cDAI,
    COMPOUND_V2_USDC_POOL: tokenDataByNetwork.Arbitrum.cUSDC,
    COMPOUND_V2_USDT_POOL: tokenDataByNetwork.Arbitrum.cUSDT,
    COMPOUND_V2_LINK_POOL: tokenDataByNetwork.Arbitrum.cLINK,
    COMPOUND_V2_ETH_GATEWAY: NOT_DEPLOYED,

    FLUX_USDC_POOL: tokenDataByNetwork.Arbitrum.fUSDC,
    ZIRCUIT_POOL: NOT_DEPLOYED,

    // MELLOW
    MELLOW_STEAKHOUSE_VAULT: tokenDataByNetwork.Arbitrum.steakLRT,
    MELLOW_RE7_LABS_VAULT: tokenDataByNetwork.Arbitrum.Re7LRT,
    MELLOW_AMPHOR_VAULT: tokenDataByNetwork.Arbitrum.amphrETH,
    MELLOW_RESTAKING_VAULT: tokenDataByNetwork.Arbitrum.rstETH,
    MELLOW_RENZO_VAULT: tokenDataByNetwork.Arbitrum.pzETH,

    SKY_STAKING_REWARDS: NOT_DEPLOYED,
    DAI_USDS: NOT_DEPLOYED,
  },
  //
  //
  //
  //
  //  OPTIMISM
  //
  //
  //
  //
  Optimism: {
    UNISWAP_V2_ROUTER: NOT_DEPLOYED,
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564", // UNVERIFIED!
    PANCAKESWAP_V3_ROUTER: NOT_DEPLOYED,
    SUSHISWAP_ROUTER: NOT_DEPLOYED,
    FRAXSWAP_ROUTER: "0xB9A55F455e46e8D717eEA5E47D2c449416A0437F", // UNVERIFIED!
    VELODROME_V2_ROUTER: "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
    VELODROME_CL_ROUTER: "0x0792a633F0c19c351081CF4B211F68F79bCc9676",
    CAMELOT_V3_ROUTER: NOT_DEPLOYED,
    PENDLE_ROUTER: NOT_DEPLOYED,

    // CURVE
    CURVE_3CRV_POOL_OP: "0x1337BedC9D22ecbe766dF105c9623922A27963EC",
    CURVE_3CRV_POOL: NOT_DEPLOYED,
    CURVE_FRAX_USDC_POOL: NOT_DEPLOYED,
    CURVE_STETH_GATEWAY: NOT_DEPLOYED,
    CURVE_FRAX_POOL: tokenDataByNetwork.Optimism.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Optimism.LUSD3CRV,
    CURVE_SUSD_POOL: NOT_DEPLOYED,
    CURVE_SUSD_DEPOSIT: NOT_DEPLOYED,
    CURVE_GUSD_POOL: NOT_DEPLOYED,
    CURVE_CRVETH_POOL: NOT_DEPLOYED,
    CURVE_CVXETH_POOL: NOT_DEPLOYED,
    CURVE_3CRYPTO_POOL: NOT_DEPLOYED,
    CURVE_LDOETH_POOL: NOT_DEPLOYED,
    CURVE_USDE_USDC_POOL: tokenDataByNetwork.Optimism.USDeUSDC,
    CURVE_FRAX_USDE_POOL: tokenDataByNetwork.Optimism.FRAXUSDe,
    CURVE_USDE_CRVUSD_POOL: tokenDataByNetwork.Optimism.USDecrvUSD,
    CURVE_FRAX_SDAI_POOL: tokenDataByNetwork.Optimism.FRAXsDAI,
    CURVE_DOLA_SUSDE_POOL: tokenDataByNetwork.Optimism.DOLAsUSDe,
    CURVE_DOLA_FRAXBP_POOL: tokenDataByNetwork.Optimism.DOLAFRAXBP3CRV_f,
    CURVE_DOLA_CRVUSD_POOL: tokenDataByNetwork.Optimism.crvUSDDOLA_f,
    CURVE_USDE_DAI_POOL: tokenDataByNetwork.Optimism.USDeDAI,
    CURVE_SDAI_SUSDE_POOL: tokenDataByNetwork.Optimism.MtEthena,
    CURVE_GHO_USDE_POOL: tokenDataByNetwork.Optimism.GHOUSDe,
    CURVE_PUFETH_WSTETH_POOL: tokenDataByNetwork.Optimism.pufETHwstE,
    CURVE_GHO_CRVUSD_POOL: tokenDataByNetwork.Optimism.GHOcrvUSD,
    CURVE_ETH_WSTETH_GATEWAY_OP: "0xF12057505cd8e3256d3654C0dC32BEB0c531eb77",
    CURVE_EZETH_ETH_POOL: NOT_DEPLOYED,
    CURVE_EZPZ_ETH_POOL: NOT_DEPLOYED,
    CURVE_LBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_EBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_PUMPBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_TRIBTC_POOL: NOT_DEPLOYED,

    CURVE_GEAR_POOL: NOT_DEPLOYED,

    CURVE_CRVUSD_USDC_POOL: tokenDataByNetwork.Optimism.crvUSDUSDC,
    CURVE_CRVUSD_USDT_POOL: tokenDataByNetwork.Optimism.crvUSDUSDT,
    CURVE_CRVUSD_FRAX_POOL: tokenDataByNetwork.Optimism.crvUSDFRAX,
    CURVE_TRI_CRV_POOL: tokenDataByNetwork.Optimism.crvUSDETHCRV,
    CURVE_CRVUSD_SUSDE_POOL: tokenDataByNetwork.Optimism.crvUsUSDe,
    CURVE_LLAMA_THENA_POOL: tokenDataByNetwork.Optimism.llamathena,

    CURVE_RETH_ETH_POOL: NOT_DEPLOYED,

    CURVE_2CRV_POOL_ARB: tokenDataByNetwork.Optimism["2CRV"],
    CURVE_TRICRYPTO_CRVUSD_POOL_ARB: tokenDataByNetwork.Optimism["3c-crvUSD"],
    CURVE_CRVUSD_USDC_POOL_ARB: tokenDataByNetwork.Optimism.crvUSDC,
    CURVE_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Optimism.crvUSDT,
    CURVE_CRVUSD_USDC_E_POOL_ARB: tokenDataByNetwork.Optimism.crvUSDC_e,
    CURVE_USDE_USDC_POOL_ARB: tokenDataByNetwork.Optimism.USDEUSDC,

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Optimism.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Optimism.yvUSDC,
    YEARN_USDC_E_VAULT: tokenDataByNetwork.Optimism.yvUSDC_e,
    YEARN_WETH_VAULT: tokenDataByNetwork.Optimism.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Optimism.yvWBTC,
    YEARN_USDT_VAULT: tokenDataByNetwork.Optimism.yvUSDT,
    YEARN_OP_VAULT: tokenDataByNetwork.Optimism.yvOP,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Optimism.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Optimism.yvCurve_stETH,

    /// ERC4626
    MAKER_DSR_VAULT: tokenDataByNetwork.Optimism.sDAI,
    YIELD_ETH_VAULT: tokenDataByNetwork.Optimism.YieldETH,
    STAKED_USDE_VAULT: tokenDataByNetwork.Optimism.sUSDe,
    STAKED_USDS_VAULT: tokenDataByNetwork.Optimism.sUSDS,
    SAVINGS_CRVUSD_VAULT: tokenDataByNetwork.Optimism.scrvUSD,

    // CONVEX
    CONVEX_BOOSTER: NOT_DEPLOYED,
    CONVEX_3CRV_POOL: NOT_DEPLOYED,
    CONVEX_FRAX_USDC_POOL: NOT_DEPLOYED,
    CONVEX_STECRV_POOL: NOT_DEPLOYED,
    CONVEX_SUSD_POOL: NOT_DEPLOYED,
    CONVEX_FRAX3CRV_POOL: NOT_DEPLOYED,
    CONVEX_LUSD3CRV_POOL: NOT_DEPLOYED,
    CONVEX_GUSD_POOL: NOT_DEPLOYED,
    CONVEX_CRVETH_POOL: NOT_DEPLOYED,
    CONVEX_CVXETH_POOL: NOT_DEPLOYED,
    CONVEX_3CRYPTO_POOL: NOT_DEPLOYED,
    CONVEX_LDOETH_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDC_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDT_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_FRAX_POOL: NOT_DEPLOYED,
    CONVEX_TRI_CRV_POOL: NOT_DEPLOYED,
    CONVEX_GHO_CRVUSD_POOL: NOT_DEPLOYED,
    CONVEX_LLAMA_THENA_POOL: NOT_DEPLOYED,

    CONVEX_BOOSTER_ARB: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Optimism.cvxcrvUSDT,

    // AURA
    AURA_BOOSTER: "0x98Ef32edd24e2c92525E59afc4475C1242a30184",
    AURA_WEETH_RETH_POOL: tokenDataByNetwork.Optimism.auraweETH_rETH_vault,
    AURA_OSETH_WETH_POOL: tokenDataByNetwork.Optimism.auraosETH_wETH_BPT_vault,
    AURA_B_RETH_STABLE_POOL:
      tokenDataByNetwork.Optimism.auraB_rETH_STABLE_vault,
    AURA_BPT_RETH_ETH_POOL: tokenDataByNetwork.Optimism.auraBPT_rETH_ETH_vault,
    AURA_BPT_WSTETH_ETH_POOL:
      tokenDataByNetwork.Optimism.auraBPT_WSTETH_ETH_vault,
    AURA_RETH_WETH_POOL_ARB:
      tokenDataByNetwork.Optimism.aurarETH_wETH_BPT_vault,
    AURA_WSTETH_WETH_POOL_ARB:
      tokenDataByNetwork.Optimism.aurawstETH_WETH_BPT_vault,
    AURA_CBETH_RETH_WSTETH_POOL_ARB:
      tokenDataByNetwork.Optimism.auracbETH_rETH_wstETH_vault,
    AURA_WSTETH_RETH_SFRXETH_POOL_ARB:
      tokenDataByNetwork.Optimism.aurawstETH_rETH_sfrxETH_vault,

    // LIDO
    LIDO_STETH_GATEWAY: NOT_DEPLOYED,
    LIDO_WSTETH: NOT_DEPLOYED,

    // BALANCER
    BALANCER_VAULT: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",

    // AAVE
    AAVE_V2_LENDING_POOL: NOT_DEPLOYED,
    AAVE_V3_LENDING_POOL: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",

    AAVE_V2_DAI_TOKEN_WRAPPER: tokenDataByNetwork.Optimism.waDAI,
    AAVE_V2_USDC_TOKEN_WRAPPER: tokenDataByNetwork.Optimism.waUSDC,
    AAVE_V2_USDT_TOKEN_WRAPPER: tokenDataByNetwork.Optimism.waUSDT,
    AAVE_V2_WETH_TOKEN_WRAPPER: tokenDataByNetwork.Optimism.waWETH,

    COMPOUND_V2_DAI_POOL: tokenDataByNetwork.Optimism.cDAI,
    COMPOUND_V2_USDC_POOL: tokenDataByNetwork.Optimism.cUSDC,
    COMPOUND_V2_USDT_POOL: tokenDataByNetwork.Optimism.cUSDT,
    COMPOUND_V2_LINK_POOL: tokenDataByNetwork.Optimism.cLINK,
    COMPOUND_V2_ETH_GATEWAY: NOT_DEPLOYED,

    FLUX_USDC_POOL: tokenDataByNetwork.Optimism.fUSDC,
    ZIRCUIT_POOL: NOT_DEPLOYED,

    // MELLOW
    MELLOW_STEAKHOUSE_VAULT: tokenDataByNetwork.Optimism.steakLRT,
    MELLOW_RE7_LABS_VAULT: tokenDataByNetwork.Optimism.Re7LRT,
    MELLOW_AMPHOR_VAULT: tokenDataByNetwork.Optimism.amphrETH,
    MELLOW_RESTAKING_VAULT: tokenDataByNetwork.Optimism.rstETH,
    MELLOW_RENZO_VAULT: tokenDataByNetwork.Optimism.pzETH,

    SKY_STAKING_REWARDS: NOT_DEPLOYED,
    DAI_USDS: NOT_DEPLOYED,
  },
  //
  //
  //
  //
  //  BASE
  //
  //
  //
  //
  Base: {
    UNISWAP_V2_ROUTER: NOT_DEPLOYED,
    UNISWAP_V3_ROUTER: NOT_DEPLOYED,
    PANCAKESWAP_V3_ROUTER: "0x1b81D678ffb9C0263b24A97847620C99d213eB14",
    SUSHISWAP_ROUTER: NOT_DEPLOYED,
    FRAXSWAP_ROUTER: NOT_DEPLOYED,
    VELODROME_V2_ROUTER: NOT_DEPLOYED,
    VELODROME_CL_ROUTER: NOT_DEPLOYED,
    CAMELOT_V3_ROUTER: NOT_DEPLOYED,
    PENDLE_ROUTER: NOT_DEPLOYED,

    // CURVE
    CURVE_3CRV_POOL_OP: NOT_DEPLOYED,
    CURVE_3CRV_POOL: NOT_DEPLOYED,
    CURVE_FRAX_USDC_POOL: NOT_DEPLOYED,
    CURVE_STETH_GATEWAY: NOT_DEPLOYED,
    CURVE_FRAX_POOL: tokenDataByNetwork.Base.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Base.LUSD3CRV,
    CURVE_SUSD_POOL: NOT_DEPLOYED,
    CURVE_SUSD_DEPOSIT: NOT_DEPLOYED,
    CURVE_GUSD_POOL: NOT_DEPLOYED,
    CURVE_CRVETH_POOL: NOT_DEPLOYED,
    CURVE_CVXETH_POOL: NOT_DEPLOYED,
    CURVE_3CRYPTO_POOL: NOT_DEPLOYED,
    CURVE_LDOETH_POOL: NOT_DEPLOYED,
    CURVE_USDE_USDC_POOL: tokenDataByNetwork.Base.USDeUSDC,
    CURVE_FRAX_USDE_POOL: tokenDataByNetwork.Base.FRAXUSDe,
    CURVE_USDE_CRVUSD_POOL: tokenDataByNetwork.Base.USDecrvUSD,
    CURVE_FRAX_SDAI_POOL: tokenDataByNetwork.Base.FRAXsDAI,
    CURVE_DOLA_SUSDE_POOL: tokenDataByNetwork.Base.DOLAsUSDe,
    CURVE_DOLA_FRAXBP_POOL: tokenDataByNetwork.Base.DOLAFRAXBP3CRV_f,
    CURVE_DOLA_CRVUSD_POOL: tokenDataByNetwork.Base.crvUSDDOLA_f,
    CURVE_USDE_DAI_POOL: tokenDataByNetwork.Base.USDeDAI,
    CURVE_SDAI_SUSDE_POOL: tokenDataByNetwork.Base.MtEthena,
    CURVE_PUFETH_WSTETH_POOL: tokenDataByNetwork.Base.pufETHwstE,
    CURVE_GHO_CRVUSD_POOL: tokenDataByNetwork.Base.GHOcrvUSD,
    CURVE_ETH_WSTETH_GATEWAY_OP: NOT_DEPLOYED,
    CURVE_EZETH_ETH_POOL: NOT_DEPLOYED,
    CURVE_EZPZ_ETH_POOL: NOT_DEPLOYED,
    CURVE_LBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_EBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_PUMPBTC_WBTC_POOL: NOT_DEPLOYED,
    CURVE_TRIBTC_POOL: NOT_DEPLOYED,

    CURVE_GEAR_POOL: NOT_DEPLOYED,

    CURVE_CRVUSD_USDC_POOL: tokenDataByNetwork.Base.crvUSDUSDC,
    CURVE_CRVUSD_USDT_POOL: tokenDataByNetwork.Base.crvUSDUSDT,
    CURVE_CRVUSD_FRAX_POOL: tokenDataByNetwork.Base.crvUSDFRAX,
    CURVE_TRI_CRV_POOL: tokenDataByNetwork.Base.crvUSDETHCRV,
    CURVE_CRVUSD_SUSDE_POOL: tokenDataByNetwork.Base.crvUsUSDe,
    CURVE_LLAMA_THENA_POOL: tokenDataByNetwork.Base.llamathena,

    CURVE_RETH_ETH_POOL: NOT_DEPLOYED,

    CURVE_2CRV_POOL_ARB: tokenDataByNetwork.Base["2CRV"],
    CURVE_TRICRYPTO_CRVUSD_POOL_ARB: tokenDataByNetwork.Base["3c-crvUSD"],
    CURVE_CRVUSD_USDC_POOL_ARB: tokenDataByNetwork.Base.crvUSDC,
    CURVE_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Base.crvUSDT,
    CURVE_CRVUSD_USDC_E_POOL_ARB: tokenDataByNetwork.Base.crvUSDC_e,
    CURVE_USDE_USDC_POOL_ARB: tokenDataByNetwork.Base.USDEUSDC,

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Base.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Base.yvUSDC,
    YEARN_USDC_E_VAULT: tokenDataByNetwork.Base.yvUSDC_e,
    YEARN_WETH_VAULT: tokenDataByNetwork.Base.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Base.yvWBTC,
    YEARN_USDT_VAULT: tokenDataByNetwork.Base.yvUSDT,
    YEARN_OP_VAULT: tokenDataByNetwork.Base.yvOP,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Base.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Base.yvCurve_stETH,

    /// ERC4626
    MAKER_DSR_VAULT: tokenDataByNetwork.Base.sDAI,
    YIELD_ETH_VAULT: tokenDataByNetwork.Base.YieldETH,
    STAKED_USDE_VAULT: tokenDataByNetwork.Base.sUSDe,
    STAKED_USDS_VAULT: tokenDataByNetwork.Base.sUSDS,
    SAVINGS_CRVUSD_VAULT: tokenDataByNetwork.Base.scrvUSD,

    // CONVEX
    CONVEX_BOOSTER: NOT_DEPLOYED,
    CONVEX_3CRV_POOL: NOT_DEPLOYED,
    CONVEX_FRAX_USDC_POOL: NOT_DEPLOYED,
    CONVEX_STECRV_POOL: NOT_DEPLOYED,
    CONVEX_SUSD_POOL: NOT_DEPLOYED,
    CONVEX_FRAX3CRV_POOL: NOT_DEPLOYED,
    CONVEX_LUSD3CRV_POOL: NOT_DEPLOYED,
    CONVEX_GUSD_POOL: NOT_DEPLOYED,
    CONVEX_CRVETH_POOL: NOT_DEPLOYED,
    CONVEX_CVXETH_POOL: NOT_DEPLOYED,
    CONVEX_3CRYPTO_POOL: NOT_DEPLOYED,
    CONVEX_LDOETH_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDC_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDT_POOL: NOT_DEPLOYED,
    CONVEX_CRVUSD_FRAX_POOL: NOT_DEPLOYED,
    CONVEX_TRI_CRV_POOL: NOT_DEPLOYED,
    CONVEX_GHO_CRVUSD_POOL: NOT_DEPLOYED,
    CONVEX_LLAMA_THENA_POOL: NOT_DEPLOYED,

    CONVEX_BOOSTER_ARB: NOT_DEPLOYED,
    CONVEX_CRVUSD_USDT_POOL_ARB: tokenDataByNetwork.Base.cvxcrvUSDT,

    // AURA
    AURA_BOOSTER: NOT_DEPLOYED,
    AURA_WEETH_RETH_POOL: tokenDataByNetwork.Base.auraweETH_rETH_vault,
    AURA_OSETH_WETH_POOL: tokenDataByNetwork.Base.auraosETH_wETH_BPT_vault,
    AURA_B_RETH_STABLE_POOL: tokenDataByNetwork.Base.auraB_rETH_STABLE_vault,
    AURA_BPT_RETH_ETH_POOL: tokenDataByNetwork.Base.auraBPT_rETH_ETH_vault,
    AURA_BPT_WSTETH_ETH_POOL: tokenDataByNetwork.Base.auraBPT_WSTETH_ETH_vault,
    AURA_RETH_WETH_POOL_ARB: tokenDataByNetwork.Base.aurarETH_wETH_BPT_vault,
    AURA_WSTETH_WETH_POOL_ARB:
      tokenDataByNetwork.Base.aurawstETH_WETH_BPT_vault,
    AURA_CBETH_RETH_WSTETH_POOL_ARB:
      tokenDataByNetwork.Base.auracbETH_rETH_wstETH_vault,
    AURA_WSTETH_RETH_SFRXETH_POOL_ARB:
      tokenDataByNetwork.Base.aurawstETH_rETH_sfrxETH_vault,

    // LIDO
    LIDO_STETH_GATEWAY: NOT_DEPLOYED,
    LIDO_WSTETH: NOT_DEPLOYED,

    // BALANCER
    BALANCER_VAULT: NOT_DEPLOYED,

    // GEARBOX
    UNIVERSAL_ADAPTER: NOT_DEPLOYED,

    // AAVE
    AAVE_V2_LENDING_POOL: NOT_DEPLOYED,
    AAVE_V3_LENDING_POOL: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5",

    AAVE_V2_DAI_TOKEN_WRAPPER: tokenDataByNetwork.Base.waDAI,
    AAVE_V2_USDC_TOKEN_WRAPPER: tokenDataByNetwork.Base.waUSDC,
    AAVE_V2_USDT_TOKEN_WRAPPER: tokenDataByNetwork.Base.waUSDT,
    AAVE_V2_WETH_TOKEN_WRAPPER: tokenDataByNetwork.Base.waWETH,

    COMPOUND_V2_DAI_POOL: tokenDataByNetwork.Base.cDAI,
    COMPOUND_V2_USDC_POOL: tokenDataByNetwork.Base.cUSDC,
    COMPOUND_V2_USDT_POOL: tokenDataByNetwork.Base.cUSDT,
    COMPOUND_V2_LINK_POOL: tokenDataByNetwork.Base.cLINK,
    COMPOUND_V2_ETH_GATEWAY: NOT_DEPLOYED,

    FLUX_USDC_POOL: tokenDataByNetwork.Base.fUSDC,
    CURVE_GHO_USDE_POOL: NOT_DEPLOYED,
    ZIRCUIT_POOL: NOT_DEPLOYED,

    // MELLOW
    MELLOW_STEAKHOUSE_VAULT: tokenDataByNetwork.Base.steakLRT,
    MELLOW_RE7_LABS_VAULT: tokenDataByNetwork.Base.Re7LRT,
    MELLOW_AMPHOR_VAULT: tokenDataByNetwork.Base.amphrETH,
    MELLOW_RESTAKING_VAULT: tokenDataByNetwork.Base.rstETH,
    MELLOW_RENZO_VAULT: tokenDataByNetwork.Base.pzETH,

    SKY_STAKING_REWARDS: NOT_DEPLOYED,
    DAI_USDS: NOT_DEPLOYED,
  },
};

export const UNISWAP_V3_QUOTER: Address =
  "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";
export const CAMELOT_V3_QUOTER: Address =
  "0x0Fc73040b26E9bC8514fA028D998E73A254Fa76E";
export const PANCAKESWAP_V3_QUOTER: Address =
  "0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997";
export const VELODROME_CL_QUOTER: Address =
  "0x89D8218ed5fF1e46d8dcd33fb0bbeE3be1621466";

export const VELODROME_V2_DEFAULT_FACTORY: Address =
  "0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a";

export const VELODROME_V2_CL_FACTORY: Address =
  "0xCc0bDDB707055e04e497aB22a59c2aF4391cd12F";

export const MELLOW_COLLECTOR: Address =
  "0xce8f66b5347dcfedb3e63cb2c95e4aab9a85429e";

export const PENDLE_ROUTER_STATIC_MAINNET =
  "0x263833d47eA3fA4a30f269323aba6a107f9eB14C";
export const PENDLE_ROUTER_STATIC_ARBITRUM =
  "0xAdB09F65bd90d19e3148D9ccb693F3161C6DB3E8";
export const PENDLE_ROUTER_STATIC_OPTIMISM =
  "0x704478Dd72FD7F9B83d1F1e0fc18C14B54F034d0";

export interface BaseContractParams {
  name: string;
}

export type UniswapV2Params = {
  protocol: Protocols.Uniswap | Protocols.Sushiswap | Protocols.Fraxswap;
  type: AdapterInterface.UNISWAP_V2_ROUTER;
} & BaseContractParams;

export type VelodromeV2Params = {
  protocol: Protocols.Velodrome;
  type: AdapterInterface.VELODROME_V2_ROUTER;
} & BaseContractParams;

export type PendleRouterParams = {
  protocol: Protocols.Pendle;
  type: AdapterInterface.PENDLE_ROUTER;
} & BaseContractParams;

export type UniswapV3Params = {
  protocol: Protocols.Uniswap | Protocols.Pancakeswap | Protocols.Velodrome;
  type: AdapterInterface.UNISWAP_V3_ROUTER;
  quoter: Address;
} & BaseContractParams;

export type CamelotV3Params = {
  protocol: Protocols.Camelot;
  type: AdapterInterface.CAMELOT_V3_ROUTER;
  quoter: Address;
} & BaseContractParams;

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

export type CurveSteCRVPoolParams = {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_STECRV_POOL;
  version: number;

  pool: Record<NetworkType, Address>;
  tokens: ["WETH", "STETH"] | ["WETH", "wstETH"];
  lpToken: "steCRV" | "wstETHCRV";
} & BaseContractParams;

export type CurveGEARPoolParams = {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_2ASSETS;
  version: number;

  pool: Record<NetworkType, Address>;
  tokens: ["GEAR", "WETH"];
  lpToken: "GEAR";
} & BaseContractParams;

export type YearnParams = {
  protocol: Protocols.Yearn;
  type: AdapterInterface.YEARN_V2;
  shareToken: YearnLPToken;
} & BaseContractParams;

export type ERC4626Params = {
  protocol:
    | Protocols.MakerDSR
    | Protocols.Sommelier
    | Protocols.Ethena
    | Protocols.Sky
    | Protocols.Curve;
  type: AdapterInterface.ERC4626_VAULT;
  underlying: NormalToken;
} & BaseContractParams;

export type ConvexParams = {
  protocol: Protocols.Convex;
  type: AdapterInterface.CONVEX_V1_BOOSTER;
} & BaseContractParams;

export type ConvexL2Params = {
  protocol: Protocols.Convex;
  type: AdapterInterface.CONVEX_L2_BOOSTER;
} & BaseContractParams;

export interface ConvexExtraPoolParams {
  rewardToken: NormalToken;
  poolAddress: Record<NetworkType, Address>;
}

export type ConvexPoolParams = {
  protocol: Protocols.Convex;
  type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
  stakedToken: ConvexStakedPhantomToken;
  extraRewards: Array<ConvexExtraPoolParams>;
} & BaseContractParams;

export type ConvexL2PoolParams = {
  protocol: Protocols.Convex;
  type: AdapterInterface.CONVEX_L2_REWARD_POOL;
  rewards: Array<SupportedToken>;
  extraRewards: Array<ConvexExtraPoolParams>;
} & BaseContractParams;

// AURA

export type AuraPoolParams = {
  protocol: Protocols.Aura;
  type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
  stakedToken: AuraStakedToken;
  extraRewards: Array<AuraExtraPoolParams>;
} & BaseContractParams;

export type AuraParams = {
  protocol: Protocols.Aura;
  type: AdapterInterface.CONVEX_V1_BOOSTER;
} & BaseContractParams;

export interface AuraExtraPoolParams {
  rewardToken: NormalToken;
  poolAddress: Record<NetworkType, Address>;
}

export type LidoParams = {
  protocol: Protocols.Lido;
  type: AdapterInterface.LIDO_V1;
  oracle: Record<NetworkType, Address>;
  lpToken: "steCRV";
} & BaseContractParams;

export type LidoWsthETHParams = {
  protocol: Protocols.Lido;
  type: AdapterInterface.LIDO_WSTETH_V1;
} & BaseContractParams;

export type UniversalParams = {
  protocol: Protocols.Gearbox;
  type: AdapterInterface.UNIVERSAL;
} & BaseContractParams;

export type BalancerParams = {
  protocol: Protocols.Balancer;
  type: AdapterInterface.BALANCER_VAULT;
  queries: Record<NetworkType, Address>;
} & BaseContractParams;

export type AaveV2Params = {
  protocol: Protocols.AaveV2;
  type: AdapterInterface.AAVE_V2_LENDING_POOL;
} & BaseContractParams;

export type AaveV3Params = {
  protocol: Protocols.AaveV3;
  type: AdapterInterface.AAVE_V3_LENDING_POOL;
} & BaseContractParams;

export type WrapperAaveV2Params = {
  protocol: Protocols.AaveV2;
  type: AdapterInterface.AAVE_V2_WRAPPED_ATOKEN;
  underlying: AaveV2LPToken;
} & BaseContractParams;

export type CompoundV2Params = {
  protocol: Protocols.CompoundV2 | Protocols.Flux;
  type:
    | AdapterInterface.COMPOUND_V2_CERC20
    | AdapterInterface.COMPOUND_V2_CETHER;
  underlying: NormalToken;
} & BaseContractParams;

export type ZircuitParams = {
  protocol: Protocols.Zircuit;
  type: AdapterInterface.ZIRCUIT_POOL;
} & BaseContractParams;

export type MellowVaultParams = {
  protocol: Protocols.Mellow;
  type: AdapterInterface.MELLOW_LRT_VAULT;
} & BaseContractParams;

export type StakingRewardsParams = {
  protocol: Protocols.Sky;
  type: AdapterInterface.STAKING_REWARDS;
  stakedToken: StakingRewardsPhantomToken;
} & BaseContractParams;

export type DaiUsdsParams = {
  protocol: Protocols.Sky;
  type: AdapterInterface.DAI_USDS_EXCHANGE;
} & BaseContractParams;

export type ContractParams =
  | UniswapV2Params
  | UniswapV3Params
  | CamelotV3Params
  | VelodromeV2Params
  | CurveParams
  | CurveSteCRVPoolParams
  | CurveGEARPoolParams
  | YearnParams
  | ConvexParams
  | ConvexPoolParams
  | ConvexL2Params
  | ConvexL2PoolParams
  | LidoParams
  | LidoWsthETHParams
  | UniversalParams
  | BalancerParams
  | AaveV2Params
  | AaveV3Params
  | WrapperAaveV2Params
  | CompoundV2Params
  | AuraParams
  | AuraPoolParams
  | ERC4626Params
  | ZircuitParams
  | MellowVaultParams
  | PendleRouterParams
  | StakingRewardsParams
  | DaiUsdsParams;

export const contractParams: Record<SupportedContract, ContractParams> = {
  UNISWAP_V2_ROUTER: {
    name: "Uniswap V2",
    protocol: Protocols.Uniswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER,
  },
  UNISWAP_V3_ROUTER: {
    name: "Uniswap V3",
    protocol: Protocols.Uniswap,
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UNISWAP_V3_ROUTER,
  },
  PANCAKESWAP_V3_ROUTER: {
    name: "Pancakeswap V3",
    protocol: Protocols.Pancakeswap,
    quoter: PANCAKESWAP_V3_QUOTER,
    type: AdapterInterface.UNISWAP_V3_ROUTER,
  },

  SUSHISWAP_ROUTER: {
    name: "Sushiswap",
    protocol: Protocols.Sushiswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER,
  },

  FRAXSWAP_ROUTER: {
    name: "Fraxswap",
    protocol: Protocols.Fraxswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER,
  },

  VELODROME_V2_ROUTER: {
    name: "Velodrome V2",
    protocol: Protocols.Velodrome,
    type: AdapterInterface.VELODROME_V2_ROUTER,
  },
  VELODROME_CL_ROUTER: {
    name: "Velodrome CL Router",
    protocol: Protocols.Velodrome,
    quoter: VELODROME_CL_QUOTER,
    type: AdapterInterface.UNISWAP_V3_ROUTER,
  },
  CAMELOT_V3_ROUTER: {
    name: "Camelot V3",
    protocol: Protocols.Camelot,
    type: AdapterInterface.CAMELOT_V3_ROUTER,
    quoter: CAMELOT_V3_QUOTER,
  },
  PENDLE_ROUTER: {
    name: "Pendle Router",
    protocol: Protocols.Pendle,
    type: AdapterInterface.PENDLE_ROUTER,
  },
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
    },
    tokens: ["WETH", "wstETH"],
    lpToken: "wstETHCRV",
  },
  CURVE_GEAR_POOL: {
    name: "Curve GEAR",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
    pool: {
      Mainnet: "0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2",
      Arbitrum: NOT_DEPLOYED,
      Optimism: NOT_DEPLOYED,
      Base: NOT_DEPLOYED,
    },
    tokens: ["GEAR", "WETH"],
    lpToken: "GEAR",
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
    type: AdapterInterface.CURVE_V1_2ASSETS, // NOTE: This is actually stable NG, however the old adapter is used in swap only mode before audits
    lpToken: "USDeUSDC",
    tokens: ["USDe", "USDC"],
  },

  CURVE_FRAX_USDE_POOL: {
    name: "Curve FRAXUSDe",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS, // NOTE: This is actually stable NG, however the old adapter is used in swap only mode before audits
    lpToken: "FRAXUSDe",
    tokens: ["FRAX", "USDe"],
  },

  CURVE_USDE_CRVUSD_POOL: {
    name: "Curve USDecrvUSD",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS, // NOTE: This is actually stable NG, however the old adapter is used in swap only mode before audits
    lpToken: "USDecrvUSD",
    tokens: ["USDe", "crvUSD"],
  },

  CURVE_USDE_DAI_POOL: {
    name: "Curve USDeDAI",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS, // NOTE: This is actually stable NG, however the old adapter is used in swap only mode before audits
    lpToken: "USDeDAI",
    tokens: ["USDe", "DAI"],
  },

  CURVE_SDAI_SUSDE_POOL: {
    name: "Curve MtEthena",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS, // NOTE: This is actually stable NG, however the old adapter is used in swap only mode before audits
    lpToken: "MtEthena",
    tokens: ["sDAI", "sUSDe"],
  },

  CURVE_GHO_USDE_POOL: {
    name: "Curve GHOUSDe",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS, // NOTE: This is actually stable NG, however the old adapter is used in swap only mode before audits
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

  YEARN_DAI_VAULT: {
    name: "Yearn DAI",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvDAI",
  },
  YEARN_USDC_VAULT: {
    name: "Yearn USDC",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvUSDC",
  },
  YEARN_USDC_E_VAULT: {
    name: "Yearn USDC.e",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvUSDC_e",
  },
  YEARN_WETH_VAULT: {
    name: "Yearn WETH",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvWETH",
  },
  YEARN_WBTC_VAULT: {
    name: "Yearn WBTC",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvWBTC",
  },
  YEARN_USDT_VAULT: {
    name: "Yearn USDT",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvUSDT",
  },
  YEARN_OP_VAULT: {
    name: "Yearn OP",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvOP",
  },
  YEARN_CURVE_FRAX_VAULT: {
    name: "Yearn Curve FRAX",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvCurve_FRAX",
  },
  YEARN_CURVE_STETH_VAULT: {
    name: "Yearn Curve STETH",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2,
    shareToken: "yvCurve_stETH",
  },
  MAKER_DSR_VAULT: {
    name: "Maker DSR ERC4626 Vault",
    protocol: Protocols.MakerDSR,
    type: AdapterInterface.ERC4626_VAULT,
    underlying: "DAI",
  },
  YIELD_ETH_VAULT: {
    name: "Sommelier YieldETH",
    protocol: Protocols.Sommelier,
    type: AdapterInterface.ERC4626_VAULT,
    underlying: "WETH",
  },
  STAKED_USDE_VAULT: {
    name: "Ethena Staked USDe Vault",
    protocol: Protocols.Ethena,
    type: AdapterInterface.ERC4626_VAULT,
    underlying: "USDe",
  },
  STAKED_USDS_VAULT: {
    name: "Sky Staked USDS Vault",
    protocol: Protocols.Sky,
    type: AdapterInterface.ERC4626_VAULT,
    underlying: "USDS",
  },
  SAVINGS_CRVUSD_VAULT: {
    name: "Savings crvUSD Vault",
    protocol: Protocols.Curve,
    type: AdapterInterface.ERC4626_VAULT,
    underlying: "crvUSD",
  },
  CONVEX_BOOSTER: {
    name: "Convex BOOSTER",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BOOSTER,
  },

  CONVEX_3CRV_POOL: {
    name: "Convex 3crv",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvx3Crv",
    extraRewards: [],
  },
  CONVEX_FRAX_USDC_POOL: {
    name: "Convex FRAXUSDC",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvFRAX",
    extraRewards: [],
  },
  CONVEX_GUSD_POOL: {
    name: "Convex GUSD",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxgusd3CRV",
    extraRewards: [],
  },
  CONVEX_SUSD_POOL: {
    name: "Convex SUSD",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvPlain3andSUSD",
    extraRewards: [
      {
        rewardToken: "SNX",
        poolAddress: {
          Mainnet: "0x81fCe3E10D12Da6c7266a1A169c4C96813435263",
          Arbitrum: NOT_DEPLOYED, // CONVEX_SUSD_POOL_EXTRA_SNX
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_STECRV_POOL: {
    name: "Convex STECRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxsteCRV",
    extraRewards: [
      {
        rewardToken: "LDO",
        poolAddress: {
          Mainnet: "0x008aEa5036b819B4FEAEd10b2190FBb3954981E8",
          Arbitrum: NOT_DEPLOYED, // CONVEX_STECRV_POOL_EXTRA_LDO
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_FRAX3CRV_POOL: {
    name: "Convex FRAX3CRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxFRAX3CRV",
    extraRewards: [
      {
        rewardToken: "FXS",
        poolAddress: {
          Mainnet: "0xcDEC6714eB482f28f4889A0c122868450CDBF0b0",
          Arbitrum: NOT_DEPLOYED, // CONVEX_FRAX3CRV_POOL_EXTRA_FXS
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_LUSD3CRV_POOL: {
    name: "Convex LUSD3CRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxLUSD3CRV",
    extraRewards: [
      {
        rewardToken: "LQTY",
        poolAddress: {
          Mainnet: "0x55d59b791f06dc519B176791c4E037E8Cf2f6361",
          Arbitrum: NOT_DEPLOYED, // CONVEX_LUSD3CRV_POOL_EXTRA_LQTY
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  CONVEX_CRVETH_POOL: {
    name: "Convex crvCRVETH",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvCRVETH",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0xE1eCBB4181378E2346EAC90Eb5606c01Aa08f052",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_CVXETH_POOL: {
    name: "Convex crvCVXETH",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvCVXETH",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0x834B9147Fd23bF131644aBC6e557Daf99C5cDa15",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_3CRYPTO_POOL: {
    name: "Convex 3Crypto",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvUSDTWBTCWETH",
    extraRewards: [],
  },
  CONVEX_LDOETH_POOL: {
    name: "Convex LDOETH",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxLDOETH",
    extraRewards: [
      {
        rewardToken: "LDO",
        poolAddress: {
          Mainnet: "0x95e6092449a0f3946A5a0f308Ead4adcff244E2B",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_CRVUSD_USDC_POOL: {
    name: "Convex crvUSDUSDC",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvUSDUSDC",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0xac183F7cd62d5b04Fa40362EB67249A80339541A",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_CRVUSD_USDT_POOL: {
    name: "Convex crvUSDUSDT",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvUSDUSDT",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0xD490178B568b07c6DDbDfBBfaF9043772209Ec01",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_CRVUSD_FRAX_POOL: {
    name: "Convex crvUSDFRAX",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvUSDFRAX",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0x749cFfCb53e008841d7387ba37f9284BDeCEe0A9",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_TRI_CRV_POOL: {
    name: "Convex TRICRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvUSDETHCRV",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0x01eC96F1eEBF470E3fEAEEfB843fbC63424e668d",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_GHO_CRVUSD_POOL: {
    name: "Convex GHOcrvUSD",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxGHOcrvUSD",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0xE7cC925739E41E2A03A53770F5E9Ed43afe13993",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  CONVEX_LLAMA_THENA_POOL: {
    name: "Convex todo",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxllamathena",
    extraRewards: [
      {
        rewardToken: "CVX",
        poolAddress: {
          Mainnet: "0xc66844E5788b7d7D6DFFa5EC1Db62d898c59D6e7",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  CONVEX_BOOSTER_ARB: {
    name: "Convex Booster (Arbitrum)",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_L2_BOOSTER,
  },

  CONVEX_CRVUSD_USDT_POOL_ARB: {
    name: "Convex crvUSDT Pool",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_L2_REWARD_POOL,
    rewards: ["CRV", "CVX", "crvUSD", "ARB"],
    extraRewards: [],
  },

  AURA_BOOSTER: {
    name: "Aura BOOSTER",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BOOSTER,
  },

  AURA_B_RETH_STABLE_POOL: {
    name: "Balancer rETH Stable Pool Aura Deposit",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "auraB_rETH_STABLE_vault",
    extraRewards: [
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: "0xf66a72886749c96b18526E8E124cC2e18b7c72D2",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  AURA_WEETH_RETH_POOL: {
    name: "Balancer weETH-rETH Stable Pool Aura Deposit",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "auraweETH_rETH_vault",
    extraRewards: [
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: "0x25d22C5191C67D63AAB70a37FAe06e1c1E1a830F",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  AURA_OSETH_WETH_POOL: {
    name: "Balancer osETH-WETH Stable Pool Aura Deposit",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "auraosETH_wETH_BPT_vault",
    extraRewards: [
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: "0x62e6D8dAe7089C8F2f2a5C328c710aa1788742fb",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "SWISE",
        poolAddress: {
          Mainnet: "0xC5E75ccd4d40e2Fb280f008f8AFB5EF3415EFA72",
          Arbitrum: NOT_DEPLOYED,
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  AURA_BPT_RETH_ETH_POOL: {
    name: "BeethovenX rETH-ETH Pool Aura Deposit",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "auraBPT_rETH_ETH_vault",
    extraRewards: [
      {
        rewardToken: "OP",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: NOT_DEPLOYED,
          Optimism: "0x0A22Ae9D9D149C14f6c15A235e715bB6C1Cfa739",
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: NOT_DEPLOYED,
          Optimism: "0x81673Cdd00c2839440f31575cCFa5B6ca4a87B2B",
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  AURA_BPT_WSTETH_ETH_POOL: {
    name: "BeethovenX wstETH-ETH Pool Aura Deposit",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "auraBPT_WSTETH_ETH_vault",
    extraRewards: [
      {
        rewardToken: "OP",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: NOT_DEPLOYED,
          Optimism: "0x903d716fe68e7e091eCC43AA93c0F8cfD7e7BC0a",
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: NOT_DEPLOYED,
          Optimism: "0xb0709c230C06BE6e2A84b2Ba877094EB9a4fA014",
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  AURA_WSTETH_WETH_POOL_ARB: {
    name: "Balancer (Arbitrum) wstETH-WETH Aura Vault",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "aurawstETH_WETH_BPT_vault",
    extraRewards: [
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0xC0353d05D3F2b6e14E36c5d3B4bF8d179890A001",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "ARB",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0x3a0beff39E243453960aD1198Fc3aAabdBDDe56C",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  AURA_WSTETH_RETH_SFRXETH_POOL_ARB: {
    name: "Balancer (Arbitrum) wstETH-rETH-sfrxETH Aura Vault",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "aurawstETH_rETH_sfrxETH_vault",
    extraRewards: [
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0x5901ce1c3Bf6C97fC49ED0fF08A88a57ea6E4Ca4",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "ARB",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0x4601Ec46A285714e6F2A9466DA7f2BcB33646391",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  AURA_CBETH_RETH_WSTETH_POOL_ARB: {
    name: "Balancer (Arbitrum) wstETH-rETH-cbETH Aura Vault",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "auracbETH_rETH_wstETH_vault",
    extraRewards: [
      {
        rewardToken: "ARB",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0xf0dcb30811228bED2b87b2753fabAfe80A9D0fb9",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0xE42D389058D820177b83E2863FEb13733d6Dd5f2",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },
  AURA_RETH_WETH_POOL_ARB: {
    name: "Balancer (Arbitrum) rETH-WETH Aura Vault",
    protocol: Protocols.Aura,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "aurarETH_wETH_BPT_vault",
    extraRewards: [
      {
        rewardToken: "AURA",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0xeA270927C226454452DDF80e24a02087D0D7089F",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
      {
        rewardToken: "ARB",
        poolAddress: {
          Mainnet: NOT_DEPLOYED,
          Arbitrum: "0xB05Dc0b460Ca3ed5174b33A7dA2104388764F62D",
          Optimism: NOT_DEPLOYED,
          Base: NOT_DEPLOYED,
        },
      },
    ],
  },

  LIDO_STETH_GATEWAY: {
    name: "Lido STETH",
    protocol: Protocols.Lido,
    type: AdapterInterface.LIDO_V1,
    oracle: {
      Mainnet: "0x442af784A788A5bd6F42A01Ebe9F287a871243fb",
      Arbitrum: NOT_DEPLOYED, // LIDO_ORACLE
      Optimism: NOT_DEPLOYED,
      Base: NOT_DEPLOYED,
    },
    lpToken: "steCRV",
  },

  LIDO_WSTETH: {
    name: "Lido wstETH",
    protocol: Protocols.Lido,
    type: AdapterInterface.LIDO_WSTETH_V1,
  },

  UNIVERSAL_ADAPTER: {
    name: "Gearbox universal adapter",
    protocol: Protocols.Gearbox,
    type: AdapterInterface.UNIVERSAL,
  },

  BALANCER_VAULT: {
    name: "Balancer Vault",
    protocol: Protocols.Balancer,
    type: AdapterInterface.BALANCER_VAULT,
    queries: {
      Mainnet: "0xE39B5e3B6D74016b2F6A9673D7d7493B6DF549d5",
      Arbitrum: "0xE39B5e3B6D74016b2F6A9673D7d7493B6DF549d5",
      Optimism: "0xE39B5e3B6D74016b2F6A9673D7d7493B6DF549d5",
      Base: NOT_DEPLOYED,
    },
  },
  AAVE_V2_LENDING_POOL: {
    name: "Aave V2 Lending Pool",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_LENDING_POOL,
  },
  AAVE_V2_DAI_TOKEN_WRAPPER: {
    name: "Aave V2 DAI Token Wrapper",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_WRAPPED_ATOKEN,
    underlying: "aDAI",
  },
  AAVE_V2_USDC_TOKEN_WRAPPER: {
    name: "Aave V2 USDC Token Wrapper",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_WRAPPED_ATOKEN,
    underlying: "aUSDC",
  },
  AAVE_V2_USDT_TOKEN_WRAPPER: {
    name: "Aave V2 USDT Token Wrapper",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_WRAPPED_ATOKEN,
    underlying: "aUSDT",
  },
  AAVE_V2_WETH_TOKEN_WRAPPER: {
    name: "Aave V2 WETH Token Wrapper",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_WRAPPED_ATOKEN,
    underlying: "aWETH",
  },
  AAVE_V3_LENDING_POOL: {
    name: "Aave V3 Lending Pool",
    protocol: Protocols.AaveV3,
    type: AdapterInterface.AAVE_V3_LENDING_POOL,
  },
  COMPOUND_V2_DAI_POOL: {
    name: "Compound V2 DAI",
    protocol: Protocols.CompoundV2,
    type: AdapterInterface.COMPOUND_V2_CERC20,
    underlying: "DAI",
  },
  COMPOUND_V2_USDC_POOL: {
    name: "Compound V2 DAI",
    protocol: Protocols.CompoundV2,
    type: AdapterInterface.COMPOUND_V2_CERC20,
    underlying: "USDT",
  },
  COMPOUND_V2_USDT_POOL: {
    name: "Compound V2 DAI",
    protocol: Protocols.CompoundV2,
    type: AdapterInterface.COMPOUND_V2_CERC20,
    underlying: "USDT",
  },
  COMPOUND_V2_LINK_POOL: {
    name: "Compound V2 LINK",
    protocol: Protocols.CompoundV2,
    type: AdapterInterface.COMPOUND_V2_CERC20,
    underlying: "LINK",
  },
  COMPOUND_V2_ETH_GATEWAY: {
    name: "Compound V2 ETH",
    protocol: Protocols.CompoundV2,
    type: AdapterInterface.COMPOUND_V2_CETHER,
    underlying: "WETH",
  },
  FLUX_USDC_POOL: {
    name: "Flux USDC",
    protocol: Protocols.Flux,
    type: AdapterInterface.COMPOUND_V2_CERC20,
    underlying: "USDC",
  },
  ZIRCUIT_POOL: {
    name: "Zircuit staking pool",
    protocol: Protocols.Zircuit,
    type: AdapterInterface.ZIRCUIT_POOL,
  },
  MELLOW_STEAKHOUSE_VAULT: {
    name: "Mellow Steakhouse steakLRT vault",
    protocol: Protocols.Mellow,
    type: AdapterInterface.MELLOW_LRT_VAULT,
  },
  MELLOW_RE7_LABS_VAULT: {
    name: "Mellow Re7 Labs Re7LRT vault",
    protocol: Protocols.Mellow,
    type: AdapterInterface.MELLOW_LRT_VAULT,
  },
  MELLOW_AMPHOR_VAULT: {
    name: "Mellow Amphor amphrETH vault",
    protocol: Protocols.Mellow,
    type: AdapterInterface.MELLOW_LRT_VAULT,
  },
  MELLOW_RESTAKING_VAULT: {
    name: "Mellow Restaking rstETH vault",
    protocol: Protocols.Mellow,
    type: AdapterInterface.MELLOW_LRT_VAULT,
  },
  MELLOW_RENZO_VAULT: {
    name: "Mellow Renzo pzETH vault",
    protocol: Protocols.Mellow,
    type: AdapterInterface.MELLOW_LRT_VAULT,
  },
  SKY_STAKING_REWARDS: {
    name: "Sky StakingRewards contract",
    protocol: Protocols.Sky,
    type: AdapterInterface.STAKING_REWARDS,
    stakedToken: "stkUSDS",
  },
  DAI_USDS: {
    name: "DAI/USDS Exchange",
    protocol: Protocols.Sky,
    type: AdapterInterface.DAI_USDS_EXCHANGE,
  },
};

export const contractsByAddress = Object.entries(contractsByNetwork).reduce<
  Record<string, SupportedContract>
>(
  (acc, [, contracts]) => ({
    ...acc,
    ...Object.fromEntries(
      Object.entries(contracts)
        .map(([k, v]) => [v.toLowerCase(), k])
        .filter(k => !!k) as Array<[string, SupportedContract]>,
    ),
  }),
  {},
);

export const isSupportedContract = (t: unknown): t is SupportedContract =>
  typeof t === "string" && !!contractParams[t as SupportedContract];
