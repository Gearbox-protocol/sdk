"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatHf = exports.formatDate = exports.formatRate = exports.shortHash = exports.shortAddress = exports.toBN = exports.toSignificant = exports.toHumanFormat = exports.formatBn4dig = exports.formatBN = exports.formatRAY = exports.rayToNumber = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("../core/constants");
var decimal_js_light_1 = __importDefault(require("decimal.js-light"));
function rayToNumber(num) {
    return (ethers_1.BigNumber.from(num).div(ethers_1.BigNumber.from(10).pow(21)).toNumber() / 1000000);
}
exports.rayToNumber = rayToNumber;
function formatRAY(num) {
    return toSignificant(num || ethers_1.BigNumber.from(0), 27);
}
exports.formatRAY = formatRAY;
function formatBN(num, decimals, precision) {
    if (!num)
        return "-";
    // if (BigNumber.from(num).gt(BigNumber.from(10).pow(37))) {
    //   return "MAX";
    // }
    if (!precision && ethers_1.BigNumber.from(num).gt(ethers_1.BigNumber.from(10).pow(21))) {
        precision = 2;
    }
    if (!precision && ethers_1.BigNumber.from(num).gt(ethers_1.BigNumber.from(10).pow(24))) {
        precision = 0;
    }
    if (ethers_1.BigNumber.from(num).lte(2)) {
        num = ethers_1.BigNumber.from(0);
    }
    var number = ethers_1.BigNumber.from(num).div(ethers_1.BigNumber.from(10).pow((decimals || 18) - 6));
    if (number.lte(10000) && !number.isZero()) {
        precision = 3;
    }
    if (number.lte(1000) && !number.isZero()) {
        precision = 4;
    }
    if (number.lte(100) && !number.isZero()) {
        precision = 5;
    }
    if (number.lte(10) && !number.isZero()) {
        precision = 6;
    }
    return toHumanFormat(number, precision);
}
exports.formatBN = formatBN;
function formatBn4dig(num, precision) {
    if (precision === void 0) { precision = 2; }
    if (precision > 6)
        throw new Error("Incorrect precision");
    var numStr = num.toString();
    if (numStr.length < 6)
        numStr = "0".repeat(6 - numStr.length) + numStr;
    return numStr.length <= 6
        ? "0." + numStr.slice(0, precision)
        : numStr.slice(0, numStr.length - 6) +
            "." +
            numStr.slice(numStr.length - 6, numStr.length - 6 + precision);
}
exports.formatBn4dig = formatBn4dig;
function toHumanFormat(num, precision) {
    if (precision === void 0) { precision = 2; }
    if (num.gte(1e15)) {
        return formatBn4dig(num.div(1e9), precision) + "Bn";
    }
    if (num.gte(1e12)) {
        return formatBn4dig(num.div(1e6), precision) + "M";
    }
    if (num.gte(1e9)) {
        return formatBn4dig(num.div(1e3), precision) + "K";
    }
    return formatBn4dig(num, precision);
}
exports.toHumanFormat = toHumanFormat;
function toSignificant(num, decimals) {
    if (num.toString() === "1")
        return "0";
    var divider = new decimal_js_light_1.default(10).toPower(decimals);
    var number = new decimal_js_light_1.default(num.toString()).div(divider);
    return number.toSignificantDigits(6, 4).toString();
}
exports.toSignificant = toSignificant;
function toBN(num, decimals) {
    if (num === "")
        return ethers_1.BigNumber.from(0);
    var multiplier = new decimal_js_light_1.default(10).toPower(decimals);
    var number = new decimal_js_light_1.default(num).mul(multiplier);
    return ethers_1.BigNumber.from(number.toFixed(0));
}
exports.toBN = toBN;
function shortAddress(address) {
    return address === undefined
        ? ""
        : "".concat(address.substr(0, 6), "...").concat(address.substr(38, 4));
}
exports.shortAddress = shortAddress;
function shortHash(address) {
    return address === undefined ? "" : "".concat(address.substr(0, 5), "...");
}
exports.shortHash = shortHash;
var formatRate = function (rate) {
    return rate
        ? (ethers_1.BigNumber.from(rate)
            .mul(constants_1.PERCENTAGE_FACTOR)
            .mul(100)
            .div(constants_1.RAY)
            .toNumber() / constants_1.PERCENTAGE_FACTOR).toFixed(2) + "%"
        : "0.00%";
};
exports.formatRate = formatRate;
function formatDate(date) {
    var d = new Date(date), month = "" + (d.getMonth() + 1), day = "" + d.getDate(), year = d.getFullYear();
    if (month.length < 2)
        month = "0" + month;
    if (day.length < 2)
        day = "0" + day;
    return [year, month, day].join("-");
}
exports.formatDate = formatDate;
function formatHf(healthFactor) {
    return (healthFactor / 10000).toFixed(2);
}
exports.formatHf = formatHf;
