/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */
import { NetworkType } from "../core/chains";
import { NOT_DEPLOYED } from "../core/constants";
import { AaveV2LPToken } from "../tokens/aave";
import { ConvexStakedPhantomToken } from "../tokens/convex";
import type { CurveLPToken } from "../tokens/curveLP";
import { NormalToken } from "../tokens/normal";
import { tokenDataByNetwork } from "../tokens/token";
import type { YearnLPToken } from "../tokens/yearn";
import { TypedObjectUtils } from "../utils/mappers";
import { AdapterInterface } from "./adapters";
import { Protocols } from "./protocols";

export type UniswapV2Contract = "UNISWAP_V2_ROUTER" | "SUSHISWAP_ROUTER";

export type CurvePoolContract =
  | "CURVE_3CRV_POOL"
  | "CURVE_FRAX_USDC_POOL"
  | "CURVE_STETH_GATEWAY"
  | "CURVE_FRAX_POOL"
  | "CURVE_LUSD_POOL"
  | "CURVE_GUSD_POOL"
  | "CURVE_SUSD_POOL"
  | "CURVE_SUSD_DEPOSIT"
  | "CURVE_OHMFRAXBP_POOL"
  | "CURVE_CRVETH_POOL"
  | "CURVE_CVXETH_POOL"
  | "CURVE_3CRYPTO_POOL"
  | "CURVE_MIM_POOL"
  | "CURVE_LDOETH_POOL"
  | "CURVE_CRVUSD_USDC_POOL"
  | "CURVE_CRVUSD_USDT_POOL"
  | "CURVE_CRVUSD_FRAX_POOL"
  | "CURVE_TRI_CRV_POOL";

export type YearnVaultContract =
  | "YEARN_DAI_VAULT"
  | "YEARN_USDC_VAULT"
  | "YEARN_WETH_VAULT"
  | "YEARN_WBTC_VAULT"
  | "YEARN_CURVE_FRAX_VAULT"
  | "YEARN_CURVE_STETH_VAULT";

export type ConvexPoolContract =
  | "CONVEX_3CRV_POOL"
  | "CONVEX_FRAX_USDC_POOL"
  | "CONVEX_GUSD_POOL"
  | "CONVEX_SUSD_POOL"
  | "CONVEX_STECRV_POOL"
  | "CONVEX_FRAX3CRV_POOL"
  | "CONVEX_LUSD3CRV_POOL"
  | "CONVEX_OHMFRAXBP_POOL"
  | "CONVEX_MIM3CRV_POOL"
  | "CONVEX_CRVETH_POOL"
  | "CONVEX_CVXETH_POOL"
  | "CONVEX_3CRYPTO_POOL"
  | "CONVEX_LDOETH_POOL";

export type AaveV2PoolContract =
  | "AAVE_V2_DAI_POOL"
  | "AAVE_V2_USDC_POOL"
  | "AAVE_V2_USDT_POOL"
  | "AAVE_V2_WETH_POOL";

export type AaveV2TokenWrapperContract =
  | "AAVE_V2_DAI_TOKEN_WRAPPER"
  | "AAVE_V2_USDC_TOKEN_WRAPPER"
  | "AAVE_V2_USDT_TOKEN_WRAPPER"
  | "AAVE_V2_WETH_TOKEN_WRAPPER";

export type CompoundV2PoolContract =
  | "COMPOUND_V2_DAI_POOL"
  | "COMPOUND_V2_USDC_POOL"
  | "COMPOUND_V2_USDT_POOL"
  | "COMPOUND_V2_ETH_POOL"
  | "COMPOUND_V2_LINK_POOL";

export type SupportedContract =
  | UniswapV2Contract
  | "UNISWAP_V3_ROUTER"
  | CurvePoolContract
  | "CURVE_GEAR_POOL"
  | YearnVaultContract
  | "CONVEX_BOOSTER"
  | ConvexPoolContract
  | "CONVEX_CLAIM_ZAP"
  | "LIDO_STETH_GATEWAY"
  | "LIDO_WSTETH"
  | "UNIVERSAL_ADAPTER"
  | "BALANCER_VAULT"
  | AaveV2PoolContract
  | AaveV2TokenWrapperContract
  | CompoundV2PoolContract;

export const contractsByNetwork: Record<
  NetworkType,
  Record<SupportedContract, string>
