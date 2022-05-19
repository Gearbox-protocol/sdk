"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YearnVaultOfMetaCurveLPPathAsset = exports.YearnVaultOfCurveLPPathAsset = exports.NormalTokenPathAsset = exports.MetaCurveLPPathAsset = exports.CurveLPPathAsset = exports.ConvexLPTokenPathAsset = exports.YearnVaultPathAsset = exports.ConnectorPathAsset = void 0;
var ethers_1 = require("ethers");
var token_1 = require("../core/token");
var types_1 = require("../types");
var contracts_1 = require("../core/contracts");
var tradeTypes_1 = require("../core/tradeTypes");
var ConnectorPathAsset = /** @class */ (function () {
    function ConnectorPathAsset() {
    }
    ConnectorPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentBalance, currentTokenAddress, currentTokenData, nextToken, nextTokenAddress, deadline, callData, gasLimit, maxAmountOut, _i, _a, swapAction, actionType, actionContract, actionContractAddress, adapterAddress, call, amountOut, gasLimitTmp, _b, uniswapV2Adapter, path, amountsOut, uniswapV3Adapter, iQuoter, exactInputSingleOrder, curve3CrvPool, currentIndex, outputIndex;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentBalance = p.balances[currentToken].sub(1);
                        currentTokenAddress = token_1.tokenDataByNetwork[p.networkType][currentToken];
                        currentTokenData = token_1.supportedTokens[currentToken];
                        nextToken = p.pool;
                        nextTokenAddress = token_1.tokenDataByNetwork[p.networkType][nextToken];
                        deadline = Math.floor(Date.now() / 1000) + 1200;
                        callData = {
                            targetContract: "",
                            callData: ""
                        };
                        gasLimit = ethers_1.BigNumber.from(0);
                        maxAmountOut = ethers_1.BigNumber.from(0);
                        _i = 0, _a = currentTokenData.swapActions;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 15];
                        swapAction = _a[_i];
                        actionType = swapAction.type;
                        actionContract = swapAction.contract;
                        actionContractAddress = contracts_1.contractsByNetwork[p.networkType][actionContract];
                        adapterAddress = p.creditManager.adapters[actionContractAddress];
                        call = {
                            targetContract: "",
                            callData: ""
                        };
                        amountOut = ethers_1.BigNumber.from(0);
                        gasLimitTmp = ethers_1.BigNumber.from(0);
                        _b = actionType;
                        switch (_b) {
                            case tradeTypes_1.TradeType.UniswapV2Swap: return [3 /*break*/, 2];
                            case tradeTypes_1.TradeType.UniswapV3Swap: return [3 /*break*/, 5];
                            case tradeTypes_1.TradeType.CurveExchange: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 12];
                    case 2:
                        uniswapV2Adapter = types_1.UniswapV2Adapter__factory.connect(adapterAddress, p.provider);
                        path = [currentTokenAddress, nextTokenAddress];
                        return [4 /*yield*/, uniswapV2Adapter.getAmountsOut(currentBalance, path)];
                    case 3:
                        amountsOut = _c.sent();
                        amountOut = amountsOut[amountsOut.length - 1];
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [currentBalance, amountOut, path, p.creditAccount.addr, deadline])
                        };
                        return [4 /*yield*/, uniswapV2Adapter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline)];
                    case 4:
                        gasLimitTmp = _c.sent();
                        return [3 /*break*/, 13];
                    case 5:
                        uniswapV3Adapter = types_1.UniswapV3Adapter__factory.connect(adapterAddress, p.provider);
                        iQuoter = types_1.IQuoter__factory.connect(contracts_1.UNISWAP_V3_QUOTER, p.provider);
                        return [4 /*yield*/, iQuoter.callStatic.quoteExactInputSingle(currentTokenAddress, nextTokenAddress, 3000, currentBalance, 0)];
                    case 6:
                        amountOut = _c.sent();
                        exactInputSingleOrder = {
                            "tokenIn": currentTokenAddress,
                            "tokenOut": nextTokenAddress,
                            "fee": 3000,
                            "recipient": p.creditAccount.addr,
                            "amountIn": currentBalance,
                            "amountOutMinimum": amountOut,
                            "deadline": deadline,
                            "sqrtPriceLimitX96": 0
                        };
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInputSingle", [exactInputSingleOrder])
                        };
                        return [4 /*yield*/, uniswapV3Adapter.estimateGas.exactInputSingle(exactInputSingleOrder)];
                    case 7:
                        gasLimitTmp = _c.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        if (!swapAction.tokenOut.includes(p.pool)) return [3 /*break*/, 11];
                        curve3CrvPool = types_1.CurveV1Adapter__factory.connect(adapterAddress, p.provider);
                        currentIndex = token_1.Curve3CrvUnderlyingTokenIndex[currentToken];
                        outputIndex = token_1.Curve3CrvUnderlyingTokenIndex[p.pool];
                        return [4 /*yield*/, curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance)];
                    case 9:
                        amountOut = _c.sent();
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.CurveV1Adapter__factory.createInterface().encodeFunctionData("exchange_underlying", [currentIndex, outputIndex, currentBalance, amountOut])
                        };
                        return [4 /*yield*/, curve3CrvPool.estimateGas.exchange_underlying(currentIndex, outputIndex, currentBalance, amountOut)];
                    case 10:
                        gasLimitTmp = _c.sent();
                        _c.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12: throw Error("TradeType not supported. ".concat(actionType));
                    case 13:
                        if (amountOut > maxAmountOut) {
                            callData = call;
                            maxAmountOut = amountOut;
                            gasLimit = gasLimitTmp;
                        }
                        _c.label = 14;
                    case 14:
                        _i++;
                        return [3 /*break*/, 1];
                    case 15:
                        if (callData.targetContract != "") {
                            p.balances[nextToken].add(maxAmountOut);
                            p.balances[currentToken] = ethers_1.BigNumber.from(1);
                            p.totalGasLimit.add(gasLimit);
                            p.calls.push(callData);
                        }
                        return [4 /*yield*/, p.getBestPath()];
                    case 16: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    // Only compute the maximum amount of pool token output, will not modify p.
    ConnectorPathAsset.prototype.getMaxPoolAmount = function (currentToken, currentBalance, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentTokenAddress, currentTokenData, nextToken, nextTokenAddress, deadline, gasLimit, maxAmountOut, _i, _a, swapAction, actionType, actionContract, actionContractAddress, adapterAddress, amountOut, gasLimitTmp, _b, uniswapV2Adapter, path, amountsOut, uniswapV3Adapter, iQuoter, exactInputSingleOrder, curve3CrvPool, currentIndex, outputIndex;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentTokenAddress = token_1.tokenDataByNetwork[p.networkType][currentToken];
                        currentTokenData = token_1.supportedTokens[currentToken];
                        nextToken = p.pool;
                        nextTokenAddress = token_1.tokenDataByNetwork[p.networkType][nextToken];
                        deadline = Math.floor(Date.now() / 1000) + 1200;
                        gasLimit = ethers_1.BigNumber.from(0);
                        maxAmountOut = ethers_1.BigNumber.from(0);
                        _i = 0, _a = currentTokenData.swapActions;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 15];
                        swapAction = _a[_i];
                        actionType = swapAction.type;
                        actionContract = swapAction.contract;
                        actionContractAddress = contracts_1.contractsByNetwork[p.networkType][actionContract];
                        adapterAddress = p.creditManager.adapters[actionContractAddress];
                        amountOut = ethers_1.BigNumber.from(0);
                        gasLimitTmp = ethers_1.BigNumber.from(0);
                        _b = actionType;
                        switch (_b) {
                            case tradeTypes_1.TradeType.UniswapV2Swap: return [3 /*break*/, 2];
                            case tradeTypes_1.TradeType.UniswapV3Swap: return [3 /*break*/, 5];
                            case tradeTypes_1.TradeType.CurveExchange: return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 12];
                    case 2:
                        uniswapV2Adapter = types_1.UniswapV2Adapter__factory.connect(adapterAddress, p.provider);
                        path = [currentTokenAddress, nextTokenAddress];
                        return [4 /*yield*/, uniswapV2Adapter.getAmountsOut(currentBalance, path)];
                    case 3:
                        amountsOut = _c.sent();
                        amountOut = amountsOut[amountsOut.length - 1];
                        return [4 /*yield*/, uniswapV2Adapter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline)];
                    case 4:
                        gasLimitTmp = _c.sent();
                        return [3 /*break*/, 13];
                    case 5:
                        uniswapV3Adapter = types_1.UniswapV3Adapter__factory.connect(adapterAddress, p.provider);
                        iQuoter = types_1.IQuoter__factory.connect(contracts_1.UNISWAP_V3_QUOTER, p.provider);
                        return [4 /*yield*/, iQuoter.callStatic.quoteExactInputSingle(currentTokenAddress, nextTokenAddress, 3000, currentBalance, 0)];
                    case 6:
                        amountOut = _c.sent();
                        exactInputSingleOrder = {
                            "tokenIn": currentTokenAddress,
                            "tokenOut": nextTokenAddress,
                            "fee": 3000,
                            "recipient": p.creditAccount.addr,
                            "amountIn": currentBalance,
                            "amountOutMinimum": amountOut,
                            "deadline": deadline,
                            "sqrtPriceLimitX96": 0
                        };
                        return [4 /*yield*/, uniswapV3Adapter.estimateGas.exactInputSingle(exactInputSingleOrder)];
                    case 7:
                        gasLimitTmp = _c.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        if (!swapAction.tokenOut.includes(nextToken)) return [3 /*break*/, 11];
                        curve3CrvPool = types_1.CurveV1Adapter__factory.connect(adapterAddress, p.provider);
                        currentIndex = token_1.Curve3CrvUnderlyingTokenIndex[currentToken];
                        outputIndex = token_1.Curve3CrvUnderlyingTokenIndex[nextToken];
                        return [4 /*yield*/, curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance)];
                    case 9:
                        amountOut = _c.sent();
                        return [4 /*yield*/, curve3CrvPool.estimateGas.exchange_underlying(currentIndex, outputIndex, currentBalance, amountOut)];
                    case 10:
                        gasLimitTmp = _c.sent();
                        _c.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12: throw Error("TradeType not supported. ".concat(actionType));
                    case 13:
                        if (amountOut > maxAmountOut) {
                            maxAmountOut = amountOut;
                            gasLimit = gasLimitTmp;
                        }
                        _c.label = 14;
                    case 14:
                        _i++;
                        return [3 /*break*/, 1];
                    case 15: return [2 /*return*/, [maxAmountOut, gasLimit]];
                }
            });
        });
    };
    return ConnectorPathAsset;
}());
exports.ConnectorPathAsset = ConnectorPathAsset;
var YearnVaultPathAsset = /** @class */ (function () {
    function YearnVaultPathAsset() {
    }
    YearnVaultPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentBalance, currentTokenData, allowedContract, outputToken, adapterAddress, call, IYVault, price, gasLimit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentBalance = p.balances[currentToken].sub(1);
                        currentTokenData = token_1.supportedTokens[currentToken];
                        allowedContract = contracts_1.contractsByNetwork[p.networkType][currentTokenData.lpActions[0].contract];
                        outputToken = currentTokenData.lpActions[0].tokenOut;
                        adapterAddress = p.creditManager.adapters[allowedContract];
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.YearnAdapter__factory.createInterface().encodeFunctionData('withdraw', [currentBalance, p.creditAccount.addr])
                        };
                        IYVault = types_1.YearnAdapter__factory.connect(allowedContract, p.provider);
                        return [4 /*yield*/, IYVault.pricePerShare()];
                    case 1:
                        price = _a.sent();
                        return [4 /*yield*/, IYVault.estimateGas["withdraw(uint256,address)"](currentBalance, p.creditAccount.addr)];
                    case 2:
                        gasLimit = _a.sent();
                        p.balances[outputToken].add(price.mul(currentBalance));
                        p.balances[currentToken] = ethers_1.BigNumber.from(1);
                        p.totalGasLimit.add(gasLimit);
                        p.calls.push(call);
                        return [4 /*yield*/, p.getBestPath()];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return YearnVaultPathAsset;
}());
exports.YearnVaultPathAsset = YearnVaultPathAsset;
var ConvexLPTokenPathAsset = /** @class */ (function () {
    function ConvexLPTokenPathAsset() {
    }
    ConvexLPTokenPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentBalance, currentTokenData, _i, _a, lpAction, actionContractAddress, adapterAddress, outputToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: throw Error("Implementation not finished!");
                    case 1: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    return ConvexLPTokenPathAsset;
}());
exports.ConvexLPTokenPathAsset = ConvexLPTokenPathAsset;
var CurveLPPathAsset = /** @class */ (function () {
    function CurveLPPathAsset() {
    }
    CurveLPPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(currentToken);
                console.log(p);
                throw Error("Not implemented yet.");
            });
        });
    };
    return CurveLPPathAsset;
}());
exports.CurveLPPathAsset = CurveLPPathAsset;
var MetaCurveLPPathAsset = /** @class */ (function () {
    function MetaCurveLPPathAsset() {
    }
    MetaCurveLPPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(currentToken);
                console.log(p);
                throw Error("Not implemented yet.");
            });
        });
    };
    return MetaCurveLPPathAsset;
}());
exports.MetaCurveLPPathAsset = MetaCurveLPPathAsset;
var NormalTokenPathAsset = /** @class */ (function () {
    function NormalTokenPathAsset() {
    }
    NormalTokenPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentBalance, currentTokenAddress, currentTokenData, deadline, callData, nextToken, gasLimit, maxAmountOut, _i, ConnectorTokens_1, connToken, connTokenAddress, _a, _b, swapAction, actionType, actionContract, actionContractAddress, adapterAddress, call, amountOut, gasLimitTmp, _c, uniswapV2Adapter, path, amountsOut, uniswapV3Adapter, iQuoter, exactInputSingleOrder, curve3CrvPool, currentIndex, outputIndex, connectorPathAsset, _d, maxPoolAmount, gasLimitConn;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        currentBalance = p.balances[currentToken].sub(1);
                        currentTokenAddress = token_1.tokenDataByNetwork[p.networkType][currentToken];
                        currentTokenData = token_1.supportedTokens[currentToken];
                        deadline = Math.floor(Date.now() / 1000) + 1200;
                        callData = {
                            targetContract: "",
                            callData: ""
                        };
                        nextToken = p.pool;
                        gasLimit = ethers_1.BigNumber.from(0);
                        maxAmountOut = ethers_1.BigNumber.from(0);
                        _i = 0, ConnectorTokens_1 = token_1.ConnectorTokens;
                        _e.label = 1;
                    case 1:
                        if (!(_i < ConnectorTokens_1.length)) return [3 /*break*/, 19];
                        connToken = ConnectorTokens_1[_i];
                        connTokenAddress = token_1.tokenDataByNetwork[p.networkType][connToken];
                        _a = 0, _b = currentTokenData.swapActions;
                        _e.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 18];
                        swapAction = _b[_a];
                        actionType = swapAction.type;
                        actionContract = swapAction.contract;
                        actionContractAddress = contracts_1.contractsByNetwork[p.networkType][actionContract];
                        adapterAddress = p.creditManager.adapters[actionContractAddress];
                        call = {
                            targetContract: "",
                            callData: ""
                        };
                        amountOut = ethers_1.BigNumber.from(0);
                        gasLimitTmp = ethers_1.BigNumber.from(0);
                        _c = actionType;
                        switch (_c) {
                            case tradeTypes_1.TradeType.UniswapV2Swap: return [3 /*break*/, 3];
                            case tradeTypes_1.TradeType.UniswapV3Swap: return [3 /*break*/, 6];
                            case tradeTypes_1.TradeType.CurveExchange: return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 13];
                    case 3:
                        uniswapV2Adapter = types_1.UniswapV2Adapter__factory.connect(adapterAddress, p.provider);
                        path = [currentTokenAddress, connTokenAddress];
                        return [4 /*yield*/, uniswapV2Adapter.getAmountsOut(currentBalance, path)];
                    case 4:
                        amountsOut = _e.sent();
                        amountOut = amountsOut[amountsOut.length - 1];
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [currentBalance, amountOut, path, p.creditAccount.addr, deadline])
                        };
                        return [4 /*yield*/, uniswapV2Adapter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline)];
                    case 5:
                        gasLimitTmp = _e.sent();
                        return [3 /*break*/, 14];
                    case 6:
                        uniswapV3Adapter = types_1.UniswapV3Adapter__factory.connect(adapterAddress, p.provider);
                        iQuoter = types_1.IQuoter__factory.connect(contracts_1.UNISWAP_V3_QUOTER, p.provider);
                        return [4 /*yield*/, iQuoter.callStatic.quoteExactInputSingle(currentTokenAddress, connTokenAddress, 3000, currentBalance, 0)];
                    case 7:
                        amountOut = _e.sent();
                        exactInputSingleOrder = {
                            "tokenIn": currentTokenAddress,
                            "tokenOut": connTokenAddress,
                            "fee": 3000,
                            "recipient": p.creditAccount.addr,
                            "amountIn": currentBalance,
                            "amountOutMinimum": amountOut,
                            "deadline": deadline,
                            "sqrtPriceLimitX96": 0
                        };
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInputSingle", [exactInputSingleOrder])
                        };
                        return [4 /*yield*/, uniswapV3Adapter.estimateGas.exactInputSingle(exactInputSingleOrder)];
                    case 8:
                        gasLimitTmp = _e.sent();
                        return [3 /*break*/, 14];
                    case 9:
                        if (!swapAction.tokenOut.includes(connToken)) return [3 /*break*/, 12];
                        curve3CrvPool = types_1.CurveV1Adapter__factory.connect(adapterAddress, p.provider);
                        currentIndex = token_1.Curve3CrvUnderlyingTokenIndex[currentToken];
                        outputIndex = token_1.Curve3CrvUnderlyingTokenIndex[connToken];
                        return [4 /*yield*/, curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance)];
                    case 10:
                        amountOut = _e.sent();
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.CurveV1Adapter__factory.createInterface().encodeFunctionData("exchange_underlying", [currentIndex, outputIndex, currentBalance, amountOut])
                        };
                        return [4 /*yield*/, curve3CrvPool.estimateGas.exchange_underlying(currentIndex, outputIndex, currentBalance, amountOut)];
                    case 11:
                        gasLimitTmp = _e.sent();
                        _e.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13: throw Error("TradeType not supported. ".concat(actionType));
                    case 14:
                        if (!(connToken != p.pool)) return [3 /*break*/, 16];
                        connectorPathAsset = new ConnectorPathAsset();
                        return [4 /*yield*/, connectorPathAsset.getMaxPoolAmount(connToken, amountOut, p)];
                    case 15:
                        _d = _e.sent(), maxPoolAmount = _d[0], gasLimitConn = _d[1];
                        amountOut = maxPoolAmount;
                        gasLimitTmp.add(gasLimitConn);
                        _e.label = 16;
                    case 16:
                        if (amountOut > maxAmountOut) {
                            callData = call;
                            maxAmountOut = amountOut;
                            gasLimit = gasLimitTmp;
                        }
                        _e.label = 17;
                    case 17:
                        _a++;
                        return [3 /*break*/, 2];
                    case 18:
                        _i++;
                        return [3 /*break*/, 1];
                    case 19:
                        if (callData.targetContract != "") {
                            p.balances[nextToken].add(maxAmountOut);
                            p.balances[currentToken] = ethers_1.BigNumber.from(1);
                            p.totalGasLimit.add(gasLimit);
                            p.calls.push(callData);
                        }
                        return [4 /*yield*/, p.getBestPath()];
                    case 20: return [2 /*return*/, _e.sent()];
                }
            });
        });
    };
    return NormalTokenPathAsset;
}());
exports.NormalTokenPathAsset = NormalTokenPathAsset;
var YearnVaultOfCurveLPPathAsset = /** @class */ (function () {
    function YearnVaultOfCurveLPPathAsset() {
    }
    YearnVaultOfCurveLPPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(currentToken);
                console.log(p);
                throw Error("Not implemented yet.");
            });
        });
    };
    return YearnVaultOfCurveLPPathAsset;
}());
exports.YearnVaultOfCurveLPPathAsset = YearnVaultOfCurveLPPathAsset;
var YearnVaultOfMetaCurveLPPathAsset = /** @class */ (function () {
    function YearnVaultOfMetaCurveLPPathAsset() {
    }
    YearnVaultOfMetaCurveLPPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log(currentToken);
                console.log(p);
                throw Error("Not implemented yet.");
            });
        });
    };
    return YearnVaultOfMetaCurveLPPathAsset;
}());
exports.YearnVaultOfMetaCurveLPPathAsset = YearnVaultOfMetaCurveLPPathAsset;
