"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.NormalTokenPathAsset = void 0;
var ethers_1 = require("ethers");
var token_1 = require("../core/token");
var path_1 = require("./path");
var connectorPathAsset_1 = require("./connectorPathAsset");
var NormalTokenPathAsset = /** @class */ (function (_super) {
    __extends(NormalTokenPathAsset, _super);
    function NormalTokenPathAsset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NormalTokenPathAsset.prototype.getBestPath = function (currentToken, p) {
        return __awaiter(this, void 0, void 0, function () {
            var currentBalance, currentTokenAddress, currentTokenData, callData, nextToken, gasLimit, amountOut, maxPoolAmountOut, _i, ConnectorTokens_1, connToken, connTokenAddress, _a, _b, swapAction, exchangeData, connectorPathAsset, poolAmountOut;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        currentBalance = p.balances[currentToken].sub(1);
                        currentTokenAddress = token_1.tokenDataByNetwork[p.networkType][currentToken];
                        currentTokenData = token_1.supportedTokens[currentToken];
                        callData = {
                            targetContract: "",
                            callData: ""
                        };
                        nextToken = p.pool;
                        gasLimit = ethers_1.BigNumber.from(0);
                        amountOut = ethers_1.BigNumber.from(0);
                        maxPoolAmountOut = ethers_1.BigNumber.from(0);
                        _i = 0, ConnectorTokens_1 = token_1.ConnectorTokens;
                        _c.label = 1;
                    case 1:
                        if (!(_i < ConnectorTokens_1.length)) return [3 /*break*/, 8];
                        connToken = ConnectorTokens_1[_i];
                        connTokenAddress = token_1.tokenDataByNetwork[p.networkType][connToken];
                        _a = 0, _b = currentTokenData.swapActions;
                        _c.label = 2;
                    case 2:
                        if (!(_a < _b.length)) return [3 /*break*/, 7];
                        swapAction = _b[_a];
                        return [4 /*yield*/, this.getExchangeData(swapAction, currentTokenAddress, currentToken, currentBalance, connTokenAddress, connToken, p)];
                    case 3:
                        exchangeData = _c.sent();
                        if (!(connToken != p.pool)) return [3 /*break*/, 5];
                        connectorPathAsset = new connectorPathAsset_1.ConnectorPathAsset();
                        return [4 /*yield*/, connectorPathAsset.getMaxPoolAmount(connToken, exchangeData.amountOut, p)];
                    case 4:
                        poolAmountOut = _c.sent();
                        if (poolAmountOut > maxPoolAmountOut) {
                            maxPoolAmountOut = poolAmountOut;
                            callData = exchangeData.callData;
                            amountOut = exchangeData.amountOut;
                            gasLimit = exchangeData.gasLimit;
                            nextToken = connToken;
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        if (exchangeData.amountOut > maxPoolAmountOut) {
                            maxPoolAmountOut = exchangeData.amountOut;
                            callData = exchangeData.callData;
                            amountOut = exchangeData.amountOut;
                            gasLimit = exchangeData.gasLimit;
                            nextToken = p.pool;
                        }
                        _c.label = 6;
                    case 6:
                        _a++;
                        return [3 /*break*/, 2];
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        if (callData.targetContract != "") {
                            p.balances[nextToken].add(amountOut);
                            p.balances[currentToken] = ethers_1.BigNumber.from(1);
                            p.totalGasLimit.add(gasLimit);
                            p.calls.push(callData);
                        }
                        return [4 /*yield*/, p.getBestPath()];
                    case 9: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    return NormalTokenPathAsset;
}(path_1.PathAsset));
exports.NormalTokenPathAsset = NormalTokenPathAsset;
