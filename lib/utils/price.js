"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertByPrice = exports.calcTotalPrice = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("../core/constants");
var calcTotalPrice = function (price, amount, decimals) {
    if (decimals === void 0) { decimals = 18; }
    return amount
        .mul(constants_1.WAD)
        .mul(price)
        .div(ethers_1.BigNumber.from(10).pow(decimals))
        .div(constants_1.PRICE_DECIMALS);
};
exports.calcTotalPrice = calcTotalPrice;
function convertByPrice(totalMoney, _a) {
    var targetPrice = _a.price, _b = _a.decimals, targetDecimals = _b === void 0 ? 18 : _b;
    var isWrongTargetPrice = targetPrice.isZero() || targetPrice.isNegative();
    return isWrongTargetPrice
        ? ethers_1.BigNumber.from(0)
        : totalMoney
            .mul(ethers_1.BigNumber.from(10).pow(targetDecimals))
            .mul(constants_1.PRICE_DECIMALS)
            .div(targetPrice)
            .div(constants_1.WAD);
}
exports.convertByPrice = convertByPrice;
