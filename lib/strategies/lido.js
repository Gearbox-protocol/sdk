"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LidoStrategies = exports.LidoMulticaller = exports.LidoCalls = void 0;
var constants_1 = require("src/core/constants");
var contracts_1 = require("src/contracts/contracts");
var token_1 = require("src/tokens/token");
var types_1 = require("../types");
var uniswapV2_1 = require("./uniswapV2");
var LidoCalls = /** @class */ (function () {
    function LidoCalls() {
    }
    LidoCalls.submit = function (amount) {
        return types_1.LidoV1Adapter__factory.createInterface().encodeFunctionData("submit", [amount]);
    };
    LidoCalls.submitAll = function () {
        return types_1.LidoV1Adapter__factory.createInterface().encodeFunctionData("submitAll");
    };
    return LidoCalls;
}());
exports.LidoCalls = LidoCalls;
var LidoMulticaller = /** @class */ (function () {
    function LidoMulticaller(address) {
        this._address = address;
    }
    LidoMulticaller.connect = function (address) {
        return new LidoMulticaller(address);
    };
    LidoMulticaller.prototype.submit = function (amount) {
        return {
            target: this._address,
            callData: LidoCalls.submit(amount)
        };
    };
    LidoMulticaller.prototype.submitAll = function () {
        return {
            target: this._address,
            callData: LidoCalls.submitAll()
        };
    };
    return LidoMulticaller;
}());
exports.LidoMulticaller = LidoMulticaller;
var LidoStrategies = /** @class */ (function () {
    function LidoStrategies() {
    }
    LidoStrategies.mintSteth = function (data, network, underlyingAmount) {
        var calls = [];
        // This should be a pathfinder call
        if (!data.isWETH) {
            calls.push(uniswapV2_1.UniswapV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network].UNISWAP_V2_ROUTER]).swapExactTokensForTokens(underlyingAmount, 0, [data.underlyingToken, token_1.tokenDataByNetwork[network].WETH], constants_1.ADDRESS_0X0, Math.floor(new Date().getTime() / 1000) + 3600));
        }
        calls.push(LidoMulticaller.connect(data.adapters[contracts_1.contractsByNetwork[network].LIDO_STETH_GATEWAY]).submitAll());
        return calls;
    };
    return LidoStrategies;
}());
exports.LidoStrategies = LidoStrategies;
