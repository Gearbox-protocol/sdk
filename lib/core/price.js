"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcTotalPrice = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("./constants");
var calcTotalPrice = function (price, amount, decimals) {
    if (decimals === void 0) { decimals = 18; }
    return amount
        .mul(constants_1.WAD)
        .mul(price)
        .div(ethers_1.BigNumber.from(10).pow(decimals))
        .div(constants_1.PRICE_DECIMALS);
};
exports.calcTotalPrice = calcTotalPrice;
