/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */

import { AdapterInterface } from "./adapters";
import { NetworkType } from "./constants";
import { Protocols } from "./protocols";
import {
  ConvexStakedPhantomToken,
  CurveLPToken,
  NormalToken,
  tokenDataByNetwork
} from "./token";

export type UniswapV2Contract = "UNISWAP_V2_ROUTER" | "SUSHISWAP_ROUTER";

export type CurvePoolContract =
  | "CURVE_3CRV_POOL"
  | "CURVE_STETH_GATEWAY"
  | "CURVE_FRAX_POOL"
  | "CURVE_LUSD_POOL"
  | "CURVE_GUSD_POOL"
  | "CURVE_SUSD_POOL";

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
    CURVE_STETH_GATEWAY: "0xB949Ef5b39164537ee97BF17b968e465368C97AD", // SEPARATE TOKEN
    CURVE_FRAX_POOL: tokenDataByNetwork.Mainnet.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Mainnet.LUSD3CRV,
    CURVE_SUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD", // SEPARATE TOKEN
    CURVE_GUSD_POOL: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956", // SEPARATE TOKEN

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Mainnet.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Mainnet.yvUSDC,
    YEARN_WETH_VAULT: tokenDataByNetwork.Mainnet.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Mainnet.yvWBTC,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Mainnet.yvCURVE_FRAX_POOL,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Mainnet.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
    CONVEX_3CRV_POOL: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8",
    CONVEX_GUSD_POOL: "0x7A7bBf95C44b144979360C3300B54A7D34b44985",
    CONVEX_SUSD_POOL: "0x22eE18aca7F3Ee920D01F25dA85840D12d98E8Ca",
    CONVEX_STECRV_POOL: "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03",
    CONVEX_FRAX3CRV_POOL: "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e",
    CONVEX_CLAIM_ZAP: "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070",

    // LIDO
    LIDO_STETH_GATEWAY: "0x55045Eaae19d92680E02231e4Ce7bBEB4814ca64"
  },
  Kovan: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SUSHISWAP_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",

    // CURVE
    CURVE_3CRV_POOL: "0x769C784D1e958672bDef04cf12Fd5399b3db0f27",
    CURVE_STETH_GATEWAY: "",
    CURVE_FRAX_POOL: "",
    CURVE_LUSD_POOL: tokenDataByNetwork.Kovan.LUSD3CRV,
    CURVE_SUSD_POOL: "0x032f1cE00865F3499C0052ceBA5F2348842416DB", // SEPARATE TOKEN
    CURVE_GUSD_POOL: "",

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Kovan.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Kovan.yvUSDC,
    YEARN_WETH_VAULT: tokenDataByNetwork.Kovan.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Kovan.yvWBTC,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Kovan.yvCURVE_FRAX_POOL,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Kovan.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0x78A9261965F048b9FF055699569be4400EEC7005",
    CONVEX_3CRV_POOL: "0x90D9E8ecc406cd7363C08fAdb4ac0f3994b4cA71",
    CONVEX_GUSD_POOL: "",
    CONVEX_SUSD_POOL: "",
    CONVEX_STECRV_POOL: "0x0f64e188BFF97e09C71FF85f30509f5596D420dD",
    CONVEX_FRAX3CRV_POOL: "",
    CONVEX_CLAIM_ZAP: "",

    // LIDO
    LIDO_STETH_GATEWAY: ""
  }
};

export const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";

export interface CurveSteCRVPoolParams {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_STECRV_POOL;
  pool: Record<NetworkType, string>;
}

export interface LidoParams {
  protocol: Protocols.Lido;
  type: AdapterInterface.LIDO_V1;
  contract: Record<NetworkType, string>;
}

export type ContractParams =
  | {
      protocol: Protocols.Uniswap | Protocols.Sushiswap;
      type: AdapterInterface.UNISWAP_V2_ROUTER;
    }
  | {
      protocol: Protocols.Uniswap;
      type: AdapterInterface.UNISWAP_V3_ROUTER;
      quoter: string;
    }
  | {
      protocol: Protocols.Curve;
      type:
        | AdapterInterface.CURVE_V1_2ASSETS
        | AdapterInterface.CURVE_V1_3ASSETS
        | AdapterInterface.CURVE_V1_4ASSETS;
      lpToken: CurveLPToken;
      tokens: Array<NormalToken | CurveLPToken>;
    }
  | CurveSteCRVPoolParams
  | {
      protocol: Protocols.Yearn;
      type: AdapterInterface.YEARN_V2;
    }
  | {
      protocol: Protocols.Convex;
      type:
        | AdapterInterface.CONVEX_V1_BOOSTER
        | AdapterInterface.CONVEX_V1_CLAIM_ZAP;
    }
  | {
      protocol: Protocols.Convex;
      type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
      stakedToken: ConvexStakedPhantomToken;
    }
  | LidoParams;

export const contractParams: Record<SupportedContract, ContractParams> = {
  UNISWAP_V2_ROUTER: {
    protocol: Protocols.Uniswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER
  },
  UNISWAP_V3_ROUTER: {
    protocol: Protocols.Uniswap,
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UNISWAP_V3_ROUTER
  },
  SUSHISWAP_ROUTER: {
    protocol: Protocols.Sushiswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER
  },
  CURVE_3CRV_POOL: {
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    lpToken: "3Crv",
    tokens: ["DAI", "USDC", "USDT"]
  },
  CURVE_STETH_GATEWAY: {
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_STECRV_POOL,
    pool: {
      Mainnet: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
      Kovan: "0xF695d3aa358D5087A0C157DBb9449d4f0d8E534a"
    }
  },
  CURVE_FRAX_POOL: {
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "FRAX3CRV",
    tokens: ["3Crv", "FRAX"]
  },
  CURVE_LUSD_POOL: {
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "LUSD3CRV",
    tokens: ["3Crv", "FRAX"]
  },
  CURVE_SUSD_POOL: {
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvPlain3andSUSD",
    tokens: ["3Crv", "FRAX"]
  },
  CURVE_GUSD_POOL: {
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "gusd3CRV",
    tokens: ["3Crv", "FRAX"]
  },
  YEARN_DAI_VAULT: {
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },

  YEARN_USDC_VAULT: {
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_WETH_VAULT: {
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_WBTC_VAULT: {
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_CURVE_FRAX_VAULT: {
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  YEARN_CURVE_STETH_VAULT: {
    protocol: Protocols.Yearn,
    type: AdapterInterface.YEARN_V2
  },
  CONVEX_BOOSTER: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BOOSTER
  },
  CONVEX_3CRV_POOL: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvx3Crv"
  },
  CONVEX_GUSD_POOL: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxgusd3CRV"
  },
  CONVEX_SUSD_POOL: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxcrvPlain3andSUSD"
  },
  CONVEX_STECRV_POOL: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxsteCRV"
  },
  CONVEX_FRAX3CRV_POOL: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
    stakedToken: "stkcvxFRAX3CRV"
  },
  CONVEX_CLAIM_ZAP: {
    protocol: Protocols.Convex,
    type: AdapterInterface.CONVEX_V1_CLAIM_ZAP
  },
  LIDO_STETH_GATEWAY: {
    protocol: Protocols.Lido,
    type: AdapterInterface.LIDO_V1,
    contract: {
      Mainnet: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
      Kovan: ""
    }
  }
};
