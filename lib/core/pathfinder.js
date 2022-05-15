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
exports.YearnVaultPathAsset = exports.ConnectorPathAsset = exports.Path = void 0;
var ethers_1 = require("ethers");
var token_1 = require("./token");
var constants_1 = require("./constants");
var types_1 = require("../types");
var contracts_1 = require("./contracts");
var tradeTypes_1 = require("./tradeTypes");
// const path = new Path({gasUsed:0, balances: creditAccount.balances, })
// const closurePath = await path.getBestPath();
// closurePath.calls -> multicalls (!)
// closurePath.balances[path.pool] = (X)
// closurePath.balances[!path.pool] = 0 / 1;
var Path = /** @class */ (function () {
    function Path(opts) {
        this.calls = [];
        this.balances = opts.balances;
        this.pool = opts.pool;
        this.creditManager = opts.creditManager;
        this.creditAccount = opts.creditAccount;
        this.networkType = opts.networkType;
        this.provider = opts.provider;
        this.totalGasLimit = opts.totalGasLimit;
    }
    Path.prototype.getBestPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingTokens, nextToken, _a, connectorPathAsset, yearnVaultPathAsset;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        existingTokens = Object.entries(this.balances).filter(function (_a) {
                            var balance = _a[1];
                            return balance.gt(1);
                        }).sort(function (_a, _b) {
                            var tokenA = _a[0];
                            var tokenB = _b[0];
                            if (token_1.priority[token_1.supportedTokens[tokenA].type] > token_1.priority[token_1.supportedTokens[tokenB].type]) {
                                return -1;
                            }
                            else if (token_1.priority[token_1.supportedTokens[tokenA].type] < token_1.priority[token_1.supportedTokens[tokenB].type]) {
                                return 1;
                            }
                            return 0;
                        });
                        if (existingTokens.length == 1) {
                            return [2 /*return*/, Promise.resolve(this)];
                        }
                        nextToken = existingTokens.at(0)[0];
                        _a = token_1.supportedTokens[nextToken].type;
                        switch (_a) {
                            case token_1.TokenType.CONNECTOR: return [3 /*break*/, 1];
                            case token_1.TokenType.YEARN_VAULT: return [3 /*break*/, 3];
                            case token_1.TokenType.CONVEX_LP_TOKEN: return [3 /*break*/, 5];
                            case token_1.TokenType.CURVE_LP: return [3 /*break*/, 5];
                            case token_1.TokenType.META_CURVE_LP: return [3 /*break*/, 5];
                            case token_1.TokenType.NORMAL_TOKEN: return [3 /*break*/, 5];
                            case token_1.TokenType.YEARN_VAULT_OF_CURVE_LP: return [3 /*break*/, 5];
                            case token_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP: return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 5];
                    case 1:
                        connectorPathAsset = new ConnectorPathAsset();
                        return [4 /*yield*/, connectorPathAsset.getBestPath(nextToken, this)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        yearnVaultPathAsset = new YearnVaultPathAsset();
                        return [4 /*yield*/, yearnVaultPathAsset.getBestPath(nextToken, this)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: throw new Error("Token not supported yet");
                }
            });
        });
    };
    return Path;
}());
exports.Path = Path;
var ConnectorPathAsset = /** @class */ (function () {
    function ConnectorPathAsset() {
    }
    ConnectorPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentBalance, currentTokenAddress, currentTokenData, nextToken, nextTokenAddress, deadline, callData, gasLimit, maxAmountOut, _i, _a, swapAction, actionType, actionContract, actionContractAddress, call, amountOut, gasLimitTmp, _b, uniswapV2Rounter, path, amountsOut, uniswapV3Rounter, iQuoter, exactInputSingleOrder, curve3CrvPool, currentIndex, outputIndex;
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
                            targetContract: constants_1.ADDRESS_0x0,
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
                        call = {
                            targetContract: constants_1.ADDRESS_0x0,
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
                        uniswapV2Rounter = types_1.UniswapV2Adapter__factory.connect(actionContractAddress, p.provider);
                        path = [currentTokenAddress, nextTokenAddress];
                        return [4 /*yield*/, uniswapV2Rounter.getAmountsOut(currentBalance, path)];
                    case 3:
                        amountsOut = _c.sent();
                        amountOut = amountsOut[amountsOut.length - 1];
                        call = {
                            targetContract: actionContractAddress,
                            callData: types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [currentBalance, amountOut, path, p.creditAccount.addr, deadline])
                        };
                        return [4 /*yield*/, uniswapV2Rounter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline)];
                    case 4:
                        gasLimitTmp = _c.sent();
                        return [3 /*break*/, 13];
                    case 5:
                        uniswapV3Rounter = types_1.UniswapV3Adapter__factory.connect(actionContractAddress, p.provider);
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
                            "deadline": Math.floor(Date.now() / 1000) + 1200,
                            "sqrtPriceLimitX96": 0
                        };
                        call = {
                            targetContract: actionContractAddress,
                            callData: types_1.UniswapV3Adapter__factory.createInterface().encodeFunctionData("exactInputSingle", [exactInputSingleOrder])
                        };
                        return [4 /*yield*/, uniswapV3Rounter.estimateGas.exactInputSingle(exactInputSingleOrder)];
                    case 7:
                        gasLimitTmp = _c.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        if (!(swapAction.tokenOut.includes(currentToken) && swapAction.tokenOut.includes(p.pool))) return [3 /*break*/, 11];
                        curve3CrvPool = types_1.CurveV1Adapter__factory.connect(actionContractAddress, p.provider);
                        currentIndex = token_1.curve3CrvUnderlyingTokenIndex[currentToken];
                        outputIndex = token_1.curve3CrvUnderlyingTokenIndex[p.pool];
                        return [4 /*yield*/, curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance)];
                    case 9:
                        amountOut = _c.sent();
                        call = {
                            targetContract: actionContractAddress,
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
                        if (callData.targetContract != constants_1.ADDRESS_0x0) {
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