> = {
  Mainnet: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",

    // CURVE
    CURVE_3CRV_POOL: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", // SEPARATE TOKEN
    CURVE_FRAX_USDC_POOL: "0xDcEF968d416a41Cdac0ED8702fAC8128A64241A2",
    CURVE_STETH_GATEWAY: "0xEf0D72C594b28252BF7Ea2bfbF098792430815b1", // SEPARATE TOKEN
    CURVE_FRAX_POOL: tokenDataByNetwork.Mainnet.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Mainnet.LUSD3CRV,
    CURVE_SUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD", // SEPARATE TOKEN
    CURVE_SUSD_DEPOSIT: "0xFCBa3E75865d2d561BE8D220616520c171F12851",
    CURVE_GUSD_POOL: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956", // SEPARATE TOKEN
    CURVE_MIM_POOL: tokenDataByNetwork.Mainnet.MIM_3LP3CRV,
    CURVE_OHMFRAXBP_POOL: "0xFc1e8bf3E81383Ef07Be24c3FD146745719DE48D",
    CURVE_CRVETH_POOL: "0x8301AE4fc9c624d1D396cbDAa1ed877821D7C511",
    CURVE_CVXETH_POOL: "0xB576491F1E6e5E62f1d8F26062Ee822B40B0E0d4",
    CURVE_3CRYPTO_POOL: tokenDataByNetwork.Mainnet.crvUSDTWBTCWETH,
    CURVE_LDOETH_POOL: "0x9409280DC1e6D33AB7A8C6EC03e5763FB61772B5",

    CURVE_GEAR_POOL: "0x0E9B5B092caD6F1c5E6bc7f89Ffe1abb5c95F1C2",

    CURVE_CRVUSD_USDC_POOL: tokenDataByNetwork.Mainnet.crvUSDUSDC,
    CURVE_CRVUSD_USDT_POOL: tokenDataByNetwork.Mainnet.crvUSDUSDT,
    CURVE_CRVUSD_FRAX_POOL: tokenDataByNetwork.Mainnet.crvUSDFRAX,
    CURVE_TRI_CRV_POOL: tokenDataByNetwork.Mainnet.crvUSDETHCRV,

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Mainnet.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Mainnet.yvUSDC,
    YEARN_WETH_VAULT: tokenDataByNetwork.Mainnet.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Mainnet.yvWBTC,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Mainnet.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Mainnet.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
    CONVEX_3CRV_POOL: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8",
    CONVEX_FRAX_USDC_POOL: "0x7e880867363A7e321f5d260Cade2B0Bb2F717B02",
    CONVEX_GUSD_POOL: "0x7A7bBf95C44b144979360C3300B54A7D34b44985",
    CONVEX_SUSD_POOL: "0x22eE18aca7F3Ee920D01F25dA85840D12d98E8Ca",
    CONVEX_STECRV_POOL: "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03",
    CONVEX_FRAX3CRV_POOL: "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e",
    CONVEX_LUSD3CRV_POOL: "0x2ad92A7aE036a038ff02B96c88de868ddf3f8190",
    CONVEX_CLAIM_ZAP: "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070",
    CONVEX_OHMFRAXBP_POOL: "0x27A8c58e3DE84280826d615D80ddb33930383fE9",
    CONVEX_MIM3CRV_POOL: "0xFd5AbF66b003881b88567EB9Ed9c651F14Dc4771",
    CONVEX_CRVETH_POOL: "0x085A2054c51eA5c91dbF7f90d65e728c0f2A270f",
    CONVEX_CVXETH_POOL: "0xb1Fb0BA0676A1fFA83882c7F4805408bA232C1fA",
    CONVEX_3CRYPTO_POOL: "0xb05262D4aaAA38D0Af4AaB244D446ebDb5afd4A7",
    CONVEX_LDOETH_POOL: "0x8CA990E954611E5E3d2cc51C013fCC372c8c1D38",

    // LIDO
    LIDO_STETH_GATEWAY: "0x6f4b4aB5142787c05b7aB9A9692A0f46b997C29D",
    LIDO_WSTETH: tokenDataByNetwork.Mainnet.wstETH,

    // BALANCER
    BALANCER_VAULT: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",

    // AAVE
    AAVE_V2_DAI_POOL: NOT_DEPLOYED,
    AAVE_V2_USDC_POOL: NOT_DEPLOYED,
    AAVE_V2_USDT_POOL: NOT_DEPLOYED,
    AAVE_V2_WETH_POOL: NOT_DEPLOYED,

    AAVE_V2_DAI_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waDAI,
    AAVE_V2_USDC_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waUSDC,
    AAVE_V2_USDT_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waUSDT,
    AAVE_V2_WETH_TOKEN_WRAPPER: tokenDataByNetwork.Mainnet.waWETH,

    COMPOUND_V2_DAI_POOL: tokenDataByNetwork.Mainnet.cDAI,
    COMPOUND_V2_USDC_POOL: tokenDataByNetwork.Mainnet.cUSDC,
    COMPOUND_V2_USDT_POOL: tokenDataByNetwork.Mainnet.cUSDT,
    COMPOUND_V2_LINK_POOL: tokenDataByNetwork.Mainnet.cLINK,
    COMPOUND_V2_ETH_POOL: tokenDataByNetwork.Mainnet.cETH,
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
    UNISWAP_V3_ROUTER: NOT_DEPLOYED,
    SUSHISWAP_ROUTER: NOT_DEPLOYED,

    // CURVE
    CURVE_3CRV_POOL: NOT_DEPLOYED,
    CURVE_FRAX_USDC_POOL: NOT_DEPLOYED,
    CURVE_STETH_GATEWAY: NOT_DEPLOYED,
    CURVE_FRAX_POOL: tokenDataByNetwork.Arbitrum.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Arbitrum.LUSD3CRV,
    CURVE_SUSD_POOL: NOT_DEPLOYED,
    CURVE_SUSD_DEPOSIT: NOT_DEPLOYED,
    CURVE_GUSD_POOL: NOT_DEPLOYED,
    CURVE_MIM_POOL: tokenDataByNetwork.Arbitrum.MIM_3LP3CRV,
    CURVE_OHMFRAXBP_POOL: NOT_DEPLOYED,
    CURVE_CRVETH_POOL: NOT_DEPLOYED,
    CURVE_CVXETH_POOL: NOT_DEPLOYED,
    CURVE_3CRYPTO_POOL: NOT_DEPLOYED,
    CURVE_LDOETH_POOL: NOT_DEPLOYED,

    CURVE_GEAR_POOL: NOT_DEPLOYED,

    CURVE_CRVUSD_USDC_POOL: tokenDataByNetwork.Mainnet.crvUSDUSDC,
    CURVE_CRVUSD_USDT_POOL: tokenDataByNetwork.Mainnet.crvUSDUSDT,
    CURVE_CRVUSD_FRAX_POOL: tokenDataByNetwork.Mainnet.crvUSDFRAX,
    CURVE_TRI_CRV_POOL: tokenDataByNetwork.Mainnet.crvUSDETHCRV,

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Arbitrum.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Arbitrum.yvUSDC,
    YEARN_WETH_VAULT: tokenDataByNetwork.Arbitrum.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Arbitrum.yvWBTC,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Arbitrum.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Arbitrum.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: NOT_DEPLOYED,
    CONVEX_3CRV_POOL: NOT_DEPLOYED,
    CONVEX_FRAX_USDC_POOL: NOT_DEPLOYED,
    CONVEX_STECRV_POOL: NOT_DEPLOYED,
    CONVEX_SUSD_POOL: NOT_DEPLOYED,
    CONVEX_FRAX3CRV_POOL: NOT_DEPLOYED,
    CONVEX_LUSD3CRV_POOL: NOT_DEPLOYED,
    CONVEX_GUSD_POOL: NOT_DEPLOYED,
    CONVEX_CLAIM_ZAP: NOT_DEPLOYED,
    CONVEX_OHMFRAXBP_POOL: NOT_DEPLOYED,
    CONVEX_MIM3CRV_POOL: NOT_DEPLOYED,
    CONVEX_CRVETH_POOL: NOT_DEPLOYED,
    CONVEX_CVXETH_POOL: NOT_DEPLOYED,
    CONVEX_3CRYPTO_POOL: NOT_DEPLOYED,
    CONVEX_LDOETH_POOL: NOT_DEPLOYED,

    // LIDO
    LIDO_STETH_GATEWAY: NOT_DEPLOYED,
    LIDO_WSTETH: tokenDataByNetwork.Arbitrum.wstETH,

    // BALANCER
    BALANCER_VAULT: NOT_DEPLOYED,

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",

    // AAVE
    AAVE_V2_DAI_POOL: NOT_DEPLOYED,
    AAVE_V2_USDC_POOL: NOT_DEPLOYED,
    AAVE_V2_USDT_POOL: NOT_DEPLOYED,
    AAVE_V2_WETH_POOL: NOT_DEPLOYED,

    AAVE_V2_DAI_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waDAI,
    AAVE_V2_USDC_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waUSDC,
    AAVE_V2_USDT_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waUSDT,
    AAVE_V2_WETH_TOKEN_WRAPPER: tokenDataByNetwork.Arbitrum.waWETH,

    COMPOUND_V2_DAI_POOL: tokenDataByNetwork.Arbitrum.cDAI,
    COMPOUND_V2_USDC_POOL: tokenDataByNetwork.Arbitrum.cUSDC,
    COMPOUND_V2_USDT_POOL: tokenDataByNetwork.Arbitrum.cUSDT,
    COMPOUND_V2_LINK_POOL: tokenDataByNetwork.Mainnet.cLINK,
    COMPOUND_V2_ETH_POOL: tokenDataByNetwork.Arbitrum.cETH,
  },
};

