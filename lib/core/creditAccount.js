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
exports.CreditAccountDataExtended = exports.amountAbcComparator = exports.tokensAbcComparator = exports.sortBalances = exports.CreditAccountData = void 0;
var ethers_1 = require("ethers");
var price_1 = require("../utils/price");
var constants_1 = require("./constants");
var CreditAccountData = /** @class */ (function () {
    function CreditAccountData(payload) {
        var _this = this;
        this.allowedTokens = [];
        this.allTokens = [];
        this.balances = {};
        this.allBalances = {};
        this.version = 1;
        this.id = payload.creditManager.toLowerCase();
        this.addr = payload.addr.toLowerCase();
        this.borrower = payload.borrower.toLowerCase();
        this.inUse = payload.inUse;
        this.creditManager = payload.creditManager.toLowerCase();
        this.underlyingToken = payload.underlying.toLowerCase();
        this.borrowedAmountPlusInterest = ethers_1.BigNumber.from(payload.borrowedAmountPlusInterest);
        this.totalValue = ethers_1.BigNumber.from(payload.totalValue);
        this.healthFactor =
            ethers_1.BigNumber.from(payload.healthFactor).toNumber() / constants_1.PERCENTAGE_FACTOR;
        this.borrowRate =
            ethers_1.BigNumber.from(payload.borrowRate)
                .mul(constants_1.PERCENTAGE_FACTOR)
                .mul(constants_1.PERCENTAGE_DECIMALS)
                .div(constants_1.RAY)
                .toNumber() / constants_1.PERCENTAGE_FACTOR;
        (payload.balances || []).forEach(function (b) {
            var tokenLC = b.token.toLowerCase();
            if (b.isAllowed) {
                _this.balances[tokenLC] = ethers_1.BigNumber.from(b.balance);
                _this.allowedTokens.push(tokenLC);
            }
            _this.allBalances[tokenLC] = ethers_1.BigNumber.from(b.balance);
            _this.allTokens.push(tokenLC);
        });
        this.isDeleting = false;
    }
    CreditAccountData.prototype.balancesSorted = function (prices, tokens) {
        return sortBalances(this.balances, prices, tokens).map(function (_a) {
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
        var price1 = prices[addr1Lc] || constants_1.PRICE_DECIMALS;
        var price2 = prices[addr2Lc] || constants_1.PRICE_DECIMALS;
        var totalPrice1 = (0, price_1.calcTotalPrice)(price1, amount1, token1 === null || token1 === void 0 ? void 0 : token1.decimals);
        var totalPrice2 = (0, price_1.calcTotalPrice)(price2, amount2, token2 === null || token2 === void 0 ? void 0 : token2.decimals);
        if (totalPrice1.eq(totalPrice2)) {
            return amount1.eq(amount2)
                ? tokensAbcComparator(token1, token2)
                : amountAbcComparator(amount1, amount2);
        }
        if (totalPrice1.gt(totalPrice2)) {
            return -1;
        }
        return 1;
    });
}
exports.sortBalances = sortBalances;
function tokensAbcComparator(t1, t2) {
    var _a = (t1 || {}).symbol, symbol1 = _a === void 0 ? "" : _a;
    var _b = (t2 || {}).symbol, symbol2 = _b === void 0 ? "" : _b;
    return symbol1 > symbol2 ? 1 : -1;
}
exports.tokensAbcComparator = tokensAbcComparator;
function amountAbcComparator(t1, t2) {
    return (t1 === null || t1 === void 0 ? void 0 : t1.gt(t2)) ? -1 : 1;
}
exports.amountAbcComparator = amountAbcComparator;
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
