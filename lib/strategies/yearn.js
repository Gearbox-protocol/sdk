"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearnV2Multicaller = exports.YearnV2Calls = void 0;
var types_1 = require("../types");
var YearnV2Calls = /** @class */ (function () {
    function YearnV2Calls() {
    }
    YearnV2Calls.deposit = function (amount, recipient) {
        var contractInterface = types_1.YearnV2Adapter__factory.createInterface();
        if (amount && recipient) {
            return contractInterface.encodeFunctionData("deposit(uint256,address)", [amount, recipient]);
        }
        else if (amount) {
            return contractInterface.encodeFunctionData("deposit(uint256)", [amount]);
        }
        else {
            return contractInterface.encodeFunctionData("deposit()");
        }
    };
    YearnV2Calls.withdraw = function (maxShares, recipient, maxLoss) {
        var contractInterface = types_1.YearnV2Adapter__factory.createInterface();
        if (maxShares && recipient && maxLoss) {
            return contractInterface.encodeFunctionData("withdraw(uint256,address,uint256)", [maxShares, recipient, maxLoss]);
        }
        if (maxShares && recipient) {
            return contractInterface.encodeFunctionData("withdraw(uint256,address)", [maxShares, recipient]);
        }
        else if (maxShares) {
            return contractInterface.encodeFunctionData("withdraw(uint256)", [maxShares]);
        }
        else {
            return contractInterface.encodeFunctionData("withdraw()");
        }
    };
    return YearnV2Calls;
}());
exports.YearnV2Calls = YearnV2Calls;
var YearnV2Multicaller = /** @class */ (function () {
    function YearnV2Multicaller(address) {
        this._address = address;
    }
    YearnV2Multicaller.prototype.deposit = function (amount, recipient) {
        return {
            target: this._address,
            callData: YearnV2Calls.deposit(amount, recipient)
        };
    };
    YearnV2Multicaller.prototype.withdraw = function (maxShares, recipient, maxLoss) {
        return {
            target: this._address,
            callData: YearnV2Calls.withdraw(maxShares, recipient, maxLoss)
        };
    };
    return YearnV2Multicaller;
}());
exports.YearnV2Multicaller = YearnV2Multicaller;
