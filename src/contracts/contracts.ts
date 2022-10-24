/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */
import { NetworkType } from "../core/constants";
import { ConvexStakedPhantomToken } from "../tokens/convex";
import type { CurveLPToken } from "../tokens/curveLP";
import { NormalToken } from "../tokens/normal";
import { tokenDataByNetwork } from "../tokens/token";
import type { YearnLPToken } from "../tokens/yearn";
import {
  filterEmptyKeys,
  keyToLowercase,
  objectEntries,
  swapKeyValue,
} from "../utils/mappers";
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
  | "CONVEX_FRAX_USDC_POOL"
  | "CONVEX_GUSD_POOL"
  | "CONVEX_SUSD_POOL"
  | "CONVEX_STECRV_POOL"
  | "CONVEX_FRAX3CRV_POOL"
  | "CONVEX_LUSD3CRV_POOL";

export type SupportedContract =
  | UniswapV2Contract
  | "UNISWAP_V3_ROUTER"
  | CurvePoolContract
  | YearnVaultContract
  | "CONVEX_BOOSTER"
  | ConvexPoolContract
  | "CONVEX_CLAIM_ZAP"
  | "LIDO_STETH_GATEWAY"
  | "LIDO_WSTETH"
  | "UNIVERSAL_ADAPTER";

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

    // LIDO
    LIDO_STETH_GATEWAY: "0x6f4b4aB5142787c05b7aB9A9692A0f46b997C29D",
    LIDO_WSTETH: tokenDataByNetwork.Mainnet.wstETH,

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  },

  //
  //
  //
  //
  //  G Ö E R L I
  //
  //
  //
  //
  Goerli: {
    UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SUSHISWAP_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",

    // CURVE
    CURVE_3CRV_POOL: "0x6491f8A62678c90C84b237791d9D7cF21b4D1418",
    CURVE_FRAX_USDC_POOL: "0x9C85E4F4061160B6177cad3f72EDfd374Dc8AD88",
    CURVE_STETH_GATEWAY: "0x6019fEa75c460ef205ef4C626F196055BAD89D1E",
    CURVE_FRAX_POOL: tokenDataByNetwork.Goerli.FRAX3CRV,
    CURVE_LUSD_POOL: tokenDataByNetwork.Goerli.LUSD3CRV,
    CURVE_SUSD_POOL: "0x2A1b874C86734feA5be050d32fAb02FCF9eB1Bc2",
    CURVE_SUSD_DEPOSIT: "0x9782f1fF1AEFb387F01cae72F668F13E8061d9Dd",
    CURVE_GUSD_POOL: "0x8C954d89C2fB2c96F0195738b8c5538B34D5344E",

    // YEARN
    YEARN_DAI_VAULT: tokenDataByNetwork.Goerli.yvDAI,
    YEARN_USDC_VAULT: tokenDataByNetwork.Goerli.yvUSDC,
    YEARN_WETH_VAULT: tokenDataByNetwork.Goerli.yvWETH,
    YEARN_WBTC_VAULT: tokenDataByNetwork.Goerli.yvWBTC,
    YEARN_CURVE_FRAX_VAULT: tokenDataByNetwork.Goerli.yvCurve_FRAX,
    YEARN_CURVE_STETH_VAULT: tokenDataByNetwork.Goerli.yvCurve_stETH,

    // CONVEX
    CONVEX_BOOSTER: "0xbd1D47bbF57F49D9a72ca7f879A096d3abDF4c40",
    CONVEX_3CRV_POOL: "0xfB9b98558c3d6851291Fbf74fa7F022a787cD795",
    CONVEX_FRAX_USDC_POOL: "0xAc22d4495166c945cc91FDB611b7515eBbfd60c0",
    CONVEX_STECRV_POOL: "0xd9de8eA4289e7a4458Bebad8c31bb7576f1C2B72",
    CONVEX_SUSD_POOL: "0x85825316be95FBb3F6B5a2Dd9f1eb9577803e441",
    CONVEX_FRAX3CRV_POOL: "0x08513eA45fdd7A9cFC33702f722090a182e4a101",
    CONVEX_LUSD3CRV_POOL: "0x8550134faa6Cb42a7668f3D9098EBa59FA959b40",
    CONVEX_GUSD_POOL: "0xa8eD353f56BB2e1063B8a011F0491a1703998De4",
    CONVEX_CLAIM_ZAP: "0x74C7Bb6493C5EcfDb49E3ED5Ee4B60012b724b4b",

    // LIDO
    LIDO_STETH_GATEWAY: "0x9290E44f5f819b7de0Fb88b10641f9F08a999BF7",
    LIDO_WSTETH: tokenDataByNetwork.Goerli.wstETH,

    // GEARBOX
    UNIVERSAL_ADAPTER: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  },
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
  underlyings?: Array<NormalToken>;
  wrapper?: CurvePoolContract;
} & BaseContractParams;

