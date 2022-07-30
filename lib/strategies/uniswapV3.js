"use strict";
// import { BigNumberish } from "ethers";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3Multicaller = exports.UniswapV3Calls = void 0;
var types_1 = require("../types");
var UniswapV3Calls = /** @class */ (function () {
    function UniswapV3Calls() {
    }
    UniswapV3Calls.exactInputSingle = function (params) {
        return types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInputSingle", [params]);
    };
    UniswapV3Calls.exactAllInputSingle = function (params) {
        return types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactAllInputSingle", [params]);
    };
    UniswapV3Calls.exactInput = function (params) {
        return types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInput", [params]);
    };
    UniswapV3Calls.exactAllInput = function (params) {
        return types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactAllInput", [params]);
    };
    UniswapV3Calls.exactOutputSingle = function (params) {
        return types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactOutputSingle", [params]);
    };
    UniswapV3Calls.exactOutput = function (params) {
        return types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactOutput", [params]);
    };
    return UniswapV3Calls;
}());
exports.UniswapV3Calls = UniswapV3Calls;
var UniswapV3Multicaller = /** @class */ (function () {
    function UniswapV3Multicaller(address) {
        this._address = address;
    }
    UniswapV3Multicaller.connect = function (address) {
        return new UniswapV3Multicaller(address);
    };
    UniswapV3Multicaller.prototype.exactInputSingle = function (params) {
        return {
            target: this._address,
            callData: UniswapV3Calls.exactInputSingle(params)
        };
    };
    UniswapV3Multicaller.prototype.exactAllInputSingle = function (params) {
        return {
            target: this._address,
            callData: UniswapV3Calls.exactAllInputSingle(params)
        };
    };
    UniswapV3Multicaller.prototype.exactInput = function (params) {
        return {
            target: this._address,
            callData: UniswapV3Calls.exactInput(params)
        };
    };
    UniswapV3Multicaller.prototype.exactAllInput = function (params) {
        return {
            target: this._address,
            callData: UniswapV3Calls.exactAllInput(params)
        };
    };
    UniswapV3Multicaller.prototype.exactOutputSingle = function (params) {
        return {
            target: this._address,
            callData: UniswapV3Calls.exactOutputSingle(params)
        };
    };
    UniswapV3Multicaller.prototype.exactOutput = function (params) {
        return {
            target: this._address,
            callData: UniswapV3Calls.exactOutput(params)
        };
    };
    return UniswapV3Multicaller;
}());
exports.UniswapV3Multicaller = UniswapV3Multicaller;
