"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurveStrategies = exports.CurveMulticaller = exports.CurveCalls = void 0;
var contracts_1 = require("../contracts/contracts");
var constants_1 = require("../core/constants");
var token_1 = require("../tokens/token");
var types_1 = require("../types");
var uniswapV2_1 = require("./uniswapV2");
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
    CurveCalls.add_liquidity_one_coin = function (amount, i, minAmount) {
        return types_1.CurveV1AdapterBase__factory.createInterface().encodeFunctionData("add_liquidity_one_coin", [amount, i, minAmount]);
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
            default:
                throw new Error("Wrong calls number: add_liquidity");
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
            default:
                throw new Error("Wrong calls number: remove_liquidity");
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
            default:
                throw new Error("Wrong calls number: remove_liquidity_imbalance");
        }
    };
    return CurveCalls;
}());
exports.CurveCalls = CurveCalls;
var CurveMulticaller = /** @class */ (function () {
    function CurveMulticaller(address) {
        this._address = address;
    }
    CurveMulticaller.connect = function (address) {
        return new CurveMulticaller(address);
    };
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
    CurveMulticaller.prototype.add_liquidity_one_coin = function (amount, i, minAmount) {
        return {
            target: this._address,
            callData: CurveCalls.add_liquidity_one_coin(amount, i, minAmount)
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
var CurveStrategies = /** @class */ (function () {
    function CurveStrategies() {
    }
    CurveStrategies.underlyingToCurveLP = function (data, network, curvePool, underlyingAmount) {
        var calls = [];
        var curveParams = contracts_1.contractParams[curvePool];
        var tokenToDeposit = curveParams.tokens[0];
        if (data.underlyingToken.toLowerCase() !==
            token_1.tokenDataByNetwork[network][tokenToDeposit].toLowerCase()) {
            calls.push(uniswapV2_1.UniswapV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()]).swapExactTokensForTokens(underlyingAmount, 0, [data.underlyingToken, token_1.tokenDataByNetwork[network][tokenToDeposit]], constants_1.ADDRESS_0X0, Math.floor(new Date().getTime() / 1000) + 3600), CurveMulticaller.connect(data.adapters[contracts_1.contractsByNetwork[network][curvePool].toLowerCase()]).add_all_liquidity_one_coin(0, 0));
        }
        else {
            calls.push(CurveMulticaller.connect(data.adapters[contracts_1.contractsByNetwork[network][curvePool].toLowerCase()]).add_liquidity_one_coin(underlyingAmount, 0, 0));
        }
        return calls;
    };
    CurveStrategies.curveLPToUnderlying = function (data, network, curvePool, curveLPAmount) {
        var calls = [];
        var curveParams = contracts_1.contractParams[curvePool];
        var curveContractAddress;
        if (curveParams.wrapper) {
            curveContractAddress =
                data.adapters[contracts_1.contractsByNetwork[network][curveParams.wrapper].toLowerCase()];
        }
        else {
            curveContractAddress =
                data.adapters[contracts_1.contractsByNetwork[network][curvePool].toLowerCase()];
        }
        calls.push(CurveMulticaller.connect(curveContractAddress).remove_liquidity_one_coin(curveLPAmount, 0, 0));
        if (token_1.tokenDataByNetwork[network][curveParams.tokens[0]].toLowerCase() !==
            data.underlyingToken.toLowerCase()) {
            calls.push(uniswapV2_1.UniswapV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()]).swapAllTokensForTokens(0, [
                token_1.tokenDataByNetwork[network][curveParams.tokens[0]],
                data.underlyingToken
            ], Math.floor(new Date().getTime() / 1000) + 3600));
        }
        return calls;
    };
    CurveStrategies.allCurveLPToUnderlying = function (data, network, curvePool) {
        var calls = [];
        var curveParams = contracts_1.contractParams[curvePool];
        var curveContractAddress;
        if (curveParams.wrapper) {
            curveContractAddress =
                data.adapters[contracts_1.contractsByNetwork[network][curveParams.wrapper].toLowerCase()];
        }
        else {
            curveContractAddress =
                data.adapters[contracts_1.contractsByNetwork[network][curvePool].toLowerCase()];
        }
        calls.push(CurveMulticaller.connect(curveContractAddress).remove_all_liquidity_one_coin(0, 0));
        if (token_1.tokenDataByNetwork[network][curveParams.tokens[0]].toLowerCase() !==
            data.underlyingToken.toLowerCase()) {
            calls.push(uniswapV2_1.UniswapV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()]).swapAllTokensForTokens(0, [
                token_1.tokenDataByNetwork[network][curveParams.tokens[0]],
                data.underlyingToken
            ], Math.floor(new Date().getTime() / 1000) + 3600));
        }
        return calls;
    };
    return CurveStrategies;
}());
exports.CurveStrategies = CurveStrategies;
