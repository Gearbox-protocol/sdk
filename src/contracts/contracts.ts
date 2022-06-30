/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */
import { keyToLowercase, objectEntries, swapKeyValue } from "../utils/mappers";
import { AdapterInterface } from "./adapters";
import { NetworkType } from "../core/constants";
import { Protocols } from "./protocols";
import { tokenDataByNetwork } from "../tokens/token";
import { ConvexStakedPhantomToken } from "../tokens/convex";
import { CurveLPToken } from "../tokens/curveLP";
import { NormalToken } from "../tokens/normal";

export type UniswapV2Contract = "UNISWAP_V2_ROUTER" | "SUSHISWAP_ROUTER";

export type CurvePoolContract =
  | "CURVE_3CRV_POOL"
  | "CURVE_STETH_GATEWAY"
  | "CURVE_FRAX_POOL"
  | "CURVE_LUSD_POOL"
  | "CURVE_GUSD_POOL"
  | "CURVE_SUSD_POOL"
  | "CURVE_SUSD_DEPOSIT";

export type YearnVaultContract =
  | "YEARN_DAI_VAULT"
  | "YEARN_USDC_VAULT"
  | "YEARN_WETH_VAULT"
  | "YEARN_WBTC_VAULT"
  | "YEARN_CURVE_FRAX_VAULT"
  | "YEARN_CURVE_STETH_VAULT";

export type ConvexPoolContract =
  | "CONVEX_3CRV_POOL"
  | "CONVEX_GUSD_POOL"
  | "CONVEX_SUSD_POOL"
  | "CONVEX_STECRV_POOL"
  | "CONVEX_FRAX3CRV_POOL";

export type SupportedContract =
  | UniswapV2Contract
  | "UNISWAP_V3_ROUTER"
  | CurvePoolContract
  | YearnVaultContract
  | "CONVEX_BOOSTER"
  | ConvexPoolContract
  | "CONVEX_CLAIM_ZAP"
  | "LIDO_STETH_GATEWAY";

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
    CURVE_STETH_GATEWAY: "0xE91Af09e2F11eB7548a7C246C5f80e2D80da88C3", // SEPARATE TOKEN
    CURVE_FRAX_POOL: tokenDataByNetwork.Mainnet.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Mainnet.LUSD3CRV,
    CURVE_SUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD", // SEPARATE TOKEN
    CURVE_GUSD_POOL: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956", // SEPARATE TOKEN

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
    CONVEX_GUSD_POOL: "0x7A7bBf95C44b144979360C3300B54A7D34b44985",
    CONVEX_SUSD_POOL: "0x22eE18aca7F3Ee920D01F25dA85840D12d98E8Ca",
    CURVE_SUSD_DEPOSIT: "0xFCBa3E75865d2d561BE8D220616520c171F12851",
    CONVEX_STECRV_POOL: "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03",
    CONVEX_FRAX3CRV_POOL: "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e",
    CONVEX_CLAIM_ZAP: "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070",

    // LIDO
    LIDO_STETH_GATEWAY: "0x55045Eaae19d92680E02231e4Ce7bBEB4814ca64"
  },

  ///
  ///
  /// KOVAN
  ///
  ///
  Kovan: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SUSHISWAP_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",

    // CURVE
    CURVE_3CRV_POOL: "0x5C07cB1e8510DCC0DA262A71bb532B0e85368250",
    CURVE_STETH_GATEWAY: "0xed4439dc6D555b5712E1B3815848B7a80E0bd8a2",
    CURVE_FRAX_POOL: tokenDataByNetwork.Kovan.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Kovan.LUSD3CRV,
    CURVE_SUSD_POOL: "0xcD0d789E7b0BCCa84ea23F309f9154B186606f4F",
    CURVE_SUSD_DEPOSIT: "0x1F447F916649248cF091723e58c695F619d27BFf",
    CURVE_GUSD_POOL: "0x08543E4CbE76C3461871A83C63E1d59684A66d7b",

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Kovan.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Kovan.yvUSDC,
    YEARN_WETH_VAULT: tokenDataByNetwork.Kovan.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Kovan.yvWBTC,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Kovan.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Kovan.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0x56E507256808FB2692476181aA978e00Ca24d40f",
    CONVEX_3CRV_POOL: "0xc2c705a619CF48241A9339763c6Cfd32Ca8C9deB",
    CONVEX_STECRV_POOL: "0x25edfea00131DAF9b23a8E07720Eea2382d58E71",
    CONVEX_SUSD_POOL: "0xE9998a1c357dc62550f2ED72b736a7CaEB262823",
    CONVEX_FRAX3CRV_POOL: "0xEBE0A1B948eB83333906EB80eE4b87Ee0b5CC84f",
    CONVEX_GUSD_POOL: "0xE7370DA7FD3d511dAB095Dd7d10388653d5cDE21",
    CONVEX_CLAIM_ZAP: "0x1330C2E5Cd8c333683aE511550f82d25918FFdd5",

    // LIDO
    LIDO_STETH_GATEWAY: "0x7C1C4eC1f1510E3978a96a1d024D7689F05a7Ca1"
  }
};

export const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";

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
  quoter: string;
} & BaseContractParams;