export const UNISWAP_V3_QUOTER = NOT_DEPLOYED;

export interface BaseContractParams {
  name: string;
}

type UniswapV2Params = {
  protocol: Protocols.Uniswap | Protocols.Sushiswap;
  type: AdapterInterface.UNISWAP_V2_ROUTER;
} & BaseContractParams;

type UniswapV3Params = {
  protocol: Protocols.Uniswap;
  type: AdapterInterface.UNISWAP_V3_ROUTER;
} & BaseContractParams;

export type CurveParams = {
  protocol: Protocols.Curve;
  type:
    | AdapterInterface.CURVE_V1_2ASSETS
    | AdapterInterface.CURVE_V1_3ASSETS
    | AdapterInterface.CURVE_V1_4ASSETS
    | AdapterInterface.CURVE_V1_WRAPPER;
  version: number;
  lpToken: CurveLPToken;
  tokens: Array<NormalToken | CurveLPToken>;
  underlyings?: Array<NormalToken>;
} & BaseContractParams;

export type CurveSteCRVPoolParams = {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_STECRV_POOL;
  version: number;

  tokens: ["WETH", "STETH"];
  lpToken: "steCRV";
} & BaseContractParams;

export type CurveGEARPoolParams = {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_2ASSETS;
  version: number;

  tokens: ["GEAR", "WETH"];
  lpToken: "GEAR";
} & BaseContractParams;

