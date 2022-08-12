"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearnV2Strategies = exports.YearnV2Multicaller = exports.YearnV2Calls = void 0;
var contracts_1 = require("../contracts/contracts");
var constants_1 = require("../core/constants");
var token_1 = require("../tokens/token");
var tokenType_1 = require("../tokens/tokenType");
var types_1 = require("../types");
var curve_1 = require("./curve");
var uniswapV2_1 = require("./uniswapV2");
var YearnV2Calls = /** @class */ (function () {
    function YearnV2Calls() {
    }
    YearnV2Calls.deposit = function (amount, recipient) {
        var contractInterface = types_1.YearnV2Adapter__factory.createInterface();
        if (amount && recipient) {
            return contractInterface.encodeFunctionData("deposit(uint256,address)", [
                amount,
                recipient
            ]);
        }
        if (amount) {
            return contractInterface.encodeFunctionData("deposit(uint256)", [amount]);
        }
        return contractInterface.encodeFunctionData("deposit()");
    };
    YearnV2Calls.withdraw = function (maxShares, recipient, maxLoss) {
        var contractInterface = types_1.YearnV2Adapter__factory.createInterface();
        if (maxShares && recipient && maxLoss) {
            return contractInterface.encodeFunctionData("withdraw(uint256,address,uint256)", [maxShares, recipient, maxLoss]);
        }
        if (maxShares && recipient) {
            return contractInterface.encodeFunctionData("withdraw(uint256,address)", [
                maxShares,
                recipient
            ]);
        }
        if (maxShares) {
            return contractInterface.encodeFunctionData("withdraw(uint256)", [
                maxShares
            ]);
        }
        return contractInterface.encodeFunctionData("withdraw()");
    };
    return YearnV2Calls;
}());
exports.YearnV2Calls = YearnV2Calls;
var YearnV2Multicaller = /** @class */ (function () {
    function YearnV2Multicaller(address) {
        this._address = address;
    }
    YearnV2Multicaller.connect = function (address) {
        return new YearnV2Multicaller(address);
    };
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
var YearnV2Strategies = /** @class */ (function () {
    function YearnV2Strategies() {
    }
    YearnV2Strategies.underlyingToYearn = function (data, network, yearnVault, underlyingAmount) {
        var calls = [];
        var vaultParams = contracts_1.contractParams[yearnVault];
        var yearnToken = vaultParams.shareToken;
        var yearnParams = token_1.supportedTokens[yearnToken];
        if (yearnParams.type === tokenType_1.TokenType.YEARN_VAULT) {
            if (data.underlyingToken.toLowerCase() !==
                token_1.tokenDataByNetwork[network][yearnParams.underlying].toLowerCase()) {
                // This should be a pathfinder call
                calls.push(uniswapV2_1.UniswapV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()]).swapExactTokensForTokens(underlyingAmount, 0, [
                    data.underlyingToken,
                    token_1.tokenDataByNetwork[network][yearnParams.underlying]
                ], constants_1.ADDRESS_0X0, Math.floor(new Date().getTime() / 1000) + 3600));
            }
            else {
                calls.push(YearnV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network][yearnVault].toLowerCase()]).deposit(underlyingAmount));
                return calls;
            }
        }
        else if (yearnParams.type === tokenType_1.TokenType.YEARN_VAULT_OF_CURVE_LP ||
            yearnParams.type === tokenType_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP) {
            var curveTokenParams = token_1.supportedTokens[yearnParams.underlying];
            var curvePool = curveTokenParams.pool;
            calls = curve_1.CurveStrategies.underlyingToCurveLP(data, network, curvePool, underlyingAmount);
        }
        else {
            throw new Error("Yearn vault type unknown");
        }
        calls.push(YearnV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network][yearnVault].toLowerCase()]).deposit());
        return calls;
    };
    YearnV2Strategies.yearnToUnderlying = function (data, network, yearnVault, yearnSharesAmount) {
        var calls = [];
        var vaultParams = contracts_1.contractParams[yearnVault];
        var yearnToken = vaultParams.shareToken;
        var yearnParams = token_1.supportedTokens[yearnToken];
        calls.push(YearnV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network][yearnVault].toLowerCase()]).withdraw(yearnSharesAmount));
        if (yearnParams.type === tokenType_1.TokenType.YEARN_VAULT) {
            if (data.underlyingToken.toLowerCase() !==
                token_1.tokenDataByNetwork[network][yearnParams.underlying].toLowerCase()) {
                // This should be a pathfinder call
                calls.push(uniswapV2_1.UniswapV2Multicaller.connect(data.adapters[contracts_1.contractsByNetwork[network].UNISWAP_V2_ROUTER.toLowerCase()]).swapAllTokensForTokens(0, [
                    token_1.tokenDataByNetwork[network][yearnParams.underlying],
                    data.underlyingToken
                ], Math.floor(new Date().getTime() / 1000) + 3600));
            }
        }
        else if (yearnParams.type === tokenType_1.TokenType.YEARN_VAULT_OF_CURVE_LP ||
            yearnParams.type === tokenType_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP) {
            var curveTokenParams = token_1.supportedTokens[yearnParams.underlying];
            var curvePool = curveTokenParams.pool;
            calls = __spreadArray(__spreadArray([], calls, true), curve_1.CurveStrategies.allCurveLPToUnderlying(data, network, curvePool), true);
        }
        else {
            throw new Error("Yearn vault type unknown");
        }
        return calls;
    };
    return YearnV2Strategies;
}());
exports.YearnV2Strategies = YearnV2Strategies;
