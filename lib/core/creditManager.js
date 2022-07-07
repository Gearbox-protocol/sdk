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
var types_1 = require("../types");
var typesV2_1 = require("../typesV2");
var constants_1 = require("./constants");
var errors_1 = require("./errors");
var CreditManagerData = /** @class */ (function () {
    function CreditManagerData(payload) {
        this.id = payload.addr;
        this.address = payload.addr;
        this.underlyingToken = payload.underlying;
        this.isWETH = payload.isWETH;
        this.canBorrow = payload.canBorrow;
        this.borrowRate =
            payload.borrowRate.mul(constants_1.PERCENTAGE_FACTOR).mul(100).div(constants_1.RAY).toNumber() /
                constants_1.PERCENTAGE_FACTOR;
        this.minAmount = payload.minAmount;
        this.maxAmount = payload.maxAmount;
        this.maxLeverageFactor = payload.maxLeverageFactor.toNumber();
        this.availableLiquidity = payload.availableLiquidity;
        this.allowedTokens = payload.collateralTokens;
        this.adapters = payload.adapters.reduce(function (acc, _a) {
            var _b;
            var allowedContract = _a.allowedContract, adapter = _a.adapter;
            return (__assign(__assign({}, acc), (_b = {}, _b[allowedContract] = adapter, _b)));
        }, {});
        this.liquidationThresholds = payload.liquidationThresholds.reduce(function (acc, threshold, index) {
            var address = payload.collateralTokens[index];
            if (address)
                acc[address.toLowerCase()] = threshold;
            return acc;
        }, {});
        this.version = payload.version;
        this.creditFacade = payload.creditFacade;
        this.isDegenMode = payload.isDegenMode;
        this.degenNFT = payload.degenNFT;
        this.isIncreaseDebtForbidden = payload.isIncreaseDebtForbidden;
        this.forbiddenTokenMask = payload.forbiddenTokenMask;
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
    CreditManagerData.prototype.validateOpenAccount = function (totalAmount, leverage) {
        if (totalAmount.lt(this.minAmount))
            throw new errors_1.OpenAccountError("amountLessMin", this.minAmount);
        if (totalAmount.gt(this.maxAmount))
            throw new errors_1.OpenAccountError("amountGreaterMax", this.maxAmount);
        if (leverage > this.maxLeverageFactor)
            throw new errors_1.OpenAccountError("leverageGreaterMax", ethers_1.BigNumber.from(this.maxLeverageFactor));
        if (totalAmount
            .mul(leverage)
            .div(constants_1.LEVERAGE_DECIMALS)
            .gt(this.availableLiquidity))
            throw new errors_1.OpenAccountError("insufficientPoolLiquidity", ethers_1.BigNumber.from(this.availableLiquidity));
        return true;
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
