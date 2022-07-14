"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LidoMulticaller = exports.LidoCalls = void 0;
var types_1 = require("../types");
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
