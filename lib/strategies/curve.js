"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurveMulticaller = exports.CurveCalls = void 0;
var types_1 = require("../types");
var CurveCalls = /** @class */ (function () {
    function CurveCalls() {
    }
    CurveCalls.exchange = function (i, j, dx, min_dy) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("exchange", [i, j, dx, min_dy]);
    };
    CurveCalls.exchange_all = function (i, j, rateMinRAY) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("exchange_all", [i, j, rateMinRAY]);
    };
    CurveCalls.exchange_underlying = function (i, j, dx, min_dy) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("exchange_underlying", [i, j, dx, min_dy]);
    };
    CurveCalls.exchange_all_underlying = function (i, j, rateMinRAY) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("exchange_all_underlying", [i, j, rateMinRAY]);
    };
    CurveCalls.add_all_liquidity_one_coin = function (i, rateMinRAY) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("add_all_liquidity_one_coin", [i, rateMinRAY]);
    };
    CurveCalls.remove_liquidity_one_coin = function (token_amount, i, min_amount) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("remove_liquidity_one_coin", [token_amount, i, min_amount]);
    };
    CurveCalls.remove_all_liquidity_one_coin = function (i, minRateRAY) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("remove_all_liquidity_one_coin", [i, minRateRAY]);
    };
    CurveCalls.add_liquidity = function (amounts, min_mint_amount) {
        switch (amounts.length) {
            case 2:
                return types_1.CurveV1Adapter2Assets__factory.createInterface().encodeFunctionData("add_liquidity", [amounts, min_mint_amount]);
            case 3:
                return types_1.CurveV1Adapter3Assets__factory.createInterface().encodeFunctionData("add_liquidity", [amounts, min_mint_amount]);
            case 4:
                return types_1.CurveV1Adapter4Assets__factory.createInterface().encodeFunctionData("add_liquidity", [amounts, min_mint_amount]);
        }
    };
    CurveCalls.remove_liquidity = function (amount, min_amounts) {
        switch (min_amounts.length) {
            case 2:
                return types_1.CurveV1Adapter2Assets__factory.createInterface().encodeFunctionData("remove_liquidity", [amount, min_amounts]);
            case 3:
                return types_1.CurveV1Adapter3Assets__factory.createInterface().encodeFunctionData("remove_liquidity", [amount, min_amounts]);
            case 4:
                return types_1.CurveV1Adapter4Assets__factory.createInterface().encodeFunctionData("remove_liquidity", [amount, min_amounts]);
        }
    };
    CurveCalls.remove_liquidity_imbalance = function (amounts, max_burn_amount) {
        switch (amounts.length) {
            case 2:
                return types_1.CurveV1Adapter2Assets__factory.createInterface().encodeFunctionData("remove_liquidity_imbalance", [amounts, max_burn_amount]);
            case 3:
                return types_1.CurveV1Adapter3Assets__factory.createInterface().encodeFunctionData("remove_liquidity_imbalance", [amounts, max_burn_amount]);
            case 4:
                return types_1.CurveV1Adapter4Assets__factory.createInterface().encodeFunctionData("remove_liquidity_imbalance", [amounts, max_burn_amount]);
        }
    };
    return CurveCalls;
}());
exports.CurveCalls = CurveCalls;
var CurveMulticaller = /** @class */ (function () {
    function CurveMulticaller(address) {
        this._address = address;
    }
    CurveMulticaller.prototype.exchange = function (i, j, dx, min_dy) {
        return {
            target: this._address,
            callData: CurveCalls.exchange(i, j, dx, min_dy)
        };
    };
    CurveMulticaller.prototype.exchange_all = function (i, j, rateMinRAY) {
        return {
            target: this._address,
            callData: CurveCalls.exchange_all(i, j, rateMinRAY)
        };
    };
    CurveMulticaller.prototype.exchange_underlying = function (i, j, dx, min_dy) {
        return {
            target: this._address,
            callData: CurveCalls.exchange_underlying(i, j, dx, min_dy)
        };
    };
    CurveMulticaller.prototype.exchange_all_underlying = function (i, j, rateMinRAY) {
        return {
            target: this._address,
            callData: CurveCalls.exchange_all_underlying(i, j, rateMinRAY)
        };
    };
    CurveMulticaller.prototype.add_all_liquidity_one_coin = function (i, rateMinRAY) {
        return {
            target: this._address,
            callData: CurveCalls.add_all_liquidity_one_coin(i, rateMinRAY)
        };
    };
    CurveMulticaller.prototype.remove_liquidity_one_coin = function (token_amount, i, min_amount) {
        return {
            target: this._address,
            callData: CurveCalls.remove_liquidity_one_coin(token_amount, i, min_amount)
        };
    };
    CurveMulticaller.prototype.remove_all_liquidity_one_coin = function (i, minRateRAY) {
        return {
            target: this._address,
            callData: CurveCalls.remove_all_liquidity_one_coin(i, minRateRAY)
        };
    };
    CurveMulticaller.prototype.add_liquidity = function (amounts, min_mint_amount) {
        return {
            target: this._address,
            callData: CurveCalls.add_liquidity(amounts, min_mint_amount)
        };
    };
    CurveMulticaller.prototype.remove_liquidity = function (amount, min_amounts) {
        return {
            target: this._address,
            callData: CurveCalls.remove_liquidity(amount, min_amounts)
        };
    };
    CurveMulticaller.prototype.remove_liquidity_imbalance = function (amounts, max_burn_amount) {
        return {
            target: this._address,
            callData: CurveCalls.remove_liquidity_imbalance(amounts, max_burn_amount)
        };
    };
    return CurveMulticaller;
}());
exports.CurveMulticaller = CurveMulticaller;
