"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnectors = exports.connectors = exports.WETHToken = exports.TokenData = void 0;
var config_1 = require("../config");
var token_1 = require("./token");
var defaultSymbolReplacement = {
    dWETH: "dETH",
    WETH: "ETH"
};
var TokenData = /** @class */ (function () {
    function TokenData(payload, symbolReplacements) {
        if (symbolReplacements === void 0) { symbolReplacements = defaultSymbolReplacement; }
        var _a;
        this.id = payload.addr;
        this.address = payload.addr;
        // this.name = payload.name;
        this.symbol = symbolReplacements[payload.symbol] || payload.symbol;
        this.decimals = payload.decimals;
        this.icon = "".concat(config_1.STATIC_TOKEN).concat((_a = payload.symbol) === null || _a === void 0 ? void 0 : _a.toLowerCase(), ".svg");
    }
    TokenData.prototype.compareBySymbol = function (b) {
        return this.symbol > b.symbol ? 1 : -1;
    };
    return TokenData;
}());
exports.TokenData = TokenData;
exports.WETHToken = {
    Mainnet: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    Kovan: "0xd0a1e359811322d97991e03f863a0c30c2cf029c",
    Goerli: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
};
exports.connectors = {
    Mainnet: [
        "WETH",
        "1INCH",
        "DAI",
        "USDC",
        // "USDT",
        "WBTC"
        // "stETH",
        // "PAX",
        // "TUSD",
        // "BNT",
        // "BAL",
        // "sUSD",
    ],
    Kovan: ["WETH", "DAI", "USDC", "WBTC"],
    Goerli: ["WETH", "DAI", "USDC", "WBTC"]
};
function getConnectors(networkType) {
    return exports.connectors[networkType].map(function (e) {
        var result = e === "WETH"
            ? exports.WETHToken[networkType]
            : token_1.tokenDataByNetwork[networkType][e];
        if (!result) {
            throw new Error("connector token ".concat(e, " not found"));
        }
        return result;
    });
}
exports.getConnectors = getConnectors;
