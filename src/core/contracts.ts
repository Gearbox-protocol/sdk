/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */

import { getStatic } from "@diesellabs/gearbox-static";

export const SUSHISWAP_MAINNET = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
export const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";

export const CURVE_3POOL_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export const CURVE_STETH_ADDRESS = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";

export const YEARN_DAI_ADDRESS = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
export const YEARN_USDC_ADDRESS = "0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9";

export const SUSHISWAP_KOVAN = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";

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
    icon: getStatic("/protocols/uniswap.svg")
  },
  [UNISWAP_V3_ROUTER]: {
    name: "UniswapV3",
    quoter: UNISWAP_V3_QUOTER,
    type: AdapterInterface.UniswapV3,
    icon: getStatic("/protocols/uniswap.svg")
  },
  [SUSHISWAP_MAINNET]: {
    name: "Sushiswap",
    type: AdapterInterface.UniswapV2,
    icon: getStatic("/protocols/sushi.svg")
  },
  [CURVE_3POOL_ADDRESS]: {
    name: "Curve 3pool",
    type: AdapterInterface.CurveV1,
    nCoins: 3,
    icon: getStatic("/protocols/curve.svg")
  },
  [CURVE_STETH_ADDRESS]: {
    name: "Curve stETH",
    type: AdapterInterface.CurveV1,
    nCoins: 2,
    icon: getStatic("/protocols/curve.svg")
  },
  [YEARN_DAI_ADDRESS]: {
    name: "Yearn DAI",
    type: AdapterInterface.YearnV2,
    icon: getStatic("/protocols/yearn.svg")
  },
  [YEARN_USDC_ADDRESS]: {
    name: "Yearn USDC",
    type: AdapterInterface.YearnV2,
    icon: getStatic("/protocols/yearn.svg")
  },

  [SUSHISWAP_KOVAN]: {
    name: "Sushiswap",
    type: AdapterInterface.UniswapV2,
    icon: getStatic("/protocols/sushi.svg")
  },
};
