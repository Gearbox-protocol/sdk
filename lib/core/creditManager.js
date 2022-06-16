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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditManagerStat = exports.calcHealthFactorAfterAddingCollateral = exports.calcHealthFactorAfterIncreasingBorrow = exports.calcMaxIncreaseBorrow = exports.CreditManagerData = void 0;
var ethers_1 = require("ethers");
var formatter_1 = require("../utils/formatter");
var types_1 = require("../types");
var typesV2_1 = require("../typesV2");
var constants_1 = require("./constants");
var CreditManagerData = /** @class */ (function () {
    function CreditManagerData(_a) {
        var addr = _a.addr, _b = _a.underlying, underlying = _b === void 0 ? "" : _b, _c = _a.isWETH, isWETH = _c === void 0 ? false : _c, _d = _a.canBorrow, canBorrow = _d === void 0 ? false : _d, _e = _a.borrowRate, borrowRate = _e === void 0 ? 0 : _e, _f = _a.minAmount, minAmount = _f === void 0 ? 0 : _f, _g = _a.maxAmount, maxAmount = _g === void 0 ? 0 : _g, _h = _a.maxLeverageFactor, maxLeverageFactor = _h === void 0 ? 0 : _h, _j = _a.availableLiquidity, availableLiquidity = _j === void 0 ? 0 : _j, _k = _a.collateralTokens, collateralTokens = _k === void 0 ? [] : _k, _l = _a.adapters, adapters = _l === void 0 ? [] : _l, _m = _a.liquidationThresholds, liquidationThresholds = _m === void 0 ? [] : _m, _o = _a.version, version = _o === void 0 ? 1 : _o, _p = _a.creditFacade, creditFacade = _p === void 0 ? "" : _p, _q = _a.isDegenMode, isDegenMode = _q === void 0 ? false : _q, _r = _a.degenNFT, degenNFT = _r === void 0 ? "" : _r, _s = _a.isIncreaseDebtForbidden, isIncreaseDebtForbidden = _s === void 0 ? false : _s, _t = _a.forbiddenTokenMask, forbiddenTokenMask = _t === void 0 ? 0 : _t;
        this.id = addr;
        this.address = addr;
        this.underlyingToken = underlying;
        this.isWETH = isWETH;
        this.canBorrow = canBorrow;
        this.borrowRate =
            ethers_1.BigNumber.from(borrowRate)
                .mul(constants_1.PERCENTAGE_FACTOR)
                .mul(100)
                .div(constants_1.RAY)
                .toNumber() / constants_1.PERCENTAGE_FACTOR;
        this.minAmount = ethers_1.BigNumber.from(minAmount);
        this.maxAmount = ethers_1.BigNumber.from(maxAmount);
        this.maxLeverageFactor = ethers_1.BigNumber.from(maxLeverageFactor).toNumber();
        this.availableLiquidity = ethers_1.BigNumber.from(availableLiquidity);
        this.allowedTokens = collateralTokens;
        this.adapters = adapters.reduce(function (acc, _a) {
            var _b;
            var allowedContract = _a.allowedContract, adapter = _a.adapter;
            return (__assign(__assign({}, acc), (_b = {}, _b[allowedContract] = adapter, _b)));
        }, {});
        this.liquidationThresholds = liquidationThresholds.map(function (threshold) {
            return ethers_1.BigNumber.from(threshold);
        });
        this.version = version;
        this.creditFacade = creditFacade;
        this.isDegenMode = isDegenMode;
        this.degenNFT = degenNFT;
        this.isIncreaseDebtForbidden = isIncreaseDebtForbidden;
        this.forbiddenTokenMask = ethers_1.BigNumber.from(forbiddenTokenMask);
    }
    CreditManagerData.prototype.contractToAdapter = function (contractAddress) {
        return this.adapters[contractAddress];
    };
    CreditManagerData.prototype.encodeAddCollateral = function (accountAddress, tokenAddress, amount) {
        if (this.version !== 2)
            throw new Error("Multicall is eligible only for version 2");
        return {
            target: this.creditFacade,
            callData: typesV2_1.ICreditFacade__factory.createInterface().encodeFunctionData("addCollateral", [accountAddress, tokenAddress, amount])
        };
    };
    CreditManagerData.prototype.encodeIncreaseDebt = function (amount) {
        if (this.version !== 2)
            throw new Error("Multicall is eligible only for version 2");
        return {
            target: this.creditFacade,
            callData: typesV2_1.ICreditFacade__factory.createInterface().encodeFunctionData("increaseDebt", [amount])
        };
    };
    CreditManagerData.prototype.encodeDecreaseDebt = function (amount) {
        if (this.version !== 2)
            throw new Error("Multicall is eligible only for version 2");
        return {
            target: this.creditFacade,
            callData: typesV2_1.ICreditFacade__factory.createInterface().encodeFunctionData("decreaseDebt", [amount])
        };
    };
    CreditManagerData.prototype.validateOpenAccount = function (balance, decimals, amount_BN, leverage) {
        if (balance.lt(amount_BN))
            return "Insufficient funds";
        if (amount_BN.lt(this.minAmount))
            return "Amount is less than minimal (".concat((0, formatter_1.formatBN)(this.minAmount, decimals), ")");
        if (amount_BN.gt(this.maxAmount))
            return "Amount is greater than maximum (".concat((0, formatter_1.formatBN)(this.maxAmount, decimals), ")");
        if (leverage > this.maxLeverageFactor)
            return "Leverage is bigger than max";
        if (amount_BN.mul(leverage).div(100).gt(this.availableLiquidity))
            return "Insufficient liquidity in the pool";
        return null;
    };
    CreditManagerData.prototype.getContractETH = function (signer) {
        return types_1.IAppCreditManager__factory.connect(this.address, signer);
    };
    Object.defineProperty(CreditManagerData.prototype, "isPaused", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    return CreditManagerData;
}());
exports.CreditManagerData = CreditManagerData;
function calcMaxIncreaseBorrow(healthFactor, borrowAmountPlusInterest, maxLeverageFactor) {
    var healthFactorPercentage = Math.floor(healthFactor * constants_1.PERCENTAGE_FACTOR);
    var minHealthFactor = Math.floor((constants_1.UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD * (maxLeverageFactor + 100)) /
        maxLeverageFactor);
    var result = borrowAmountPlusInterest
        .mul(healthFactorPercentage - minHealthFactor)
        .div(minHealthFactor - constants_1.UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD);
    return result.isNegative() ? ethers_1.BigNumber.from(0) : result;
}
exports.calcMaxIncreaseBorrow = calcMaxIncreaseBorrow;
function calcHealthFactorAfterIncreasingBorrow(healthFactor, borrowAmountPlusInterest, additional) {
    if (!healthFactor || !borrowAmountPlusInterest)
        return 0;
    var healthFactorPercentage = Math.floor(healthFactor * constants_1.PERCENTAGE_FACTOR);
    return (borrowAmountPlusInterest
        .mul(healthFactorPercentage)
        .add(additional.mul(constants_1.UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD))
        .div(borrowAmountPlusInterest.add(additional))
        .toNumber() / constants_1.PERCENTAGE_FACTOR);
}
exports.calcHealthFactorAfterIncreasingBorrow = calcHealthFactorAfterIncreasingBorrow;
function calcHealthFactorAfterAddingCollateral(healthFactor, borrowAmountPlusInterest, additionalCollateral) {
    if (!healthFactor || !borrowAmountPlusInterest)
        return 0;
    var healthFactorPercentage = Math.floor(healthFactor * constants_1.PERCENTAGE_FACTOR);
    return (borrowAmountPlusInterest
        .mul(healthFactorPercentage)
        .add(additionalCollateral.mul(constants_1.UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD))
        .div(borrowAmountPlusInterest)
        .toNumber() / constants_1.PERCENTAGE_FACTOR);
}
exports.calcHealthFactorAfterAddingCollateral = calcHealthFactorAfterAddingCollateral;
var CreditManagerStat = /** @class */ (function (_super) {
    __extends(CreditManagerStat, _super);
    function CreditManagerStat(payload) {
        var _this = _super.call(this, payload) || this;
        _this.uniqueUsers = payload.uniqueUsers;
        _this.openedAccountsCount = payload.openedAccountsCount || 0;
        _this.totalOpenedAccounts = payload.totalOpenedAccounts || 0;
        _this.totalClosedAccounts = payload.totalClosedAccounts || 0;
        _this.totalRepaidAccounts = payload.totalRepaidAccounts || 0;
        _this.totalLiquidatedAccounts = payload.totalLiquidatedAccounts || 0;
        _this.totalBorrowed = ethers_1.BigNumber.from(payload.totalBorrowed || 0);
        _this.cumulativeBorrowed = ethers_1.BigNumber.from(payload.cumulativeBorrowed || 0);
        _this.totalRepaid = ethers_1.BigNumber.from(payload.totalRepaid || 0);
        _this.totalProfit = ethers_1.BigNumber.from(payload.totalProfit || 0);
        _this.totalLosses = ethers_1.BigNumber.from(payload.totalLosses || 0);
        return _this;
    }
    return CreditManagerStat;
}(CreditManagerData));
exports.CreditManagerStat = CreditManagerStat;