export type YearnParams = {
  protocol: Protocols.Yearn;
  type: AdapterInterface.YEARN_V2;
  shareToken: YearnLPToken;
} & BaseContractParams;

type ConvexParams = {
  protocol: Protocols.Convex;
  type:
    | AdapterInterface.CONVEX_V1_BOOSTER
    | AdapterInterface.CONVEX_V1_CLAIM_ZAP;
} & BaseContractParams;

interface ConvexExtraPoolParams {
  rewardToken: NormalToken;
  poolAddress: Record<NetworkType, string>;
}

export type ConvexPoolParams = {
  protocol: Protocols.Convex;
  type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
  stakedToken: ConvexStakedPhantomToken;
  extraRewards: Array<ConvexExtraPoolParams>;
} & BaseContractParams;

export type LidoParams = {
  protocol: Protocols.Lido;
  type: AdapterInterface.LIDO_V1;
  oracle: Record<NetworkType, string>;
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
} & BaseContractParams;

export type AaveV2Params = {
  protocol: Protocols.AaveV2;
  type: AdapterInterface.AAVE_V2_LENDING_POOL;
  underlying: NormalToken;
} & BaseContractParams;

export type WrapperAaveV2Params = {
  protocol: Protocols.AaveV2;
  type: AdapterInterface.AAVE_V2_WRAPPED_ATOKEN;
  underlying: AaveV2LPToken;
} & BaseContractParams;

export type CompoundV2Params = {
  protocol: Protocols.CompoundV2;
  type:
    | AdapterInterface.COMPOUND_V2_CERC20
    | AdapterInterface.COMPOUND_V2_CETHER;
  underlying: NormalToken;
} & BaseContractParams;

