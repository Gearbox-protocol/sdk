"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvexClaimZapMulticaller = exports.ConvexPoolMulticaller = exports.ConvexBoosterMulticaller = exports.ConvexClaimZapCalls = exports.ConvexPoolCalls = exports.ConvexBoosterCalls = void 0;
var types_1 = require("../types");
var ConvexBoosterCalls = /** @class */ (function () {
    function ConvexBoosterCalls() {
    }
    ConvexBoosterCalls.deposit = function (pid, amount, stake) {
        return types_1.ConvexV1BoosterAdapter__factory.createInterface().encodeFunctionData("deposit", [pid, amount, stake]);
    };
    ConvexBoosterCalls.depositAll = function (pid, stake) {
        return types_1.ConvexV1BoosterAdapter__factory.createInterface().encodeFunctionData("depositAll", [pid, stake]);
    };
    ConvexBoosterCalls.withdraw = function (pid, amount) {
        return types_1.ConvexV1BoosterAdapter__factory.createInterface().encodeFunctionData("withdraw", [pid, amount]);
    };
    ConvexBoosterCalls.withdrawAll = function (pid) {
        return types_1.ConvexV1BoosterAdapter__factory.createInterface().encodeFunctionData("withdrawAll", [pid]);
    };
    return ConvexBoosterCalls;
}());
exports.ConvexBoosterCalls = ConvexBoosterCalls;
var ConvexPoolCalls = /** @class */ (function () {
    function ConvexPoolCalls() {
    }
    ConvexPoolCalls.stake = function (amount) {
        return types_1.ConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData("stake", [amount]);
    };
    ConvexPoolCalls.stakeAll = function () {
        return types_1.ConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData("stakeAll");
    };
    ConvexPoolCalls.withdraw = function (amount, claim) {
        return types_1.ConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData("withdraw", [amount, claim]);
    };
    ConvexPoolCalls.withdrawAll = function (claim) {
        return types_1.ConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData("withdrawAll", [claim]);
    };
    ConvexPoolCalls.withdrawAndUnwrap = function (amount, claim) {
        return types_1.ConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData("withdrawAndUnwrap", [amount, claim]);
    };
    ConvexPoolCalls.withdrawAllAndUnwrap = function (claim) {
        return types_1.ConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData("withdrawAllAndUnwrap", [claim]);
    };
    return ConvexPoolCalls;
}());
exports.ConvexPoolCalls = ConvexPoolCalls;
var ConvexClaimZapCalls = /** @class */ (function () {
    function ConvexClaimZapCalls() {
    }
    ConvexClaimZapCalls.claimRewards = function (rewardContracts, extraRewardContracts, tokenRewardContracts, tokenRewardTokens, depositCrvMaxAmount, minAmountOut, depositCvxMaxAmount, spendCvxAmount, options) {
        return types_1.ConvexV1ClaimZapAdapter__factory.createInterface().encodeFunctionData("claimRewards", [
            rewardContracts,
            extraRewardContracts,
            tokenRewardContracts,
            tokenRewardTokens,
            depositCrvMaxAmount,
            minAmountOut,
            depositCvxMaxAmount,
            spendCvxAmount,
            options
        ]);
    };
    return ConvexClaimZapCalls;
}());
exports.ConvexClaimZapCalls = ConvexClaimZapCalls;
var ConvexBoosterMulticaller = /** @class */ (function () {
    function ConvexBoosterMulticaller(address) {
        this._address = address;
    }
    ConvexBoosterMulticaller.prototype.deposit = function (pid, amount, stake) {
        return {
            target: this._address,
            callData: ConvexBoosterCalls.deposit(pid, amount, stake)
        };
    };
    ConvexBoosterMulticaller.prototype.depositAll = function (pid, stake) {
        return {
            target: this._address,
            callData: ConvexBoosterCalls.depositAll(pid, stake)
        };
    };
    ConvexBoosterMulticaller.prototype.withdraw = function (pid, amount) {
        return {
            target: this._address,
            callData: ConvexBoosterCalls.withdraw(pid, amount)
        };
    };
    ConvexBoosterMulticaller.prototype.withdrawAll = function (pid) {
        return {
            target: this._address,
            callData: ConvexBoosterCalls.withdrawAll(pid)
        };
    };
    return ConvexBoosterMulticaller;
}());
exports.ConvexBoosterMulticaller = ConvexBoosterMulticaller;
var ConvexPoolMulticaller = /** @class */ (function () {
    function ConvexPoolMulticaller(address) {
        this._address = address;
    }
    ConvexPoolMulticaller.prototype.stake = function (amount) {
        return {
            target: this._address,
            callData: ConvexPoolCalls.stake(amount)
        };
    };
    ConvexPoolMulticaller.prototype.stakeAll = function () {
        return {
            target: this._address,
            callData: ConvexPoolCalls.stakeAll()
        };
    };
    ConvexPoolMulticaller.prototype.withdraw = function (amount, claim) {
        return {
            target: this._address,
            callData: ConvexPoolCalls.withdraw(amount, claim)
        };
    };
    ConvexPoolMulticaller.prototype.withdrawAll = function (claim) {
        return {
            target: this._address,
            callData: ConvexPoolCalls.withdrawAll(claim)
        };
    };
    ConvexPoolMulticaller.prototype.withdrawAndUnwrap = function (amount, claim) {
        return {
            target: this._address,
            callData: ConvexPoolCalls.withdrawAndUnwrap(amount, claim)
        };
    };
    ConvexPoolMulticaller.prototype.withdrawAllAndUnwrap = function (claim) {
        return {
            target: this._address,
            callData: ConvexPoolCalls.withdrawAllAndUnwrap(claim)
        };
    };
    return ConvexPoolMulticaller;
}());
exports.ConvexPoolMulticaller = ConvexPoolMulticaller;
var ConvexClaimZapMulticaller = /** @class */ (function () {
    function ConvexClaimZapMulticaller(address) {
        this._address = address;
    }
    ConvexClaimZapMulticaller.prototype.claimRewards = function (rewardContracts, extraRewardContracts, tokenRewardContracts, tokenRewardTokens, depositCrvMaxAmount, minAmountOut, depositCvxMaxAmount, spendCvxAmount, options) {
        return {
            target: this._address,
            callData: ConvexClaimZapCalls.claimRewards(rewardContracts, extraRewardContracts, tokenRewardContracts, tokenRewardTokens, depositCrvMaxAmount, minAmountOut, depositCvxMaxAmount, spendCvxAmount, options)
        };
    };
    return ConvexClaimZapMulticaller;
}());
exports.ConvexClaimZapMulticaller = ConvexClaimZapMulticaller;
