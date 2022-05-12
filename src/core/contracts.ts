/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */

import { tokenDataByNetwork } from "./token";

export const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
export const SUSHISWAP_MAINNET = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

export const CURVE_3POOL_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const CURVE_STETH_ADDRESS = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export const CURVE_STETH_GATEWAY_ADDRESS = "";
export const CURVE_FRAX_ADDRESS = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
export const CURVE_LUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export const CURVE_SUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export const CURVE_GUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";

export const CONVEX_3POOL_REWARD_POOL_ADDRESS =
  "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8";
export const CONVEX_FRAX3CRV_REWARD_POOL_ADDRESS =
  "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e";
export const CONVEX_STECRV_REWARD_POOL_ADDRESS = "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03";
export const CONVEX_LUSD_REWARD_POOL_ADDRESS = "0x2ad92A7aE036a038ff02B96c88de868ddf3f8190";
export const CONVEX_SUSD_REWARD_POOL_ADDRESS = "0x22eE18aca7F3Ee920D01F25dA85840D12d98E8Ca";
export const CONVEX_GUSD_REWARD_POOL_ADDRESS = "0x7A7bBf95C44b144979360C3300B54A7D34b44985";

export const CONVEX_BOOSTER_ADDRESS =
  "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";

export const CONVEX_CLAIM_ZAP_ADDRESS =
  "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070";

export const YEARN_DAI_ADDRESS = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
export const YEARN_USDC_ADDRESS = "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE";
export const YEARN_WETH_ADDRESS = "0xa258C4606Ca8206D8aA700cE2143D7db854D168c";
export const YEARN_WBTC_ADDRESS = "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E";

export const YEARN_CURVE_FRAX_ADDRESS =
  "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139";

export const YEARN_CURVE_STETH_ADDRESS =
  "0xdCD90C7f6324cfa40d7169ef80b12031770B4325";

export const LIDO_STETH_ADDRESS = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";

// KOVAN

export const UNISWAP_V2_ROUTER_KOVAN = "";
export const UNISWAP_V3_ROUTER_KOVAN = "";
export const UNISWAP_V3_QUOTER_KOVAN = "";
export const SUSHISWAP_KOVAN = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

export const CURVE_3POOL_KOVAN_MOCK =
  "0x769C784D1e958672bDef04cf12Fd5399b3db0f27";
export const CURVE_STE_CRV_KOVAN_MOCK =
  "0xF695d3aa358D5087A0C157DBb9449d4f0d8E534a";
export const CURVE_FRAX3CRV_KOVAN_MOCK =
  "0x769C784D1e958672bDef04cf12Fd5399b3db0f27";
export const CURVE_LUSD_KOVAN_MOCK = "";
export const CURVE_SUSD_KOVAN_MOCK =
  "0x032f1cE00865F3499C0052ceBA5F2348842416DB";
export const CURVE_GUSD_KOVAN_MOCK = "";

export const CONVEX_3CRV_KOVAN_POOL_ADDRESS =
  "0x90D9E8ecc406cd7363C08fAdb4ac0f3994b4cA71";
export const CONVEX_STECRV_KOVAN_POOL_ADDRESS =
  "0x0f64e188BFF97e09C71FF85f30509f5596D420dD";
export const CONVEX_FRAX3CRV_KOVAN_POOL_ADDRESS = "";
export const CONVEX_LUSD_KOVAN_POOL_ADDRESS = "";
export const CONVEX_SUSD_KOVAN_POOL_ADDRESS = "";
export const CONVEX_GUSD_KOVAN_POOL_ADDRESS = "";

export const CONVEX_BOOSTER_KOVAN_ADDRESS =
  "0x78A9261965F048b9FF055699569be4400EEC7005";

  export const CONVEX_CLAIM_ZAP_KOVAN_ADDRESS = "";

export const YEARN_DAI_KOVAN_MOCK = tokenDataByNetwork.Kovan.yvDAI;
export const YEARN_USDC_KOVAN_MOCK = tokenDataByNetwork.Kovan.yvUSDC;
export const YEARN_WETH_KOVAN_MOCK = tokenDataByNetwork.Kovan.yvWETH;
export const YEARN_WBTC_KOVAN_MOCK = tokenDataByNetwork.Kovan.yvWBTC;
export const YEARN_3POOL_KOVAN_MOCK = ""; // Should this be here?
export const YEARN_STETH_KOVAN_MOCK = tokenDataByNetwork.Kovan.yvCurve_stETH;
export const YEARN_FRAX3CRV_KOVAN_MOCK = tokenDataByNetwork.Kovan.yvCurve_FRAX;

export const LIDO_STETH_KOVAN = "";

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
    };

export const knownContracts: Record<string, AdapterParams> = {
  [UNISWAP_V2_ROUTER]: {
    name: "UniswapV2",
    type: AdapterInterface.UNISWAP_V2,
    icon: "/protocols/uniswap.png"
  },
  [UNISWAP_V3_ROUTER]: {
    name: "UniswapV3",
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UNISWAP_V3,
    icon: "/protocols/uniswap.png"
  },
  [SUSHISWAP_MAINNET]: {
    name: "Sushiswap",
    type: AdapterInterface.UNISWAP_V2,
    icon: "/protocols/sushi.svg"
  },
  [CURVE_3POOL_ADDRESS]: {
    name: "Curve 3pool",
    type: AdapterInterface.CURVE_V1_3ASSETS,
    nCoins: 3,
    icon: "/protocols/curve.svg"
  },
  [CURVE_STETH_ADDRESS]: {
    name: "Curve stETH",
    type: AdapterInterface.CURVE_V1_2ASSETS,
    nCoins: 2,
    icon: "/protocols/curve.svg"
  },
  [YEARN_DAI_ADDRESS]: {
    name: "Yearn DAI",
    type: AdapterInterface.YEARN_V2,
    icon: "/protocols/yearn.svg"
  },
  [YEARN_DAI_KOVAN_MOCK]: {
    name: "Yearn DAI",
    type: AdapterInterface.YEARN_V2,
    icon: "/protocols/yearn.svg"
  },
  [YEARN_USDC_ADDRESS]: {
    name: "Yearn USDC",
    type: AdapterInterface.YEARN_V2,
    icon: "/protocols/yearn.svg"
  },
  [YEARN_USDC_KOVAN_MOCK]: {
    name: "Yearn USDC",
    type: AdapterInterface.YEARN_V2,
    icon: "/protocols/yearn.svg"
  },
  [SUSHISWAP_KOVAN]: {
    name: "Sushiswap",
    type: AdapterInterface.UNISWAP_V2,
    icon: "/protocols/sushi.svg"
  }
};
