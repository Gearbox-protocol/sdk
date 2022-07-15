"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESS_0x0 = exports.SLIPPAGE_DECIMALS = exports.LEVERAGE_DECIMALS = exports.timeRanges = exports.UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD = exports.LIQUIDATION_DISCOUNTED_SUM = exports.PERCENTAGE_FACTOR = exports.PERCENTAGE_DECIMALS = exports.SECONDS_PER_YEAR = exports.WAD = exports.WAD_DECIMALS = exports.halfRAY = exports.RAY = exports.RAY_DECIMALS = exports.getNetworkType = exports.LOCAL_NETWORK = exports.KOVAN_NETWORK = exports.MAINNET_NETWORK = exports.MAX_INT = void 0;
var ethers_1 = require("ethers");
exports.MAX_INT = ethers_1.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
exports.MAINNET_NETWORK = 1;
exports.KOVAN_NETWORK = 42;
exports.LOCAL_NETWORK = 1337;
var getNetworkType = function (chainId) {
    switch (chainId) {
        case exports.MAINNET_NETWORK:
        case exports.LOCAL_NETWORK:
            return "Mainnet";
        case exports.KOVAN_NETWORK:
            return "Kovan";
        default:
            throw new Error("unknown network");
    }
};
exports.getNetworkType = getNetworkType;
exports.RAY_DECIMALS = 27;
exports.RAY = ethers_1.BigNumber.from(10).pow(exports.RAY_DECIMALS);
exports.halfRAY = exports.RAY.div(2);
exports.WAD_DECIMALS = 18;
exports.WAD = ethers_1.BigNumber.from(10).pow(exports.WAD_DECIMALS);
exports.SECONDS_PER_YEAR = 365 * 24 * 3600;
exports.PERCENTAGE_DECIMALS = 100;
exports.PERCENTAGE_FACTOR = 1e4;
exports.LIQUIDATION_DISCOUNTED_SUM = 9500;
exports.UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD = 9300;
exports.timeRanges = {
    // "1H": 3600,
    "1D": 3600 * 24,
    "1W": 3600 * 24 * 7,
    "1M": 3600 * 24 * 30,
    "1Y": 3600 * 24 * 365
};
exports.LEVERAGE_DECIMALS = 100;
exports.SLIPPAGE_DECIMALS = 100;
exports.ADDRESS_0x0 = "0x0000000000000000000000000000000000000000";
