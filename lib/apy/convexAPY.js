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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurveBaseApy = exports.getConvexApy = void 0;
var ethers_1 = require("ethers");
var axios_1 = __importDefault(require("axios"));
var contracts_1 = require("../contracts/contracts");
var token_1 = require("../tokens/token");
var types_1 = require("../types");
var multicall_1 = require("../utils/multicall");
var formatter_1 = require("../utils/formatter");
var constants_1 = require("../core/constants");
var curveSwapByPool = {
    CONVEX_3CRV_POOL: "CURVE_3CRV_POOL",
    CONVEX_FRAX3CRV_POOL: "CURVE_FRAX_POOL",
    CONVEX_LUSD3CRV_POOL: "CURVE_LUSD_POOL",
    CONVEX_GUSD_POOL: "CURVE_GUSD_POOL",
    CONVEX_SUSD_POOL: "CURVE_SUSD_POOL"
};
function getConvexApy(pool, provider, networkType, getTokenPrice) {
    return __awaiter(this, void 0, void 0, function () {
        var tokenList, contractsList, poolParams, stakedTokenParams, underlying, basePoolAddress, swapPoolAddress, cvxAddress, extraPoolAddresses, _a, basePoolRate, basePoolSupply, vPrice, cvxSupply, extra, cvxPrice, crvPrice, crvPerSecond, virtualSupply, crvPerUnderlying, crvPerYear, cvxPerYear, crvAPY, cvxAPY, extraAPRs, extraAPYTotal, baseApyRAY;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    tokenList = token_1.tokenDataByNetwork[networkType];
                    contractsList = contracts_1.contractsByNetwork[networkType];
                    poolParams = contracts_1.contractParams[pool];
                    stakedTokenParams = token_1.supportedTokens[poolParams.stakedToken];
                    underlying = stakedTokenParams.underlying;
                    basePoolAddress = contractsList[pool];
                    swapPoolAddress = contractsList[curveSwapByPool[pool]];
                    cvxAddress = tokenList.CVX;
                    extraPoolAddresses = poolParams.extraRewards.map(function (d) {
                        return d.poolAddress[networkType];
                    });
                    return [4 /*yield*/, getPoolData(basePoolAddress, swapPoolAddress, cvxAddress, extraPoolAddresses, provider)];
                case 1:
                    _a = _b.sent(), basePoolRate = _a[0], basePoolSupply = _a[1], vPrice = _a[2], cvxSupply = _a[3], extra = _a.slice(4);
                    cvxPrice = getTokenPrice(tokenList["CVX"]);
                    crvPrice = getTokenPrice(tokenList["CRV"]);
                    crvPerSecond = basePoolRate;
                    virtualSupply = basePoolSupply.mul(vPrice).div(constants_1.WAD);
                    crvPerUnderlying = crvPerSecond.mul(constants_1.WAD).div(virtualSupply);
                    crvPerYear = crvPerUnderlying.mul(constants_1.SECONDS_PER_YEAR);
                    cvxPerYear = getCVXMintAmount(crvPerYear, cvxSupply);
                    crvAPY = crvPerYear.mul(cvxPrice).div(constants_1.PRICE_DECIMALS);
                    cvxAPY = cvxPerYear.mul(crvPrice).div(constants_1.PRICE_DECIMALS);
                    return [4 /*yield*/, Promise.all(extraPoolAddresses.map(function (_, index) { return __awaiter(_this, void 0, void 0, function () {
                            var extraRewardSymbol, extraPoolRate, perUnderlying, perYear, extraPrise, extraAPY;
                            return __generator(this, function (_a) {
                                extraRewardSymbol = poolParams.extraRewards[index].rewardToken;
                                extraPoolRate = extra[index];
                                perUnderlying = extraPoolRate.mul(constants_1.WAD).div(virtualSupply);
                                perYear = perUnderlying.mul(constants_1.SECONDS_PER_YEAR);
                                extraPrise = getTokenPrice(tokenList[extraRewardSymbol]);
                                extraAPY = perYear.mul(extraPrise).div(constants_1.PRICE_DECIMALS);
                                return [2 /*return*/, extraAPY];
                            });
                        }); }))];
                case 2:
                    extraAPRs = _b.sent();
                    extraAPYTotal = extraAPRs.reduce(function (acc, apy) { return acc.add(apy); }, ethers_1.BigNumber.from(0));
                    return [4 /*yield*/, getCurveBaseApy(underlying)];
                case 3:
                    baseApyRAY = _b.sent();
                    return [2 /*return*/, baseApyRAY.add(crvAPY).add(cvxAPY).add(extraAPYTotal)];
            }
        });
    });
}
exports.getConvexApy = getConvexApy;
var CVX_MAX_SUPPLY = constants_1.WAD.mul(100000000);
var CVX_REDUCTION_PER_CLIFF = ethers_1.BigNumber.from(100000);
var CVX_TOTAL_CLIFFS = constants_1.WAD.mul(1000);
function getCVXMintAmount(crvAmount, cvxSupply) {
    var currentCliff = cvxSupply.div(CVX_REDUCTION_PER_CLIFF);
    if (currentCliff.lt(CVX_TOTAL_CLIFFS)) {
        var remainingCliffs = CVX_TOTAL_CLIFFS.sub(currentCliff);
        var mintedAmount = crvAmount.mul(remainingCliffs).div(CVX_TOTAL_CLIFFS);
        var amountTillMax = CVX_MAX_SUPPLY.sub(cvxSupply);
        return mintedAmount.gt(amountTillMax) ? amountTillMax : mintedAmount;
    }
    return ethers_1.BigNumber.from(0);
}
function getPoolData(basePoolAddress, underlying, cvxAddress, extraPoolAddresses, provider) {
    return __awaiter(this, void 0, void 0, function () {
        var calls;
        return __generator(this, function (_a) {
            calls = __spreadArray([
                {
                    address: basePoolAddress,
                    interface: types_1.IBaseRewardPool__factory.createInterface(),
                    method: "rewardRate()"
                },
                {
                    address: basePoolAddress,
                    interface: types_1.IBaseRewardPool__factory.createInterface(),
                    method: "totalSupply()"
                },
                {
                    address: underlying,
                    interface: types_1.CurveV1AdapterStETH__factory.createInterface(),
                    method: "get_virtual_price()"
                },
                {
                    address: cvxAddress,
                    interface: types_1.IConvexToken__factory.createInterface(),
                    method: "totalSupply()"
                }
            ], extraPoolAddresses.map(function (extraPoolAddress) { return ({
                address: extraPoolAddress,
                interface: types_1.IBaseRewardPool__factory.createInterface(),
                method: "rewardRate()"
            }); }), true);
            return [2 /*return*/, (0, multicall_1.multicall)(calls, provider)];
        });
    });
}
var curveLPTokenToPoolName = {
    "3Crv": "3pool",
    FRAX3CRV: "frax",
    gusd3CRV: "gusd",
    LUSD3CRV: "lusd",
    crvPlain3andSUSD: "susdv2",
    steCRV: "steth"
};
var RESPONSE_DECIMALS = 100;
// https://www.convexfinance.com/api/curve-apys
function getCurveBaseApy(curveLPToken) {
    return __awaiter(this, void 0, void 0, function () {
        var poolName, url, result, _a, baseApy, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    poolName = curveLPTokenToPoolName[curveLPToken];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    url = "https://www.convexfinance.com/api/curve-apys";
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 2:
                    result = _b.sent();
                    _a = (result.data.apys[poolName] || {}).baseApy, baseApy = _a === void 0 ? 0 : _a;
                    return [2 /*return*/, (0, formatter_1.toBN)((baseApy / RESPONSE_DECIMALS).toString(), constants_1.WAD_DECIMALS_POW)];
                case 3:
                    e_1 = _b.sent();
                    return [2 /*return*/, ethers_1.BigNumber.from(0)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getCurveBaseApy = getCurveBaseApy;