export type ContractParams =
  | UniswapV2Params
  | UniswapV3Params
  | CurveParams
  | CurveSteCRVPoolParams
  | CurveGEARPoolParams
  | YearnParams
  | ConvexParams
  | ConvexPoolParams
  | LidoParams
  | LidoWsthETHParams
  | UniversalParams
  | BalancerParams
  | AaveV2Params
  | WrapperAaveV2Params
  | CompoundV2Params;

export const contractParams: Record<SupportedContract, ContractParams> = {
  UNISWAP_V2_ROUTER: {
    name: "Uniswap V2",
    protocol: Protocols.Uniswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER,
  },
  UNISWAP_V3_ROUTER: {
    name: "Uniswap V3",
    protocol: Protocols.Uniswap,
    type: AdapterInterface.UNISWAP_V3_ROUTER,
  },

  SUSHISWAP_ROUTER: {
    name: "Sushiswap",
    protocol: Protocols.Sushiswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER,
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
    tokens: ["WETH", "STETH"],
    lpToken: "steCRV",
  },
  CURVE_GEAR_POOL: {
    name: "Curve GEAR",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
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
  CURVE_MIM_POOL: {
    name: "Curve MIM",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 10,
    lpToken: "MIM_3LP3CRV",
    tokens: ["MIM", "3Crv"],
    underlyings: ["MIM", "DAI", "USDC", "USDT"],
  },

  CURVE_OHMFRAXBP_POOL: {
    name: "Curve OHM_FRAXBP",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    version: 20,
    lpToken: "OHMFRAXBP",
    tokens: ["OHM", "crvFRAX"],
    underlyings: ["OHM", "FRAX", "USDC"],
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
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUSDUSDC",
    tokens: ["crvUSD", "USDC"],
  },

  CURVE_CRVUSD_USDT_POOL: {
    name: "Curve crvUSDUSDC",
    protocol: Protocols.Curve,
    version: 20,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvUSDUSDT",
    tokens: ["crvUSD", "USDT"],
  },

  CURVE_CRVUSD_FRAX_POOL: {
    name: "Curve crvUSDUSDC",
    protocol: Protocols.Curve,
    version: 20,
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

  CONVEX_BOOSTER: {
    name: "Convex BOOSTER",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BOOSTER,
  },
  CONVEX_CLAIM_ZAP: {
    name: "Convex ZAP",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_CLAIM_ZAP,
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
        },
      },
    ],
  },
  CONVEX_MIM3CRV_POOL: {
    name: "Convex MIM3CRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxMIM_3LP3CRV",
    extraRewards: [
      {
        rewardToken: "SPELL",
        poolAddress: {
          Mainnet: "0x69a92f1656cd2e193797546cFe2EaF32EACcf6f7",
          Arbitrum: NOT_DEPLOYED,
        },
      },
    ],
  },

  CONVEX_OHMFRAXBP_POOL: {
    name: "Convex OHMFRAXBP",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxOHMFRAXBP",
    extraRewards: [],
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
  },

  AAVE_V2_DAI_POOL: {
    name: "Aave V2 DAI",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_LENDING_POOL,
    underlying: "DAI",
  },
  AAVE_V2_USDC_POOL: {
    name: "Aave V2 USDC",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_LENDING_POOL,
    underlying: "USDC",
  },
  AAVE_V2_USDT_POOL: {
    name: "Aave V2 USDT",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_LENDING_POOL,
    underlying: "USDT",
  },
  AAVE_V2_WETH_POOL: {
    name: "Aave V2 WETH",
    protocol: Protocols.AaveV2,
    type: AdapterInterface.AAVE_V2_LENDING_POOL,
    underlying: "WETH",
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
  COMPOUND_V2_ETH_POOL: {
    name: "Compound V2 ETH",
    protocol: Protocols.CompoundV2,
    type: AdapterInterface.COMPOUND_V2_CETHER,
    underlying: "WETH",
  },
};

export const contractsByAddress = TypedObjectUtils.entries(
  contractsByNetwork,
).reduce<Record<string, SupportedContract>>(
  (acc, [, contracts]) => ({
    ...acc,
    ...TypedObjectUtils.fromEntries(
      TypedObjectUtils.entries(contracts)
        .map(([k, v]) => [v.toLowerCase(), k])
        .filter(k => !!k) as Array<[string, SupportedContract]>,
    ),
  }),
  {},
);

export const isSupportedContract = (t: unknown): t is SupportedContract =>
  typeof t === "string" && !!contractParams[t as SupportedContract];
