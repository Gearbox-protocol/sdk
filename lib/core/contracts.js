"use strict";
/*
 * SPDX-License-Identifier: BSL-1.1
 * Gearbox. Generalized leverage protocol, which allows to take leverage and then use it across other DeFi protocols and platforms in a composable way.
 * (c) Gearbox.fi, 2021
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractParams = exports.UNISWAP_V3_QUOTER = exports.contractsByNetwork = void 0;
var adapters_1 = require("./adapters");
var protocols_1 = require("./protocols");
var token_1 = require("./token");
exports.contractsByNetwork = {
    Mainnet: {
        UNISWAP_V2_ROUTER: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        UNISWAP_V3_ROUTER: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        SUSHISWAP_ROUTER: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
        // CURVE
        CURVE_3CRV_POOL: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
        CURVE_STETH_GATEWAY: "0xB949Ef5b39164537ee97BF17b968e465368C97AD",
        CURVE_FRAX_POOL: token_1.tokenDataByNetwork.Mainnet.FRAX3CRV,
        CURVE_LUSD_POOL: token_1.tokenDataByNetwork.Mainnet.LUSD3CRV,
        CURVE_SUSD_POOL: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
        CURVE_GUSD_POOL: "0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956",
        // YEARN
        YEARN_DAI_VAULT: token_1.tokenDataByNetwork.Mainnet.yvDAI,
        YEARN_USDC_VAULT: token_1.tokenDataByNetwork.Mainnet.yvUSDC,
        YEARN_WETH_VAULT: token_1.tokenDataByNetwork.Mainnet.yvWETH,
        YEARN_WBTC_VAULT: token_1.tokenDataByNetwork.Mainnet.yvWBTC,
        YEARN_CURVE_FRAX_VAULT: token_1.tokenDataByNetwork.Mainnet.yvCURVE_FRAX_POOL,
        YEARN_CURVE_STETH_VAULT: token_1.tokenDataByNetwork.Mainnet.yvCurve_stETH,
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
        CURVE_LUSD_POOL: token_1.tokenDataByNetwork.Kovan.LUSD3CRV,
        CURVE_SUSD_POOL: "0x032f1cE00865F3499C0052ceBA5F2348842416DB",
        CURVE_GUSD_POOL: "",
        // YEARN
        YEARN_DAI_VAULT: token_1.tokenDataByNetwork.Kovan.yvDAI,
        YEARN_USDC_VAULT: token_1.tokenDataByNetwork.Kovan.yvUSDC,
        YEARN_WETH_VAULT: token_1.tokenDataByNetwork.Kovan.yvWETH,
        YEARN_WBTC_VAULT: token_1.tokenDataByNetwork.Kovan.yvWBTC,
        YEARN_CURVE_FRAX_VAULT: token_1.tokenDataByNetwork.Kovan.yvCURVE_FRAX_POOL,
        YEARN_CURVE_STETH_VAULT: token_1.tokenDataByNetwork.Kovan.yvCurve_stETH,
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
exports.UNISWAP_V3_QUOTER = "0xb27308f9f90d607463bb33ea1bebb41c27ce5ab6";
exports.contractParams = {
    UNISWAP_V2_ROUTER: {
        protocol: protocols_1.Protocols.Uniswap,
        type: adapters_1.AdapterInterface.UNISWAP_V2_ROUTER
    },
    UNISWAP_V3_ROUTER: {
        protocol: protocols_1.Protocols.Uniswap,
        quoter: exports.UNISWAP_V3_QUOTER,
        type: adapters_1.AdapterInterface.UNISWAP_V3_ROUTER
    },
    SUSHISWAP_ROUTER: {
        protocol: protocols_1.Protocols.Sushiswap,
        type: adapters_1.AdapterInterface.UNISWAP_V2_ROUTER
    },
    CURVE_3CRV_POOL: {
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_3ASSETS,
        lpToken: "3Crv",
        tokens: ["DAI", "USDC", "USDT"]
    },
    CURVE_STETH_GATEWAY: {
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_STECRV_POOL,
        pool: {
            Mainnet: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
            Kovan: "0xF695d3aa358D5087A0C157DBb9449d4f0d8E534a"
        }
    },
    CURVE_FRAX_POOL: {
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_2ASSETS,
        lpToken: "FRAX3CRV",
        tokens: ["3Crv", "FRAX"]
    },
    CURVE_LUSD_POOL: {
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_2ASSETS,
        lpToken: "LUSD3CRV",
        tokens: ["3Crv", "LUSD"]
    },
    CURVE_SUSD_POOL: {
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_4ASSETS,
        lpToken: "crvPlain3andSUSD",
        tokens: ["DAI", "USDC", "USDT", "sUSD"]
    },
    CURVE_GUSD_POOL: {
        protocol: protocols_1.Protocols.Curve,
        type: adapters_1.AdapterInterface.CURVE_V1_2ASSETS,
        lpToken: "gusd3CRV",
        tokens: ["3Crv", "FRAX"]
    },
    YEARN_DAI_VAULT: {
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_USDC_VAULT: {
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_WETH_VAULT: {
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_WBTC_VAULT: {
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_CURVE_FRAX_VAULT: {
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    YEARN_CURVE_STETH_VAULT: {
        protocol: protocols_1.Protocols.Yearn,
        type: adapters_1.AdapterInterface.YEARN_V2
    },
    CONVEX_BOOSTER: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BOOSTER
    },
    CONVEX_3CRV_POOL: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvx3Crv"
    },
    CONVEX_GUSD_POOL: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxgusd3CRV"
    },
    CONVEX_SUSD_POOL: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxcrvPlain3andSUSD"
    },
    CONVEX_STECRV_POOL: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxsteCRV"
    },
    CONVEX_FRAX3CRV_POOL: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
        stakedToken: "stkcvxFRAX3CRV"
    },
    CONVEX_CLAIM_ZAP: {
        protocol: protocols_1.Protocols.Convex,
        type: adapters_1.AdapterInterface.CONVEX_V1_CLAIM_ZAP
    },
    LIDO_STETH_GATEWAY: {
        protocol: protocols_1.Protocols.Lido,
        type: adapters_1.AdapterInterface.LIDO_V1,
        contract: {
            Mainnet: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            Kovan: ""
        }
    }
};
