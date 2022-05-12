export declare const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
export declare const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export declare const UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
export declare const CURVE_3POOL_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
export declare const CURVE_STETH_ADDRESS = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
export declare const CURVE_STETH_GATEWAY_ADDRESS = "";
export declare const CURVE_FRAX_ADDRESS = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
export declare const CURVE_LUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export declare const CURVE_SUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export declare const CURVE_GUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
export declare const CURVE_3POOL_KOVAN_MOCK = "0x769C784D1e958672bDef04cf12Fd5399b3db0f27";
export declare const CURVE_STE_CRV_KOVAN_MOCK = "0xF695d3aa358D5087A0C157DBb9449d4f0d8E534a";
export declare const CURVE_SUSD_KOVAN_MOCK = "0x032f1cE00865F3499C0052ceBA5F2348842416DB";
export declare const YEARN_DAI_ADDRESS = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
export declare const YEARN_USDC_ADDRESS = "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE";
export declare const YEARN_WETH_ADDRESS = "0xa258C4606Ca8206D8aA700cE2143D7db854D168c";
export declare const YEARN_WBTC_ADDRESS = "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E";
export declare const YEARN_CURVE_FRAX_ADDRESS = "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139";
export declare const YEARN_CURVE_STETH_ADDRESS = "0xdCD90C7f6324cfa40d7169ef80b12031770B4325";
export declare const YEARN_DAI_KOVAN_MOCK: string;
export declare const YEARN_USDC_KOVAN_MOCK: string;
export declare const YEARN_WETH_KOVAN_MOCK: string;
export declare const YEARN_WBTC_KOVAN_MOCK: string;
export declare const YEARN_3POOL_KOVAN_MOCK: string;
export declare const SUSHISWAP_MAINNET = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
export declare const SUSHISWAP_KOVAN = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
export declare const CONVEX_BOOSTER_KOVAN_ADDRESS = "0x78A9261965F048b9FF055699569be4400EEC7005";
export declare const CONVEX_3CRV_KOVAN_POOL_ADDRESS = "0x90D9E8ecc406cd7363C08fAdb4ac0f3994b4cA71";
export declare const CONVEX_STECRV_POOL_ADDRESS = "0x0A760466E1B4621579a82a39CB56Dda2F4E70f03";
export declare const CONVEX_STECRV_KOVAN_POOL_ADDRESS = "0x0f64e188BFF97e09C71FF85f30509f5596D420dD";
export declare const CONVEX_BOOSTER_ADDRESS = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
export declare const CONVEX_3POOL_REWARD_POOL_ADDRESS = "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8";
export declare const CONVEX_FRAX3CRV_REWARD_POOL_ADDRESS = "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e";
export declare const CONVEX_CLAIM_ZAP_ADDRESS = "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070";
export declare const LIDO_STETH_ADDRESS = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
export declare enum AdapterInterface {
    NO_SWAP = 0,
    UNISWAP_V2 = 1,
    UNISWAP_V3 = 2,
    CURVE_V1_2ASSETS = 3,
    CURVE_V1_3ASSETS = 4,
    CURVE_V1_4ASSETS = 5,
    CURVE_V1_STETH = 6,
    YEARN_V2 = 7,
    CONVEX_V1_BASE_REWARD_POOL = 8,
    CONVEX_V1_BOOSTER = 9,
    CONVEX_V1_CLAIM_ZAP = 10,
    LIDO_V1 = 11
}
export declare type AdapterParams = {
    name: string;
    type: AdapterInterface.UNISWAP_V2;
    icon: string;
} | {
    name: string;
    type: AdapterInterface.UNISWAP_V3;
    quoter: string;
    icon: string;
} | {
    name: string;
    type: AdapterInterface.CURVE_V1_2ASSETS;
    nCoins: number;
    icon: string;
} | {
    name: string;
    type: AdapterInterface.CURVE_V1_3ASSETS;
    nCoins: number;
    icon: string;
} | {
    name: string;
    type: AdapterInterface.YEARN_V2;
    icon: string;
};
export declare const knownContracts: Record<string, AdapterParams>;
