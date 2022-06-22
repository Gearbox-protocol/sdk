"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceCalc = exports.PRICE_DECIMALS = void 0;
var ethers_1 = require("ethers");
exports.PRICE_DECIMALS = 1000;
var priceCalc = function (price, amount, token) {
    var _a = (token || {}).decimals, decimals = _a === void 0 ? 18 : _a;
    return amount
        .mul(Math.floor(exports.PRICE_DECIMALS * price))
        .div(ethers_1.BigNumber.from(10).pow(decimals));
};
exports.priceCalc = priceCalc;
