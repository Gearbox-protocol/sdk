"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV2Multicaller = exports.UniswapV2Calls = void 0;
var types_1 = require("../types");
var UniswapV2Calls = /** @class */ (function () {
    function UniswapV2Calls() {
    }
    UniswapV2Calls.swapExactTokensForTokens = function (amountIn, amountOutMin, path, to, deadline) {
        return types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [amountIn, amountOutMin, path, to, deadline]);
    };
    UniswapV2Calls.swapTokensForExactTokens = function (amountOut, amountInMax, path, to, deadline) {
        return types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapTokensForExactTokens", [amountOut, amountInMax, path, to, deadline]);
    };
    UniswapV2Calls.swapAllTokensForTokens = function (rateMinRAY, path, deadline) {
        return types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapAllTokensForTokens", [rateMinRAY, path, deadline]);
    };
    return UniswapV2Calls;
}());
exports.UniswapV2Calls = UniswapV2Calls;
var UniswapV2Multicaller = /** @class */ (function () {
    function UniswapV2Multicaller(address) {
        this._address = address;
    }
    UniswapV2Multicaller.prototype.swapExactTokensForTokens = function (amountIn, amountOutMin, path, to, deadline) {
        return {
            target: this._address,
            callData: UniswapV2Calls.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)
        };
    };
    UniswapV2Multicaller.prototype.swapTokensForExactTokens = function (amountOut, amountInMax, path, to, deadline) {
        return {
            target: this._address,
            callData: UniswapV2Calls.swapExactTokensForTokens(amountOut, amountInMax, path, to, deadline)
        };
    };
    UniswapV2Multicaller.prototype.swapAllTokensForTokens = function (rateMinRAY, path, deadline) {
        return {
            target: this._address,
            callData: UniswapV2Calls.swapAllTokensForTokens(rateMinRAY, path, deadline)
        };
    };
    return UniswapV2Multicaller;
}());
exports.UniswapV2Multicaller = UniswapV2Multicaller;
