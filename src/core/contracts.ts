/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */

import { NetworkType } from "./constants";
import { tokenDataByNetwork } from "./token";

export type SupportedContracts =
  | "UNISWAP_V2_ROUTER"
  | "UNISWAP_V3_ROUTER"
  | "SUSHISWAP_ROUTER"
  | "CURVE_3POOL"
  | "CURVE_STETH"
  | "CURVE_FRAX"
  | "CURVE_LUSD"
  | "CURVE_GUSD"
  | "CURVE_SUSD"
  | "YEARN_DAI"
  | "YEARN_USDC"
  | "YEARN_WETH"
  | "YEARN_WBTC"
  | "YEARN_CURVE_FRAX"
  | "YEARN_CURVE_STETH"
  | "CONVEX_BOOSTER"
  | "CONVEX_3CRV"
  | "CONVEX_GUSD"
  | "CONVEX_SUSD"
  | "CONVEX_STECRV"
  | "CONVEX_FRAX3CRV"
  | "CONVEX_CLAIM_ZAP"
  | "LIDO_STETH";

export const contractsByNetwork: Record<
  NetworkType,
  Record<SupportedContracts, string>
> = {
  Mainnet: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",

    // CURVE
    CURVE_3POOL: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7", // SEPARATE TOKEN
    CURVE_STETH: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022", // SEPARATE TOKEN
    CURVE_FRAX: tokenDataByNetwork.Mainnet.FRAX3CRV,
    CURVE_LUSD: tokenDataByNetwork.Mainnet.LUSD3CRV,
    CURVE_SUSD: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD", // SEPARATE TOKEN
    CURVE_GUSD: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956", // SEPARATE TOKEN

    // YEARN
    YEARN_DAI: tokenDataByNetwork.Mainnet.yvDAI,
    YEARN_USDC: tokenDataByNetwork.Mainnet.yvUSDC,
    YEARN_WETH: tokenDataByNetwork.Mainnet.yvWETH,
    YEARN_WBTC: tokenDataByNetwork.Mainnet.yvWBTC,
    YEARN_CURVE_FRAX: tokenDataByNetwork.Mainnet.yvCurve_FRAX,
    YEARN_CURVE_STETH: tokenDataByNetwork.Mainnet.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
    CONVEX_3CRV: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8",
    CONVEX_GUSD: "0x7A7bBf95C44b144979360C3300B54A7D34b44985",
    CONVEX_SUSD: "0x22eE18aca7F3Ee920D01F25dA85840D12d98E8Ca",
    CONVEX_STECRV: "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03",
    CONVEX_FRAX3CRV: "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e",
    CONVEX_CLAIM_ZAP: "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070",

    // LIDO
    LIDO_STETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84"
  },
  Kovan: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SUSHISWAP_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",

    // CURVE
    CURVE_3POOL: "0x769C784D1e958672bDef04cf12Fd5399b3db0f27",
    CURVE_STETH: "0xF695d3aa358D5087A0C157DBb9449d4f0d8E534a",
    CURVE_FRAX: "",
    CURVE_LUSD: tokenDataByNetwork.Kovan.LUSD3CRV,
    CURVE_SUSD: "0x032f1cE00865F3499C0052ceBA5F2348842416DB", // SEPARATE TOKEN
    CURVE_GUSD: "",

    // YEARN
    YEARN_DAI: tokenDataByNetwork.Kovan.yvDAI,
    YEARN_USDC: tokenDataByNetwork.Kovan.yvUSDC,
    YEARN_WETH: tokenDataByNetwork.Kovan.yvWETH,
    YEARN_WBTC: tokenDataByNetwork.Kovan.yvWBTC,
    YEARN_CURVE_FRAX: tokenDataByNetwork.Kovan.yvCurve_FRAX,
    YEARN_CURVE_STETH: tokenDataByNetwork.Kovan.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0x78A9261965F048b9FF055699569be4400EEC7005",
    CONVEX_3CRV: "0x90D9E8ecc406cd7363C08fAdb4ac0f3994b4cA71",
    CONVEX_GUSD: "",
    CONVEX_SUSD: "",
    CONVEX_STECRV: "0x0f64e188BFF97e09C71FF85f30509f5596D420dD",
    CONVEX_FRAX3CRV: "",
    CONVEX_CLAIM_ZAP: "",

    // LIDO
    LIDO_STETH: ""
  }
};

export enum AdapterInterface {
  NO_SWAP, // 0 - 1
  UNISWAP_V2, // 1 - 2
  UNISWAP_V3, // 2 - 4
  CURVE_V1_2ASSETS, // 3 - 8
  CURVE_V1_3ASSETS, // 4 - 16
  CURVE_V1_4ASSETS, // 5 - 32
  CURVE_V1_STETH, // 6 - 64
  YEARN_V2, // 7 - 128
  CONVEX_V1_BASE_REWARD_POOL, // 8 - 256
  CONVEX_V1_BOOSTER, // 9 - 512
  CONVEX_V1_CLAIM_ZAP, // 10 - 1024
  LIDO_V1 // 11 - 2048
}

export type AdapterParams =
  | {
      name: string;
      type: AdapterInterface.UNISWAP_V2;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.UNISWAP_V3;
      quoter: string;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.CURVE_V1_2ASSETS;
      nCoins: number;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.CURVE_V1_3ASSETS;
      nCoins: number;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.YEARN_V2;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.CONVEX_V1_BASE_REWARD_POOL;
      stakedToken: string;
      stakedTokenKovan?: string;
    };

export const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";

export const knownContracts: Record<SupportedContracts, AdapterParams> = {
  UNISWAP_V2_ROUTER: {
    name: "UniswapV2",
    type: AdapterInterface.UNISWAP_V2,
    icon: "/protocols/uniswap.png"
  },
  UNISWAP_V3_ROUTER: {
    name: "UniswapV3",
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UNISWAP_V3,
    icon: "/protocols/uniswap.png"
  },
  SUSHISWAP_ROUTER: {
    name: "Sushiswap",
    type: AdapterInterface.UNISWAP_V2,
    icon: "/protocols/sushi.svg"
  },
  CURVE_3POOL: {
    name: "Curve 3pool",
    type: AdapterInterface.CURVE_V1_3ASSETS,
    nCoins: 3,
    icon: "/protocols/curve.svg"
  },
  CURVE_STETH: {
    name: "Curve stETH",
    type: AdapterInterface.CURVE_V1_2ASSETS,
    nCoins: 2,
    icon: "/protocols/curve.svg"
  },
  YEARN_DAI: {
    name: "Yearn DAI",
    type: AdapterInterface.YEARN_V2,
    icon: "/protocols/yearn.svg"
  },

  YEARN_USDC: {
    name: "Yearn USDC",
    type: AdapterInterface.YEARN_V2,
    icon: "/protocols/yearn.svg"
  }
};
