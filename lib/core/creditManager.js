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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditManagerStat = exports.calcHealthFactorAfterAddingCollateral = exports.calcHealthFactorAfterIncreasingBorrow = exports.calcMaxIncreaseBorrow = exports.CreditManagerData = void 0;
var ethers_1 = require("ethers");
var types_1 = require("../types");
var formatter_1 = require("../utils/formatter");
var constants_1 = require("./constants");
var CreditManagerData = /** @class */ (function () {
    function CreditManagerData(payload) {
        var _this = this;
        var _a;
        this.adapters = {};
        this.version = 1;
        this.id = payload.addr;
        this.address = payload.addr;
        this.underlyingToken = payload.underlyingToken || "";
        this.isWETH = payload.isWETH || false;
        this.canBorrow = payload.canBorrow || false;
        this.borrowRate =
            ethers_1.BigNumber.from(payload.borrowRate || 0)
                .mul(constants_1.PERCENTAGE_FACTOR)
                .mul(100)
                .div(constants_1.RAY)
                .toNumber() / constants_1.PERCENTAGE_FACTOR;
        this.minAmount = ethers_1.BigNumber.from(payload.minAmount || 0);
        this.maxAmount = ethers_1.BigNumber.from(payload.maxAmount || 0);
        this.maxLeverageFactor = ethers_1.BigNumber.from(payload.maxLeverageFactor || 0).toNumber();
        this.availableLiquidity = ethers_1.BigNumber.from(payload.availableLiquidity || 0);
        this.allowedTokens = payload.allowedTokens || [];
        (_a = payload.adapters) === null || _a === void 0 ? void 0 : _a.forEach(function (a) {
            _this.adapters[a.allowedContract] = a.adapter;
        });
    }
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
