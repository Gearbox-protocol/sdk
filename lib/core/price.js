"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcTotalPrice = void 0;
var ethers_1 = require("ethers");
var calcTotalPrice = function (price, amount, decimals) {
    if (decimals === void 0) { decimals = 18; }
    return amount.mul(price).div(ethers_1.BigNumber.from(10).pow(decimals));
};
exports.calcTotalPrice = calcTotalPrice;
