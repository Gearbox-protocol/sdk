"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqrt = exports.percentMul = exports.rayDiv = exports.rayMul = exports.revertRay = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("../core/constants");
var ONE = ethers_1.BigNumber.from(1);
var TWO = ethers_1.BigNumber.from(2);
function revertRay(num) {
    if (!num)
        return undefined;
    return constants_1.RAY.mul(constants_1.RAY).div(num);
}
exports.revertRay = revertRay;
function rayMul(a, b) {
    if (a.isZero() || b.isZero()) {
        return ethers_1.BigNumber.from(0);
    }
    return a.mul(b).add(constants_1.halfRAY).div(constants_1.RAY);
}
exports.rayMul = rayMul;
function rayDiv(a, b) {
    var halfB = b.div(2);
    return a.mul(constants_1.RAY).add(halfB).div(b);
}
exports.rayDiv = rayDiv;
function percentMul(a, b) {
    if (a.isZero() || b === 0)
        return ethers_1.BigNumber.from(0);
    return a
        .mul(b)
        .add(constants_1.PERCENTAGE_FACTOR / 2)
        .div(constants_1.PERCENTAGE_FACTOR);
}
exports.percentMul = percentMul;
function sqrt(x) {
    var z = x.add(ONE).div(TWO);
    var y = x;
    while (z.sub(y).isNegative()) {
        y = z;
        z = x.div(z).add(z).div(TWO);
    }
    return y;
}
exports.sqrt = sqrt;
