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
exports.PathAsset = exports.Path = void 0;
var ethers_1 = require("ethers");
var token_1 = require("../core/token");
var connectorPathAsset_1 = require("./connectorPathAsset");
var yearnVaultPathAsset_1 = require("./yearnVaultPathAsset");
var convexLPTokenPathAsset_1 = require("./convexLPTokenPathAsset");
var curveLPPathAsset_1 = require("./curveLPPathAsset");
var metaCurveLPPathAsset_1 = require("./metaCurveLPPathAsset");
var normalTokenPathAsset_1 = require("./normalTokenPathAsset");
var yearnVaultOfCurveLPPathAsset_1 = require("./yearnVaultOfCurveLPPathAsset");
var yearnVaultOfMetaCurveLPPathAsset_1 = require("./yearnVaultOfMetaCurveLPPathAsset");
var types_1 = require("../types");
var contracts_1 = require("../core/contracts");
var tradeTypes_1 = require("../core/tradeTypes");
var Path = /** @class */ (function () {
    // Path is for selling all assets in the credit account, it will return the calls data to sell all the assets, the amount of pool token will got after selling and the total gas limit for all the calls.
    // This is an example to describe how to use Path:
    // const path = new Path({gasUsed:0, balances: creditAccount.balances, })
    // const closurePath = await path.getBestPath();
    // closurePath.calls -> multicalls (!)
    // closurePath.balances[path.pool] = (X)
    // closurePath.balances[!path.pool] = 0 / 1;
    //
    // balances: the balance of each asset in the credit account
    // pool: the pool token
    // creditManager: credit manager data
    // creditAccount: credit account data
    // networkType: network type (Mainnet, Kovan)
    // provider: ehters rpc provider
    // totalGasLimit: the base gas limit, you can pass zero for not adding any base gas limit
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
    Path.prototype.comparedByPriority = function (_a, _b) {
        var tokenA = _a[0], _balanceA = _a[1];
        var tokenB = _b[0], _balanceB = _b[1];
        var priorityTokenA = token_1.priority[token_1.supportedTokens[tokenA].type];
        var priorityTokenB = token_1.priority[token_1.supportedTokens[tokenB].type];
        if (priorityTokenA > priorityTokenB) {
            return -1;
        }
        else if (priorityTokenA < priorityTokenB) {
            return 1;
        }
        return 0;
    };
    Path.prototype.getBestPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingTokens, nextToken, pathAsset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        existingTokens = Object.entries(this.balances).filter(function (_a) {
                            var _token = _a[0], balance = _a[1];
                            return balance.gt(1);
                        }).sort(this.comparedByPriority);
                        if (existingTokens.length == 1) {
                            return [2 /*return*/, this];
                        }
                        nextToken = existingTokens.at(0)[0];
                        // Get balances and keep non-zero only
                        // Find token with highest priority
                        // Get token type of this token
                        switch (token_1.supportedTokens[nextToken].type) {
                            case token_1.TokenType.CONNECTOR:
                                pathAsset = new connectorPathAsset_1.ConnectorPathAsset();
                                break;
                            case token_1.TokenType.YEARN_VAULT:
                                pathAsset = new yearnVaultPathAsset_1.YearnVaultPathAsset();
                                break;
                            case token_1.TokenType.CONVEX_LP_TOKEN:
                                pathAsset = new convexLPTokenPathAsset_1.ConvexLPTokenPathAsset();
                                break;
                            case token_1.TokenType.CURVE_LP:
                                pathAsset = new curveLPPathAsset_1.CurveLPPathAsset();
                                break;
                            case token_1.TokenType.META_CURVE_LP:
                                pathAsset = new metaCurveLPPathAsset_1.MetaCurveLPPathAsset();
                                break;
                            case token_1.TokenType.NORMAL_TOKEN:
                                pathAsset = new normalTokenPathAsset_1.NormalTokenPathAsset();
                                break;
                            case token_1.TokenType.YEARN_VAULT_OF_CURVE_LP:
                                pathAsset = new yearnVaultOfCurveLPPathAsset_1.YearnVaultOfCurveLPPathAsset();
                                break;
                            case token_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP:
                                pathAsset = new yearnVaultOfMetaCurveLPPathAsset_1.YearnVaultOfMetaCurveLPPathAsset();
                                break;
                            default:
                                throw new Error("Token type not supported yet");
                        }
                        return [4 /*yield*/, pathAsset.getBestPath(nextToken, this)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Path;
}());
exports.Path = Path;
;
var PathAsset = /** @class */ (function () {
    function PathAsset() {
    }
    PathAsset.prototype.getUniswapV2SwapData = function (adapterAddress, currentTokenAddress, currentBalance, nextTokenAddress, p) {
        return __awaiter(this, void 0, void 0, function () {
            var deadline, uniswapV2Adapter, path, amountsOut, amountOut, gasLimit, call;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deadline = Math.floor(Date.now() / 1000) + 1200;
                        uniswapV2Adapter = types_1.UniswapV2Adapter__factory.connect(adapterAddress, p.provider);
                        path = [currentTokenAddress, nextTokenAddress];
                        return [4 /*yield*/, uniswapV2Adapter.getAmountsOut(currentBalance, path)];
                    case 1:
                        amountsOut = _a.sent();
                        amountOut = amountsOut[amountsOut.length - 1];
                        return [4 /*yield*/, uniswapV2Adapter.estimateGas.swapExactTokensForTokens(currentBalance, amountOut, path, p.creditAccount.addr, deadline)];
                    case 2:
                        gasLimit = _a.sent();
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.UniswapV2Adapter__factory.createInterface().encodeFunctionData("swapExactTokensForTokens", [currentBalance, amountOut, path, p.creditAccount.addr, deadline])
                        };
                        return [2 /*return*/, { callData: call, amountOut: amountOut, gasLimit: gasLimit }];
                }
            });
        });
    };
    PathAsset.prototype.getUniswapV3SwapData = function (adapterAddress, currentTokenAddress, currentBalance, nextTokenAddress, p) {
        return __awaiter(this, void 0, void 0, function () {
            var uniswapV3Adapter, iQuoter, amountOut, deadline, exactInputSingleOrder, call, gasLimit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        uniswapV3Adapter = types_1.UniswapV3Adapter__factory.connect(adapterAddress, p.provider);
                        iQuoter = types_1.IQuoter__factory.connect(contracts_1.UNISWAP_V3_QUOTER, p.provider);
                        return [4 /*yield*/, iQuoter.callStatic.quoteExactInputSingle(currentTokenAddress, nextTokenAddress, 3000, currentBalance, 0)];
                    case 1:
                        amountOut = _a.sent();
                        deadline = Math.floor(Date.now() / 1000) + 1200;
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
                    case 2:
                        gasLimit = _a.sent();
                        return [2 /*return*/, { callData: call, amountOut: amountOut, gasLimit: gasLimit }];
                }
            });
        });
    };
    PathAsset.prototype.getCurveActionData = function (adapterAddress, currentToken, currentBalance, nextToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var curve3CrvPool, currentIndex, outputIndex, amountOut, gasLimit, call;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        curve3CrvPool = types_1.CurveV1Adapter__factory.connect(adapterAddress, p.provider);
                        currentIndex = token_1.Curve3CrvUnderlyingTokenIndex[currentToken];
                        outputIndex = token_1.Curve3CrvUnderlyingTokenIndex[nextToken];
                        return [4 /*yield*/, curve3CrvPool.get_dy_underlying(currentIndex, outputIndex, currentBalance)];
                    case 1:
                        amountOut = _a.sent();
                        return [4 /*yield*/, curve3CrvPool.estimateGas.exchange_underlying(currentIndex, outputIndex, currentBalance, amountOut)];
                    case 2:
                        gasLimit = _a.sent();
                        call = {
                            targetContract: adapterAddress,
                            callData: types_1.CurveV1Adapter__factory.createInterface().encodeFunctionData("exchange_underlying", [currentIndex, outputIndex, currentBalance, amountOut])
                        };
                        return [2 /*return*/, { callData: call, amountOut: amountOut, gasLimit: gasLimit }];
                }
            });
        });
    };
    PathAsset.prototype.getActionData = function (swapAction, currentTokenAddress, currentToken, currentBalance, nextTokenAddress, nextToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var actionType, actionContract, actionContractAddress, adapterAddress, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        actionType = swapAction.type;
                        actionContract = swapAction.contract;
                        actionContractAddress = contracts_1.contractsByNetwork[p.networkType][actionContract];
                        adapterAddress = p.creditManager.adapters[actionContractAddress];
                        _a = actionType;
                        switch (_a) {
                            case tradeTypes_1.TradeType.UniswapV2Swap: return [3 /*break*/, 1];
                            case tradeTypes_1.TradeType.UniswapV3Swap: return [3 /*break*/, 3];
                            case tradeTypes_1.TradeType.CurveExchange: return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 8];
                    case 1: return [4 /*yield*/, this.getUniswapV2SwapData(adapterAddress, currentTokenAddress, currentBalance, nextTokenAddress, p)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.getUniswapV3SwapData(adapterAddress, currentTokenAddress, currentBalance, nextTokenAddress, p)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5:
                        if (!swapAction.tokenOut.includes(p.pool)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getCurveActionData(adapterAddress, currentToken, currentBalance, nextToken, p)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [2 /*return*/, {
                            callData: {
                                targetContract: "",
                                callData: ""
                            },
                            amountOut: ethers_1.BigNumber.from(0),
                            gasLimit: ethers_1.BigNumber.from(0)
                        }];
                    case 8: throw Error("TradeType not supported. ".concat(actionType));
                }
            });
        });
    };
    PathAsset.prototype.getYearnActionData = function (lpAction, currentBalance, p) {
        return __awaiter(this, void 0, void 0, function () {
            var actionContract, allowedContract, adapterAddress, call, IYVault, price, gasLimit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actionContract = lpAction.contract;
                        allowedContract = contracts_1.contractsByNetwork[p.networkType][actionContract];
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
                        return [2 /*return*/, {
                                callData: call,
                                amountOut: currentBalance.mul(price),
                                gasLimit: gasLimit
                            }];
                }
            });
        });
    };
    return PathAsset;
}());
exports.PathAsset = PathAsset;
