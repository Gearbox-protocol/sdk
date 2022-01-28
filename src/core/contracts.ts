/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */

export const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";

export const CURVE_3POOL_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const CURVE_STETH_ADDRESS = "0x06325440D014e39736583c165C2963BA99fAf14E";
export const CURVE_FRAX_ADDRESS = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
export const CURVE_MIM_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export const CURVE_LUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export const CURVE_SUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export const CURVE_GUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";

export const YEARN_DAI_ADDRESS = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
export const YEARN_USDC_ADDRESS = "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE";
export const YEARN_WETH_ADDRESS = "0xa258C4606Ca8206D8aA700cE2143D7db854D168c";
export const YEARN_WBTC_ADDRESS = "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E";

export const YEARN_DAI_KOVAN_MOCK =
  "0xe5267045739E4d6FcA15BB4a79190012F146893b";
export const YEARN_USDC_KOVAN_MOCK =
  "0x980E4d8A22105c2a2fA2252B7685F32fc7564512";

export const SUSHISWAP_MAINNET = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
export const SUSHISWAP_KOVAN = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

export const LIDO_STETH_ADDRESS = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";

export enum AdapterInterface {
  NoSwap = 0,
  UniswapV2,
  UniswapV3,
  CurveV1,
  YearnV2,
}

export type AdapterParams =
  | {
      name: string;
      type: AdapterInterface.UniswapV2;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.UniswapV3;
      quoter: string;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.CurveV1;
      nCoins: number;
      icon: string;
    }
  | {
      name: string;
      type: AdapterInterface.YearnV2;
      icon: string;
    };

export const knownContracts: Record<string, AdapterParams> = {
  [UNISWAP_V2_ROUTER]: {
    name: "UniswapV2",
    type: AdapterInterface.UniswapV2,
    icon: "/protocols/uniswap.png",
  },
  [UNISWAP_V3_ROUTER]: {
    name: "UniswapV3",
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UniswapV3,
    icon: "/protocols/uniswap.png",
  },
  [SUSHISWAP_MAINNET]: {
    name: "Sushiswap",
    type: AdapterInterface.UniswapV2,
    icon: "/protocols/sushi.svg",
  },
  [CURVE_3POOL_ADDRESS]: {
    name: "Curve 3pool",
    type: AdapterInterface.CurveV1,
    nCoins: 3,
    icon: "/protocols/curve.svg",
  },
  [CURVE_STETH_ADDRESS]: {
    name: "Curve stETH",
    type: AdapterInterface.CurveV1,
    nCoins: 2,
    icon: "/protocols/curve.svg",
  },
  [YEARN_DAI_ADDRESS]: {
    name: "Yearn DAI",
    type: AdapterInterface.YearnV2,
    icon: "/protocols/yearn.svg",
  },
  [YEARN_DAI_KOVAN_MOCK]: {
    name: "Yearn DAI",
    type: AdapterInterface.YearnV2,
    icon: "/protocols/yearn.svg",
  },
  [YEARN_USDC_ADDRESS]: {
    name: "Yearn USDC",
    type: AdapterInterface.YearnV2,
    icon: "/protocols/yearn.svg",
  },
  [YEARN_USDC_KOVAN_MOCK]: {
    name: "Yearn USDC",
    type: AdapterInterface.YearnV2,
    icon: "/protocols/yearn.svg",
  },
  [SUSHISWAP_KOVAN]: {
    name: "Sushiswap",
    type: AdapterInterface.UniswapV2,
    icon: "/protocols/sushi.svg",
  },
};
