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
exports.getRewards = exports.getCurveBaseApy = exports.getConvexApyRAY = void 0;
var ethers_1 = require("ethers");
var network_1 = require("../utils/network");
var axios_1 = __importDefault(require("axios"));
var contracts_1 = require("../contracts/contracts");
var token_1 = require("../tokens/token");
var types_1 = require("../types");
var multicall_1 = require("../utils/multicall");
var constants_1 = require("../core/constants");
var CVX_MAX_SUPPLY = constants_1.WAD.mul(Math.pow(10, 8));
var CVX_REDUCTION_PER_CLIFF = constants_1.WAD.mul(Math.pow(10, 5));
var CVX_TOTAL_CLIFFS = ethers_1.BigNumber.from(1000);
var curveLPTokenToPoolName = {
    "3Crv": "3pool",
    "FRAX3CRV": "frax",
    "gusd3CRV": "gusd",
    "LUSD3CRV": "lusd",
    "crvPlain3andSUSD": "susdv2",
    "steCRV": "steth"
};
function getConvexApyRAY(pool, provider, getTokenPrice) {
    return __awaiter(this, void 0, void 0, function () {
        var poolParams, stakedTokenParams, underlying, networkType, basePoolAddress, cvxAddress, extraPoolAddresses, poolData, basePoolRate, basePoolSupply, cvxSupply, crvPerSecond, cvxPerSecond, crvPerUnderlyingPerYearRAY, crvApyRAY, cvxPerUnderlyingPerYearRAY, cvxApyRAY, totalExtraApyRAY, i, extraReward, extraPoolRate, extraPoolSupply, extraPerUnderlyingPerYearRAY, extraApyRAY, baseApyRAY, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    poolParams = contracts_1.contractParams[pool];
                    stakedTokenParams = token_1.supportedTokens[poolParams.stakedToken];
                    underlying = stakedTokenParams.underlying;
                    return [4 /*yield*/, (0, network_1.detectNetwork)(provider)];
                case 1:
                    networkType = _c.sent();
                    basePoolAddress = contracts_1.contractsByNetwork[networkType][pool];
                    cvxAddress = token_1.tokenDataByNetwork[networkType].CVX;
                    extraPoolAddresses = poolParams.extraRewards.map(function (d) {
                        return d.poolAddress[networkType];
                    });
                    return [4 /*yield*/, getPoolData(basePoolAddress, cvxAddress, extraPoolAddresses, provider)];
                case 2:
                    poolData = _c.sent();
                    if (poolData.length != 3 + extraPoolAddresses.length) {
                        throw ("Convex APY: Incorrect number of results when fetching pool data");
                    }
                    basePoolRate = poolData[0];
                    basePoolSupply = poolData[1];
                    cvxSupply = poolData[2];
                    crvPerSecond = basePoolRate;
                    return [4 /*yield*/, getCVXMintAmount(crvPerSecond, cvxSupply)];
                case 3:
                    cvxPerSecond = _c.sent();
                    crvPerUnderlyingPerYearRAY = crvPerSecond.mul(constants_1.RAY).mul(constants_1.SECONDS_PER_YEAR).div(basePoolSupply);
                    crvApyRAY = crvPerUnderlyingPerYearRAY.mul(getTokenPrice("CRV")).div(getTokenPrice(underlying));
                    cvxPerUnderlyingPerYearRAY = cvxPerSecond.mul(constants_1.RAY).mul(constants_1.SECONDS_PER_YEAR).div(basePoolSupply);
                    cvxApyRAY = cvxPerUnderlyingPerYearRAY.mul(getTokenPrice("CVX")).div(getTokenPrice(underlying));
                    totalExtraApyRAY = ethers_1.BigNumber.from(0);
                    for (i = 0; i < extraPoolAddresses.length; i++) {
                        extraReward = poolParams.extraRewards[i].rewardToken;
                        extraPoolRate = poolData[3 + i];
                        extraPoolSupply = basePoolSupply;
                        extraPerUnderlyingPerYearRAY = extraPoolRate.mul(constants_1.RAY).mul(constants_1.SECONDS_PER_YEAR).div(extraPoolSupply);
                        extraApyRAY = extraPerUnderlyingPerYearRAY.mul(getTokenPrice(extraReward)).div(getTokenPrice(underlying));
                        totalExtraApyRAY = totalExtraApyRAY.add(extraApyRAY);
                    }
                    _b = (_a = constants_1.RAY).mul;
                    return [4 /*yield*/, getCurveBaseApy(underlying)];
                case 4:
                    baseApyRAY = _b.apply(_a, [(_c.sent()) / 100]);
                    return [2 /*return*/, baseApyRAY.add(crvApyRAY).add(cvxApyRAY).add(totalExtraApyRAY)];
            }
        });
    });
}
exports.getConvexApyRAY = getConvexApyRAY;
function getCVXMintAmount(amount, cvxSupply) {
    return __awaiter(this, void 0, void 0, function () {
        var cliff, reduction, mintedAmount;
        return __generator(this, function (_a) {
            cliff = cvxSupply.div(CVX_REDUCTION_PER_CLIFF);
            if (cliff < CVX_TOTAL_CLIFFS) {
                reduction = CVX_TOTAL_CLIFFS.sub(cliff);
                mintedAmount = amount.mul(reduction).div(CVX_TOTAL_CLIFFS);
                return [2 /*return*/, mintedAmount < CVX_MAX_SUPPLY.sub(cvxSupply) ? mintedAmount : CVX_MAX_SUPPLY.sub(cvxSupply)];
            }
            return [2 /*return*/, ethers_1.BigNumber.from(0)];
        });
    });
}
function getPoolData(basePoolAddress, cvxAddress, extraPoolAddresses, provider) {
    return __awaiter(this, void 0, void 0, function () {
        var calls, _i, extraPoolAddresses_1, extraPoolAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    calls = [
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
                            address: cvxAddress,
                            interface: types_1.IConvexToken__factory.createInterface(),
                            method: "totalSupply()"
                        }
                    ];
                    for (_i = 0, extraPoolAddresses_1 = extraPoolAddresses; _i < extraPoolAddresses_1.length; _i++) {
                        extraPoolAddress = extraPoolAddresses_1[_i];
                        calls.push({
                            address: extraPoolAddress,
                            interface: types_1.IBaseRewardPool__factory.createInterface(),
                            method: "rewardRate()"
                        });
                    }
                    return [4 /*yield*/, (0, multicall_1.multicall)(calls, provider)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
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
                    _a = (result.data.apys[poolName.toLowerCase()] || {}).baseApy, baseApy = _a === void 0 ? 0 : _a;
                    return [2 /*return*/, baseApy];
                case 3:
                    e_1 = _b.sent();
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getCurveBaseApy = getCurveBaseApy;
function getRewards(pool) {
    return __spreadArray([
        "CRV",
        "CVX"
    ], contracts_1.contractParams[pool].extraRewards.map(function (d) { d.rewardToken; }), true);
}
exports.getRewards = getRewards;
