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
exports.CreditAccountDataExtended = exports.tokensAbcComparator = exports.sortBalances = exports.CreditAccountData = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("./constants");
var price_1 = require("./price");
var CreditAccountData = /** @class */ (function () {
    function CreditAccountData(payload) {
        var _this = this;
        this.allowedTokens = [];
        this.allTokens = [];
        this.balances = {};
        this.allBalances = {};
        this.version = 1;
        this.id = payload.creditManager;
        this.addr = payload.addr;
        this.borrower = payload.borrower;
        this.inUse = payload.inUse;
        this.creditManager = payload.creditManager;
        this.underlyingToken = payload.underlying;
        this.borrowedAmountPlusInterest = ethers_1.BigNumber.from(payload.borrowedAmountPlusInterest);
        this.totalValue = ethers_1.BigNumber.from(payload.totalValue);
        this.healthFactor =
            ethers_1.BigNumber.from(payload.healthFactor).toNumber() / constants_1.PERCENTAGE_FACTOR;
        this.borrowRate =
            ethers_1.BigNumber.from(payload.borrowRate)
                .mul(constants_1.PERCENTAGE_FACTOR)
                .mul(100)
                .div(constants_1.RAY)
                .toNumber() / constants_1.PERCENTAGE_FACTOR;
        (payload.balances || []).forEach(function (b) {
            if (b.isAllowed) {
                _this.balances[b.token] = ethers_1.BigNumber.from(b.balance);
                _this.allowedTokens.push(b.token);
            }
            _this.allBalances[b.token] = ethers_1.BigNumber.from(b.balance);
            _this.allTokens.push(b.token);
        });
        this.isDeleting = false;
    }
    CreditAccountData.prototype.balancesSorted = function (prices, tokens) {
        var safeBalances = this.balances || [];
        return sortBalances(safeBalances, prices, tokens).map(function (_a) {
            var address = _a[0], balance = _a[1];
            return ({ address: address, balance: balance });
        });
    };
    return CreditAccountData;
}());
exports.CreditAccountData = CreditAccountData;
function sortBalances(balances, prices, tokens) {
    return Object.entries(balances).sort(function (_a, _b) {
        var addr1 = _a[0], amount1 = _a[1];
        var addr2 = _b[0], amount2 = _b[1];
        var addr1Lc = addr1.toLowerCase();
        var addr2Lc = addr2.toLowerCase();
        var token1 = tokens[addr1Lc];
        var token2 = tokens[addr2Lc];
        var price1 = prices[addr1Lc] || 1;
        var price2 = prices[addr2Lc] || 1;
        var assetValue1 = (0, price_1.priceCalc)(price1, amount1, token1);
        var assetValue2 = (0, price_1.priceCalc)(price2, amount2, token2);
        return assetValue1.eq(assetValue2)
            ? tokensAbcComparator(token1, token2)
            : assetValue1.gt(assetValue2)
                ? -1
                : 1;
    });
}
exports.sortBalances = sortBalances;
function tokensAbcComparator(t1, t2) {
    var _a = (t1 || {}).symbol, symbol1 = _a === void 0 ? "" : _a;
    var _b = (t2 || {}).symbol, symbol2 = _b === void 0 ? "" : _b;
    return symbol1 > symbol2 ? 1 : -1;
}
exports.tokensAbcComparator = tokensAbcComparator;
var CreditAccountDataExtended = /** @class */ (function (_super) {
    __extends(CreditAccountDataExtended, _super);
    function CreditAccountDataExtended(payload) {
        var _this = _super.call(this, payload) || this;
        _this.borrowedAmount = ethers_1.BigNumber.from(payload.borrowedAmount);
        _this.cumulativeIndexAtOpen = ethers_1.BigNumber.from(payload.cumulativeIndexAtOpen);
        _this.repayAmount = ethers_1.BigNumber.from(payload.repayAmount);
        _this.liquidationAmount = ethers_1.BigNumber.from(payload.liquidationAmount);
        _this.canBeClosed = payload.canBeClosed || false;
        _this.since = ethers_1.BigNumber.from(payload.since).toNumber();
        return _this;
    }
    return CreditAccountDataExtended;
}(CreditAccountData));
exports.CreditAccountDataExtended = CreditAccountDataExtended;
