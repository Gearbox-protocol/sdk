"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditFacadeMulticaller = exports.CreditFacadeCalls = void 0;
var types_1 = require("../types");
var CreditFacadeCalls = /** @class */ (function () {
    function CreditFacadeCalls() {
    }
    CreditFacadeCalls.addCollateral = function (onBehalfOf, token, amount) {
        return types_1.ICreditFacade__factory.createInterface().encodeFunctionData("addCollateral", [onBehalfOf, token, amount]);
    };
    CreditFacadeCalls.increaseDebt = function (amount) {
        return types_1.ICreditFacade__factory.createInterface().encodeFunctionData("increaseDebt", [amount]);
    };
    CreditFacadeCalls.decreaseDebt = function (amount) {
        return types_1.ICreditFacade__factory.createInterface().encodeFunctionData("decreaseDebt", [amount]);
    };
    CreditFacadeCalls.revertIfBalanceLessThan = function (token, minBalance) {
        return types_1.ICreditFacadeExtended__factory.createInterface().encodeFunctionData("revertIfBalanceLessThan", [token, minBalance]);
    };
    CreditFacadeCalls.disableToken = function (token) {
        return types_1.ICreditFacadeExtended__factory.createInterface().encodeFunctionData("disableToken", [token]);
    };
    CreditFacadeCalls.enableToken = function (token) {
        return types_1.ICreditFacade__factory.createInterface().encodeFunctionData("enableToken", [token]);
    };
    return CreditFacadeCalls;
}());
exports.CreditFacadeCalls = CreditFacadeCalls;
var CreditFacadeMulticaller = /** @class */ (function () {
    function CreditFacadeMulticaller(address) {
        this._address = address;
    }
    CreditFacadeMulticaller.connect = function (address) {
        return new CreditFacadeMulticaller(address);
    };
    CreditFacadeMulticaller.prototype.addCollateral = function (onBehalfOf, token, amount) {
        return {
            target: this._address,
            callData: CreditFacadeCalls.addCollateral(onBehalfOf, token, amount)
        };
    };
    CreditFacadeMulticaller.prototype.increaseDebt = function (amount) {
        return {
            target: this._address,
            callData: CreditFacadeCalls.increaseDebt(amount)
        };
    };
    CreditFacadeMulticaller.prototype.decreaseDebt = function (amount) {
        return {
            target: this._address,
            callData: CreditFacadeCalls.decreaseDebt(amount)
        };
    };
    CreditFacadeMulticaller.prototype.revertIfBalanceLessThan = function (token, minBalance) {
        return {
            target: this._address,
            callData: CreditFacadeCalls.revertIfBalanceLessThan(token, minBalance)
        };
    };
    CreditFacadeMulticaller.prototype.disableToken = function (token) {
        return {
            target: this._address,
            callData: CreditFacadeCalls.disableToken(token)
        };
    };
    CreditFacadeMulticaller.prototype.enableToken = function (token) {
        return {
            target: this._address,
            callData: CreditFacadeCalls.enableToken(token)
        };
    };
    return CreditFacadeMulticaller;
}());
exports.CreditFacadeMulticaller = CreditFacadeMulticaller;