export type CurveParams = {
  protocol: Protocols.Curve;
  type:
    | AdapterInterface.CURVE_V1_2ASSETS
    | AdapterInterface.CURVE_V1_3ASSETS
    | AdapterInterface.CURVE_V1_4ASSETS
    | AdapterInterface.CURVE_V1_WRAPPER;
  lpToken: CurveLPToken;
  tokens: Array<NormalToken | CurveLPToken>;
  wrapper?: CurvePoolContract;
} & BaseContractParams;

export type CurveSteCRVPoolParams = {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_STECRV_POOL;
  pool: Record<NetworkType, string>;
  lpToken: "steCRV";
} & BaseContractParams;

type YearnParams = {
  protocol: Protocols.Yearn;
  type: AdapterInterface.YEARN_V2;
} & BaseContractParams;

type ConvexParams = {
  protocol: Protocols.Convex;
  type:
    | AdapterInterface.CONVEX_V1_BOOSTER
    | AdapterInterface.CONVEX_V1_CLAIM_ZAP;
} & BaseContractParams;

type ConvexPoolParams = {
  protocol: Protocols.Convex;
  type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
  stakedToken: ConvexStakedPhantomToken;
} & BaseContractParams;

export type LidoParams = {
  protocol: Protocols.Lido;
  type: AdapterInterface.LIDO_V1;
  oracle: Record<NetworkType, string>;
  lpToken: "steCRV";
} & BaseContractParams;

export type ContractParams =
  | UniswapV2Params
  | UniswapV3Params
  | CurveParams
  | CurveSteCRVPoolParams
  | YearnParams
  | ConvexParams
  | ConvexPoolParams
  | LidoParams;

export const contractParams: Record<SupportedContract, ContractParams> = {
  UNISWAP_V2_ROUTER: {
    name: "Uniswap V2",
    protocol: Protocols.Uniswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER
  },
  UNISWAP_V3_ROUTER: {
    name: "Uniswap V3",
    protocol: Protocols.Uniswap,
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UNISWAP_V3_ROUTER
  },

  SUSHISWAP_ROUTER: {
    name: "Sushiswap",
    protocol: Protocols.Sushiswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER
  },

  CURVE_3CRV_POOL: {
    name: "Curve 3Pool",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    lpToken: "3Crv",
    tokens: ["DAI", "USDC", "USDT"]
  },
  CURVE_STETH_GATEWAY: {
    name: "Curve stETH",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_STECRV_POOL,
    pool: {
      Mainnet: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
      Kovan: "0xF5C73b58B70709e89aA1D322d48b0D0C71123cB4"
    },
    lpToken: "steCRV"
  },
  CURVE_FRAX_POOL: {
    name: "Curve FRAX",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "FRAX3CRV",
    tokens: ["3Crv", "FRAX"]
  },
  CURVE_LUSD_POOL: {
    name: "Curve LUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "LUSD3CRV",
    tokens: ["3Crv", "LUSD"]
  },
  CURVE_SUSD_POOL: {
    name: "Curve SUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_4ASSETS,
    lpToken: "crvPlain3andSUSD",
    tokens: ["DAI", "USDC", "USDT", "sUSD"],
    wrapper: "CURVE_SUSD_DEPOSIT"
  },

  CURVE_SUSD_DEPOSIT: {
    name: "Curve SUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_WRAPPER,
    lpToken: "crvPlain3andSUSD",
    tokens: ["DAI", "USDC", "USDT", "sUSD"],
    wrapper: "CURVE_SUSD_DEPOSIT"
  },

  CURVE_GUSD_POOL: {
    name: "Curve GUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "gusd3CRV",
    tokens: ["3Crv", "FRAX"]
  },

  YEARN_DAI_VAULT: {
    name: "Yearn DAI",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_USDC_VAULT: {
    name: "Yearn USDC",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_WETH_VAULT: {
    name: "Yearn WETH",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_WBTC_VAULT: {
    name: "Yearn WBTC",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_CURVE_FRAX_VAULT: {
    name: "Yearn Curve FRAX",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_CURVE_STETH_VAULT: {
    name: "Yearn Curve STETH",
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },

  CONVEX_BOOSTER: {
    name: "Convex BOOSTER",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BOOSTER
  },
  CONVEX_3CRV_POOL: {
    name: "Convex 3crv",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvx3Crv"
  },
  CONVEX_GUSD_POOL: {
    name: "Convex GUSD",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxgusd3CRV"
  },
  CONVEX_SUSD_POOL: {
    name: "Convex SUSD",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvPlain3andSUSD"
  },
  CONVEX_STECRV_POOL: {
    name: "Convex STECRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxsteCRV"
  },
  CONVEX_FRAX3CRV_POOL: {
    name: "Convex FRAX3CRV",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxFRAX3CRV"
  },
  CONVEX_CLAIM_ZAP: {
    name: "Convex ZAP",
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_CLAIM_ZAP
  },

  LIDO_STETH_GATEWAY: {
    name: "Lido STETH",
    protocol: Protocols.Lido,
    type: AdapterInterface.LIDO_V1,
    oracle: {
      Mainnet: "0x442af784A788A5bd6F42A01Ebe9F287a871243fb",
      Kovan: "0x65EBFF1D5C02418AaeCd0f953da518cF6a6c68A0"
    },
    lpToken: "steCRV"
  }
};

export const contractsByAddress = objectEntries(contractsByNetwork).reduce<
  Record<string, SupportedContract>
>((sum, [_, contracts]) => {
  return { ...sum, ...keyToLowercase(swapKeyValue(contracts)) };
}, {});
