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
exports.CreditAccountDataExtended = exports.CreditAccountData = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("./constants");
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
        this.underlyingToken = payload.underlyingToken;
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
        var priceCalc = function (addr, amount) {
            var _a;
            return amount
                .mul(Math.floor(1000 * prices[addr.toLowerCase() || ""] || 0))
                .div(ethers_1.BigNumber.from(10).pow(((_a = tokens[addr]) === null || _a === void 0 ? void 0 : _a.decimals) || 18));
        };
        var tokensAbcComparator = function (t1, t2) {
            return ((t1 === null || t1 === void 0 ? void 0 : t1.symbol) || "") > ((t2 === null || t2 === void 0 ? void 0 : t2.symbol) || "") ? 1 : -1;
        };
        return tokens
            ? Object.entries(this.balances || [])
                .sort(function (_a, _b) {
                var addr1 = _a[0], amount1 = _a[1];
                var addr2 = _b[0], amount2 = _b[1];
                return priceCalc(addr1, amount1).eq(priceCalc(addr2, amount2))
                    ? tokensAbcComparator(tokens[addr1], tokens[addr2])
                    : priceCalc(addr1, amount1).gt(priceCalc(addr2, amount2))
                        ? -1
                        : 1;
            })
                .map(function (_a) {
                var address = _a[0], balance = _a[1];
                return ({ address: address, balance: balance });
            })
            : [];
    };
    return CreditAccountData;
}());
exports.CreditAccountData = CreditAccountData;
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
