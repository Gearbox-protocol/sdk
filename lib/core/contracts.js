"use strict";
/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.knownContracts = exports.AdapterInterface = exports.LIDO_STETH_ADDRESS = exports.CONVEX_CLAIM_ZAP_ADDRESS = exports.CONVEX_FRAX3CRV_REWARD_POOL_ADDRESS = exports.CONVEX_3POOL_REWARD_POOL_ADDRESS = exports.CONVEX_BOOSTER_ADDRESS = exports.SUSHISWAP_KOVAN = exports.SUSHISWAP_MAINNET = exports.YEARN_USDC_KOVAN_MOCK = exports.YEARN_DAI_KOVAN_MOCK = exports.YEARN_CURVE_STETH_ADDRESS = exports.YEARN_CURVE_FRAX_ADDRESS = exports.YEARN_WBTC_ADDRESS = exports.YEARN_WETH_ADDRESS = exports.YEARN_USDC_ADDRESS = exports.YEARN_DAI_ADDRESS = exports.CURVE_GUSD_ADDRESS = exports.CURVE_SUSD_ADDRESS = exports.CURVE_LUSD_ADDRESS = exports.CURVE_FRAX_ADDRESS = exports.CURVE_STETH_GATEWAY_ADDRESS = exports.CURVE_STETH_ADDRESS = exports.CURVE_3POOL_ADDRESS = exports.UNISWAP_V3_QUOTER = exports.UNISWAP_V3_ROUTER = exports.UNISWAP_V2_ROUTER = void 0;
exports.UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
exports.UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
exports.UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
exports.CURVE_3POOL_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
exports.CURVE_STETH_ADDRESS = "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022";
exports.CURVE_STETH_GATEWAY_ADDRESS = "";
exports.CURVE_FRAX_ADDRESS = "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B";
exports.CURVE_LUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
exports.CURVE_SUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
exports.CURVE_GUSD_ADDRESS = "0x5a6a4d54456819380173272a5e8e9b9904bdf41b";
exports.YEARN_DAI_ADDRESS = "0xdA816459F1AB5631232FE5e97a05BBBb94970c95";
exports.YEARN_USDC_ADDRESS = "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE";
exports.YEARN_WETH_ADDRESS = "0xa258C4606Ca8206D8aA700cE2143D7db854D168c";
exports.YEARN_WBTC_ADDRESS = "0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E";
exports.YEARN_CURVE_FRAX_ADDRESS = "0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139";
exports.YEARN_CURVE_STETH_ADDRESS = "0xdCD90C7f6324cfa40d7169ef80b12031770B4325";
exports.YEARN_DAI_KOVAN_MOCK = "0xe5267045739E4d6FcA15BB4a79190012F146893b";
exports.YEARN_USDC_KOVAN_MOCK = "0x980E4d8A22105c2a2fA2252B7685F32fc7564512";
exports.SUSHISWAP_MAINNET = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";
exports.SUSHISWAP_KOVAN = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";
exports.CONVEX_BOOSTER_ADDRESS = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";
exports.CONVEX_3POOL_REWARD_POOL_ADDRESS = "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8";
exports.CONVEX_FRAX3CRV_REWARD_POOL_ADDRESS = "0xB900EF131301B307dB5eFcbed9DBb50A3e209B2e";
exports.CONVEX_CLAIM_ZAP_ADDRESS = "0x92Cf9E5e4D1Dfbf7dA0d2BB3e884a68416a65070";
exports.LIDO_STETH_ADDRESS = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";
var AdapterInterface;
(function (AdapterInterface) {
    AdapterInterface[AdapterInterface["NO_SWAP"] = 0] = "NO_SWAP";
    AdapterInterface[AdapterInterface["UNISWAP_V2"] = 1] = "UNISWAP_V2";
    AdapterInterface[AdapterInterface["UNISWAP_V3"] = 2] = "UNISWAP_V3";
    AdapterInterface[AdapterInterface["CURVE_V1_2ASSETS"] = 3] = "CURVE_V1_2ASSETS";
    AdapterInterface[AdapterInterface["CURVE_V1_3ASSETS"] = 4] = "CURVE_V1_3ASSETS";
    AdapterInterface[AdapterInterface["CURVE_V1_4ASSETS"] = 5] = "CURVE_V1_4ASSETS";
    AdapterInterface[AdapterInterface["CURVE_V1_STETH"] = 6] = "CURVE_V1_STETH";
    AdapterInterface[AdapterInterface["YEARN_V2"] = 7] = "YEARN_V2";
    AdapterInterface[AdapterInterface["CONVEX_V1_BASE_REWARD_POOL"] = 8] = "CONVEX_V1_BASE_REWARD_POOL";
    AdapterInterface[AdapterInterface["CONVEX_V1_BOOSTER"] = 9] = "CONVEX_V1_BOOSTER";
    AdapterInterface[AdapterInterface["CONVEX_V1_CLAIM_ZAP"] = 10] = "CONVEX_V1_CLAIM_ZAP";
    AdapterInterface[AdapterInterface["LIDO_V1"] = 11] = "LIDO_V1"; // 11 - 2048
})(AdapterInterface = exports.AdapterInterface || (exports.AdapterInterface = {}));
exports.knownContracts = (_a = {},
    _a[exports.UNISWAP_V2_ROUTER] = {
        name: "UniswapV2",
        type: AdapterInterface.UNISWAP_V2,
        icon: "/protocols/uniswap.png"
    },
    _a[exports.UNISWAP_V3_ROUTER] = {
        name: "UniswapV3",
        quoter: exports.UNISWAP_V3_QUOTER,
        type: AdapterInterface.UNISWAP_V3,
        icon: "/protocols/uniswap.png"
    },
    _a[exports.SUSHISWAP_MAINNET] = {
        name: "Sushiswap",
        type: AdapterInterface.UNISWAP_V2,
        icon: "/protocols/sushi.svg"
    },
    _a[exports.CURVE_3POOL_ADDRESS] = {
        name: "Curve 3pool",
        type: AdapterInterface.CURVE_V1_3ASSETS,
        nCoins: 3,
        icon: "/protocols/curve.svg"
    },
    _a[exports.CURVE_STETH_ADDRESS] = {
        name: "Curve stETH",
        type: AdapterInterface.CURVE_V1_2ASSETS,
        nCoins: 2,
        icon: "/protocols/curve.svg"
    },
    _a[exports.YEARN_DAI_ADDRESS] = {
        name: "Yearn DAI",
        type: AdapterInterface.YEARN_V2,
        icon: "/protocols/yearn.svg"
    },
    _a[exports.YEARN_DAI_KOVAN_MOCK] = {
        name: "Yearn DAI",
        type: AdapterInterface.YEARN_V2,
        icon: "/protocols/yearn.svg"
    },
    _a[exports.YEARN_USDC_ADDRESS] = {
        name: "Yearn USDC",
        type: AdapterInterface.YEARN_V2,
        icon: "/protocols/yearn.svg"
    },
    _a[exports.YEARN_USDC_KOVAN_MOCK] = {
        name: "Yearn USDC",
        type: AdapterInterface.YEARN_V2,
        icon: "/protocols/yearn.svg"
    },
    _a[exports.SUSHISWAP_KOVAN] = {
        name: "Sushiswap",
        type: AdapterInterface.UNISWAP_V2,
        icon: "/protocols/sushi.svg"
    },
    _a);
