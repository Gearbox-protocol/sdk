"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gearTokens = void 0;
var tokenType_1 = require("./tokenType");
exports.gearTokens = {
    //GEARBOX
    dDAI: {
        name: "dDAI",
        decimals: 18,
        symbol: "dDAI",
        type: tokenType_1.TokenType.DIESEL_LP_TOKEN
    },
    dUSDC: {
        name: "dUSDC",
        decimals: 6,
        symbol: "dUSDC",
        type: tokenType_1.TokenType.DIESEL_LP_TOKEN
    },
    dWBTC: {
        name: "dWBTC",
        decimals: 8,
        symbol: "dWBTC",
        type: tokenType_1.TokenType.DIESEL_LP_TOKEN
    },
    dWETH: {
        name: "dWETH",
        decimals: 18,
        symbol: "dWETH",
        type: tokenType_1.TokenType.DIESEL_LP_TOKEN
    },
    GEAR: {
        name: "GEAR",
        decimals: 18,
        symbol: "GEAR",
        type: tokenType_1.TokenType.NORMAL_TOKEN
    }
};
