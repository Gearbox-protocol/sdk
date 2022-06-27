"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractsByAddress = exports.contractParams = exports.UNISWAP_V3_QUOTER = exports.contractsByNetwork = void 0;
/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */
var mappers_1 = require("../utils/mappers");
var adapters_1 = require("./adapters");
var protocols_1 = require("./protocols");
var token_1 = require("../tokens/token");
exports.contractsByNetwork = {
    Mainnet: {
        UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        // CURVE
        CURVE_3CRV_POOL: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
        CURVE_STETH_GATEWAY: "0xE91Af09e2F11eB7548a7C246C5f80e2D80da88C3",
        CURVE_FRAX_POOL: token_1.tokenDataByNetwork.Mainnet.FRAX3CRV,
        CURVE_LUSD_POOL: token_1.tokenDataByNetwork.Mainnet.LUSD3CRV,
        CURVE_SUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
        CURVE_GUSD_POOL: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956",
        // YEARN
        YEARN_DAI_VAULT: token_1.tokenDataByNetwork.Mainnet.yvDAI,
        YEARN_USDC_VAULT: token_1.tokenDataByNetwork.Mainnet.yvUSDC,
        YEARN_WETH_VAULT: token_1.tokenDataByNetwork.Mainnet.yvWETH,
        YEARN_WBTC_VAULT: token_1.tokenDataByNetwork.Mainnet.yvWBTC,
        YEARN_CURVE_FRAX_VAULT: token_1.tokenDataByNetwork.Mainnet.yvCurve_FRAX,
        YEARN_CURVE_STETH_VAULT: token_1.tokenDataByNetwork.Mainnet.yvCurve_stETH,
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
    Kovan: {
        UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        SUSHISWAP_ROUTER: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
        // CURVE
        CURVE_3CRV_POOL: "0xbeB70c9939Db74bbbFf97A0950Ee428432E90B1e",
        CURVE_STETH_GATEWAY: "0xE0708783F04a0b62E74996815a5635948a258822",
        CURVE_FRAX_POOL: token_1.tokenDataByNetwork.Kovan.FRAX3CRV,
        CURVE_LUSD_POOL: token_1.tokenDataByNetwork.Kovan.LUSD3CRV,
        CURVE_SUSD_POOL: "0xcb7F2aB6844031AC8a7A3F29424D9eB2851Eb38f",
        CURVE_SUSD_DEPOSIT: "0xCe3C8FF6d764144Da82B0441ab4a804711FfA4b8",
        CURVE_GUSD_POOL: "0xFD5c1f55c9a42BA56c7Def22458c998473E12246",
        // YEARN
        YEARN_DAI_VAULT: token_1.tokenDataByNetwork.Kovan.yvDAI,
        YEARN_USDC_VAULT: token_1.tokenDataByNetwork.Kovan.yvUSDC,
        YEARN_WETH_VAULT: token_1.tokenDataByNetwork.Kovan.yvWETH,
        YEARN_WBTC_VAULT: token_1.tokenDataByNetwork.Kovan.yvWBTC,
        YEARN_CURVE_FRAX_VAULT: token_1.tokenDataByNetwork.Kovan.yvCurve_FRAX,
        YEARN_CURVE_STETH_VAULT: token_1.tokenDataByNetwork.Kovan.yvCurve_stETH,
        // CONVEX
        CONVEX_BOOSTER: "0x6cf009c9f0C3eFea2487CED54C11f2AeaBE76141",
        CONVEX_3CRV_POOL: "0x9103EC8d5167afb6247B477f2973e55cA7af5cC4",
        CONVEX_GUSD_POOL: "0x77C00282CeA8b9d65DC7608119Fe118946041685",
        CONVEX_SUSD_POOL: "0xE37bbe5f655253076B014931D3637e31ddA61F88",
        CONVEX_STECRV_POOL: "0x015c158325E59686cd4e49A4603e705C23B46aDF",
        CONVEX_FRAX3CRV_POOL: "0x5e1302c2969641f79C4504F368BD663d7B22EAE5",
        CONVEX_CLAIM_ZAP: "",
        // LIDO
        LIDO_STETH_GATEWAY: "0x0aaEB0372c2a32088D4F2c9a6ECfB3fFc7Fa2ffF"
    }
};
exports.UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
exports.contractParams = {
    UNISWAP_V2_ROUTER: {
        name: "Uniswap V2",
        protocol: protocols_1.Protocols.Uniswap,
        type: adapters_1.AdapterInterface.UNISWAP_V2_ROUTER
    },
    UNISWAP_V3_ROUTER: {
        name: "Uniswap V3",
        protocol: protocols_1.Protocols.Uniswap,
        quoter: exports.UNISWAP_V3_QUOTER,
        type: adapters_1.AdapterInterface.UNISWAP_V3_ROUTER
    },
    SUSHISWAP_ROUTER: {
        name: "Sushiswap",
        protocol: protocols_1.Protocols.Sushiswap,
        type: adapters_1.AdapterInterface.UNISWAP_V2_ROUTER
    },
    CURVE_3CRV_POOL: {
        name: "Curve 3Pool",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_3ASSETS,
        lpToken: "3Crv",
        tokens: ["DAI", "USDC", "USDT"]
    },
    CURVE_STETH_GATEWAY: {
        name: "Curve stETH",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_STECRV_POOL,
        pool: {
            Mainnet: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
            Kovan: "0x6db94f454d7e2d2e25e4B2A8231E00925bD08a98"
        },
        lpToken: "steCRV"
    },
    CURVE_FRAX_POOL: {
        name: "Curve FRAX",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_2ASSETS,
        lpToken: "FRAX3CRV",
        tokens: ["3Crv", "FRAX"]
    },
    CURVE_LUSD_POOL: {
        name: "Curve LUSD",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_2ASSETS,
        lpToken: "LUSD3CRV",
        tokens: ["3Crv", "LUSD"]
    },
    CURVE_SUSD_POOL: {
        name: "Curve SUSD",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_4ASSETS,
        lpToken: "crvPlain3andSUSD",
        tokens: ["DAI", "USDC", "USDT", "sUSD"],
        wrapper: "CURVE_SUSD_DEPOSIT"
    },
    CURVE_SUSD_DEPOSIT: {
        name: "Curve SUSD",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_WRAPPER,
        lpToken: "crvPlain3andSUSD",
        tokens: ["DAI", "USDC", "USDT", "sUSD"],
        wrapper: "CURVE_SUSD_DEPOSIT"
    },
    CURVE_GUSD_POOL: {
        name: "Curve GUSD",
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_2ASSETS,
        lpToken: "gusd3CRV",
        tokens: ["3Crv", "FRAX"]
    },
    YEARN_DAI_VAULT: {
        name: "Yearn DAI",
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_USDC_VAULT: {
        name: "Yearn USDC",
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_WETH_VAULT: {
        name: "Yearn WETH",
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_WBTC_VAULT: {
        name: "Yearn WBTC",
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_CURVE_FRAX_VAULT: {
        name: "Yearn Curve FRAX",
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_CURVE_STETH_VAULT: {
        name: "Yearn Curve STETH",
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    CONVEX_BOOSTER: {
        name: "Convex BOOSTER",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BOOSTER
    },
    CONVEX_3CRV_POOL: {
        name: "Convex 3crv",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvx3Crv"
    },
    CONVEX_GUSD_POOL: {
        name: "Convex GUSD",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxgusd3CRV"
    },
    CONVEX_SUSD_POOL: {
        name: "Convex SUSD",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxcrvPlain3andSUSD"
    },
    CONVEX_STECRV_POOL: {
        name: "Convex STECRV",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxsteCRV"
    },
    CONVEX_FRAX3CRV_POOL: {
        name: "Convex FRAX3CRV",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxFRAX3CRV"
    },
    CONVEX_CLAIM_ZAP: {
        name: "Convex ZAP",
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_CLAIM_ZAP
    },
    LIDO_STETH_GATEWAY: {
        name: "Lido STETH",
        protocol: protocols_1.Protocols.Lido,
        type: adapters_1.AdapterInterface.LIDO_V1,
        // contract: {
        //     Mainnet: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
        //     Kovan: ""
        // },
        lpToken: "steCRV"
    }
};
exports.contractsByAddress = (0, mappers_1.objectEntries)(exports.contractsByNetwork).reduce(function (sum, _a) {
    var _ = _a[0], contracts = _a[1];
    return __assign(__assign({}, sum), (0, mappers_1.keyToLowercase)((0, mappers_1.swapKeyValue)(contracts)));
}, {});