export type CurveSteCRVPoolParams = {
  protocol: Protocols.Curve;
  type: AdapterInterface.CURVE_V1_STECRV_POOL;
  pool: Record<NetworkType, string>;
  tokens: ["WETH", "STETH"];
  lpToken: "steCRV";
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

export type ContractParams =
  | UniswapV2Params
  | UniswapV3Params
  | CurveParams
  | CurveSteCRVPoolParams
  | YearnParams
  | ConvexParams
  | ConvexPoolParams
  | LidoParams
  | LidoWsthETHParams
  | UniversalParams;

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

  SUSHISWAP_ROUTER: {
    name: "Sushiswap",
    protocol: Protocols.Sushiswap,
    type: AdapterInterface.UNISWAP_V2_ROUTER,
  },
  CURVE_3CRV_POOL: {
    name: "Curve 3Pool",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_3ASSETS,
    lpToken: "3Crv",
    tokens: ["DAI", "USDC", "USDT"],
  },
  CURVE_FRAX_USDC_POOL: {
    name: "Curve crvFRAX",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "crvFRAX",
    tokens: ["FRAX", "USDC"],
  },
  CURVE_STETH_GATEWAY: {
    name: "Curve stETH",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_STECRV_POOL,
    pool: {
      Mainnet: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
      Goerli: "0x604a4aC025FbD873fB99EC67B1184a495Cc4f6D1", // CURVE_STECRV_POOL
    },
    tokens: ["WETH", "STETH"],
    lpToken: "steCRV",
  },
  CURVE_FRAX_POOL: {
    name: "Curve FRAX",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "FRAX3CRV",
    tokens: ["FRAX", "3Crv"],
    underlyings: ["FRAX", "DAI", "USDC", "USDT"],
  },
  CURVE_LUSD_POOL: {
    name: "Curve LUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "LUSD3CRV",
    tokens: ["LUSD", "3Crv"],
    underlyings: ["LUSD", "DAI", "USDC", "USDT"],
  },
  CURVE_SUSD_POOL: {
    name: "Curve SUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_4ASSETS,
    lpToken: "crvPlain3andSUSD",
    tokens: ["DAI", "USDC", "USDT", "sUSD"],
    wrapper: "CURVE_SUSD_DEPOSIT",
  },

  CURVE_SUSD_DEPOSIT: {
    name: "Curve SUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_WRAPPER,
    lpToken: "crvPlain3andSUSD",
    tokens: ["DAI", "USDC", "USDT", "sUSD"],
  },

  CURVE_GUSD_POOL: {
    name: "Curve GUSD",
    protocol: Protocols.Curve,
    type: AdapterInterface.CURVE_V1_2ASSETS,
    lpToken: "gusd3CRV",
    tokens: ["GUSD", "3Crv"],
    underlyings: ["GUSD", "DAI", "USDC", "USDT"],
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
          Goerli: "0x536389C5E416C116c42eC014D17D8639b0C1e80b", // CONVEX_SUSD_POOL_EXTRA_SNX
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
          Goerli: "0x47E04e2d75D0dED9eA4B93B1b78ef9e91DB0586a", // CONVEX_STECRV_POOL_EXTRA_LDO
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
          Goerli: "0xB976E4ADd7A3Af394A812a3eA1906fF8f46d22Fa", // CONVEX_FRAX3CRV_POOL_EXTRA_FXS
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
          Goerli: "0x1F138cAA8973FfDf57Dd692DF93836AF69Dc60da", // CONVEX_LUSD3CRV_POOL_EXTRA_LQTY
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
      Goerli: "0x2840CeAeeA3d0Af1beDBeB64539406793180709E", // LIDO_ORACLE
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
};

export const contractsByAddress = objectEntries(contractsByNetwork).reduce<
  Record<string, SupportedContract>
>(
  (acc, [, contracts]) => ({
    ...acc,
    ...filterEmptyKeys(keyToLowercase(swapKeyValue(contracts))),
  }),
  {},
);

export const isSupportedContract = (t: unknown): t is SupportedContract =>
  typeof t === "string" && !!contractParams[t as SupportedContract];
