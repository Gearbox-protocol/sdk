"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.Path = void 0;
var ethers_1 = require("ethers");
var token_1 = require("../tokens/token");
var types_1 = require("../types");
var priority_1 = require("./priority");
var yVault_1 = require("./yVault");
var convexLP_1 = require("./convexLP");
var curveLP_1 = require("./curveLP");
var network_1 = require("../utils/network");
var contracts_1 = require("./contracts");
var tokenType_1 = require("../tokens/tokenType");
var Path = /** @class */ (function () {
    function Path(opts) {
        this.calls = [];
        this.balances = opts.balances;
        this.underlying = opts.underlying;
        this.creditManager = opts.creditManager;
        this.creditAccount = opts.creditAccount;
        this.networkType = opts.networkType;
        this.provider = opts.provider;
        this.totalGasLimit = opts.totalGasLimit;
    }
    Path.prototype.popBalance = function (token) {
        var currentBalance = this.balances[token];
        if (currentBalance === undefined || currentBalance.gt(1))
            return ethers_1.BigNumber.from(0);
        this.balances[token] = ethers_1.BigNumber.from(1);
        return currentBalance.sub(1);
    };
    Path.comparedByPriority = function (_a, _b) {
        var tokenA = _a[0];
        var tokenB = _b[0];
        var priorityTokenA = priority_1.priority[token_1.supportedTokens[tokenA].type];
        var priorityTokenB = priority_1.priority[token_1.supportedTokens[tokenB].type];
        if (priorityTokenA > priorityTokenB) {
            return -1;
        }
        if (priorityTokenA < priorityTokenB) {
            return 1;
        }
        return 0;
    };
    Path.findBestPath = function (creditAccount, creditManager, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var networkType, balances, initialPath, lpPaths, pathFinder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, network_1.detectNetwork)(provider)];
                    case 1:
                        networkType = _a.sent();
                        balances = Object.entries(creditAccount.balances)
                            .map(function (_a) {
                            var address = _a[0], balance = _a[1];
                            return ({
                                token: token_1.tokenSymbolByAddress[address.toLowerCase()],
                                balance: balance
                            });
                        })
                            .filter(function (t) { return t.balance.gt(1); })
                            .reduce(function (obj, curValue) {
                            var _a;
                            return (__assign(__assign({}, obj), (_a = {}, _a[curValue.token] = curValue.balance, _a)));
                        }, {});
                        initialPath = new Path({
                            balances: balances,
                            creditAccount: creditAccount,
                            creditManager: creditManager,
                            networkType: networkType,
                            provider: provider,
                            underlying: "DAI",
                            totalGasLimit: 0
                        });
                        return [4 /*yield*/, initialPath.withdrawTokens()];
                    case 2:
                        lpPaths = _a.sent();
                        pathFinder = types_1.SwapPathFinder__factory.connect(contracts_1.pathFindersByNetwork[networkType].PATH_FINDER, provider);
                        console.debug(lpPaths);
                        console.debug(pathFinder);
                        return [2 /*return*/];
                }
            });
        });
    };
    Path.prototype.withdrawTokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var existingTokens, nextToken, lpPathFinder;
            return __generator(this, function (_a) {
                existingTokens = Object.entries(this.balances)
                    .filter(function (_a) {
                    var balance = _a[1];
                    return balance.gt(1);
                })
                    .sort(Path.comparedByPriority);
                // TODO: Add checks for lenght
                if (existingTokens.length === 0)
                    throw new Error("No tokens with balance >1");
                nextToken = existingTokens[0][0];
                // Get balances and keep non-zero only
                // Find token with highest priority
                // Get token type of this token
                switch (token_1.supportedTokens[nextToken].type) {
                    case tokenType_1.TokenType.NORMAL_TOKEN:
                    case tokenType_1.TokenType.CONNECTOR:
                        return [2 /*return*/, [this]];
                    case tokenType_1.TokenType.YEARN_VAULT_OF_CURVE_LP:
                    case tokenType_1.TokenType.YEARN_VAULT_OF_META_CURVE_LP:
                    case tokenType_1.TokenType.YEARN_VAULT:
                        lpPathFinder = new yVault_1.YearnVaultPathFinder(nextToken);
                        break;
                    case tokenType_1.TokenType.CONVEX_LP_TOKEN:
                        lpPathFinder = new convexLP_1.ConvexLPPathFinder();
                        break;
                    case tokenType_1.TokenType.META_CURVE_LP:
                    case tokenType_1.TokenType.CURVE_LP:
                        lpPathFinder = new curveLP_1.CurvePathFinder(nextToken);
                        break;
                    default:
                        throw new Error("Token type not supported yet");
                }
                return [2 /*return*/, lpPathFinder.findWithdrawPaths(this)];
            });
        });
    };
    Path.prototype.clone = function () {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    };
    return Path;
}());
exports.Path = Path;
