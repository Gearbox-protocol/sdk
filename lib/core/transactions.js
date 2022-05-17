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
exports.TxApprove = exports.TxCloseAccount = exports.TxRepayAccount = exports.TxOpenAccount = exports.TxIncreaseBorrowAmount = exports.TxAddCollateral = exports.TXSwap = exports.TxRemoveLiquidity = exports.TxAddLiquidity = exports.TxSerializer = void 0;
var ethers_1 = require("ethers");
var formatter_1 = require("../utils/formatter");
var eventOrTx_1 = require("./eventOrTx");
var contractsRegister_1 = require("./contractsRegister");
var constants_1 = require("./constants");
var TxSerializer = /** @class */ (function () {
    function TxSerializer() {
    }
    TxSerializer.serialize = function (items) {
        return JSON.stringify(items.map(function (i) { return i.serialize(); }));
    };
    TxSerializer.deserialize = function (data) {
        return JSON.parse(data).map(function (e) {
            var params = JSON.parse(e.content);
            switch (e.type) {
                case "TxAddLiquidity":
                    return new TxAddLiquidity(params);
                case "TxRemoveLiquidity":
                    return new TxRemoveLiquidity(params);
                case "TxSwap":
                    return new TXSwap(params);
                case "TxAddCollateral":
                    return new TxAddCollateral(params);
                case "TxIncreaseBorrowAmount":
                    return new TxIncreaseBorrowAmount(params);
                case "TxOpenAccount":
                    return new TxOpenAccount(params);
                case "TxRepayAccount":
                    return new TxRepayAccount(params);
                case "TxCloseAccount":
                    return new TxCloseAccount(params);
                case "TxApprove":
                    return new TxApprove(params);
                default:
                    throw new Error("Unknown transaction for parsing");
            }
        });
    };
    return TxSerializer;
}());
exports.TxSerializer = TxSerializer;
var TxAddLiquidity = /** @class */ (function (_super) {
    __extends(TxAddLiquidity, _super);
    function TxAddLiquidity(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = opts.amount;
        _this.underlyingToken = opts.underlyingToken;
        _this.pool = opts.pool;
        return _this;
    }
    TxAddLiquidity.prototype.toString = function (tokenData) {
        var token = tokenData[this.underlyingToken.toLowerCase()];
        return "".concat((0, contractsRegister_1.getContractName)(this.pool), ": Deposit ").concat((0, formatter_1.formatBN)(this.amount, (token === null || token === void 0 ? void 0 : token.decimals) || 18), " ").concat((token === null || token === void 0 ? void 0 : token.symbol) || "");
    };
    TxAddLiquidity.prototype.serialize = function () {
        return {
            type: "TxAddLiquidity",
            content: JSON.stringify(this)
        };
    };
    return TxAddLiquidity;
}(eventOrTx_1.EVMTx));
exports.TxAddLiquidity = TxAddLiquidity;
var TxRemoveLiquidity = /** @class */ (function (_super) {
    __extends(TxRemoveLiquidity, _super);
    function TxRemoveLiquidity(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = opts.amount;
        _this.dieselToken = opts.dieselToken;
        _this.pool = opts.pool;
        return _this;
    }
    TxRemoveLiquidity.prototype.toString = function (tokenData) {
        var dtoken = tokenData[this.dieselToken.toLowerCase()];
        return "".concat((0, contractsRegister_1.getContractName)(this.pool), ": Withdraw ").concat((0, formatter_1.formatBN)(this.amount, (dtoken === null || dtoken === void 0 ? void 0 : dtoken.decimals) || 18), " ").concat((dtoken === null || dtoken === void 0 ? void 0 : dtoken.symbol) || "");
    };
    TxRemoveLiquidity.prototype.serialize = function () {
        return {
            type: "TxRemoveLiquidity",
            content: JSON.stringify(this)
        };
    };
    return TxRemoveLiquidity;
}(eventOrTx_1.EVMTx));
exports.TxRemoveLiquidity = TxRemoveLiquidity;
var TXSwap = /** @class */ (function (_super) {
    __extends(TXSwap, _super);
    function TXSwap(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.protocol = opts.protocol;
        _this.operation = opts.operation;
        _this.amountFrom = opts.amountFrom;
        _this.amountTo = opts.amountTo;
        _this.tokenFrom = opts.tokenFrom;
        _this.tokenTo = opts.tokenTo;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    TXSwap.prototype.toString = function (tokenData) {
        var tokenFrom = tokenData[this.tokenFrom.toLowerCase()];
        var toPart = "";
        if (this.tokenTo && this.amountTo) {
            var tokenTo = tokenData[this.tokenTo];
            toPart = " \u21D2  ".concat((0, formatter_1.formatBN)(this.amountTo, (tokenTo === null || tokenTo === void 0 ? void 0 : tokenTo.decimals) || 18), " ").concat((tokenTo === null || tokenTo === void 0 ? void 0 : tokenTo.symbol) || "");
        }
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": ").concat(this.operation, " ").concat((0, formatter_1.formatBN)(this.amountFrom, (tokenFrom === null || tokenFrom === void 0 ? void 0 : tokenFrom.decimals) || 18), " ").concat((tokenFrom === null || tokenFrom === void 0 ? void 0 : tokenFrom.symbol) || "", " ").concat(toPart, " on ").concat((0, contractsRegister_1.getContractName)(this.protocol));
    };
    TXSwap.prototype.serialize = function () {
        return {
            type: "TxSwap",
            content: JSON.stringify(this)
        };
    };
    return TXSwap;
}(eventOrTx_1.EVMTx));
exports.TXSwap = TXSwap;
var TxAddCollateral = /** @class */ (function (_super) {
    __extends(TxAddCollateral, _super);
    function TxAddCollateral(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = opts.amount;
        _this.addedToken = opts.addedToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    TxAddCollateral.prototype.toString = function (tokenData) {
        var addedToken = tokenData[this.addedToken.toLowerCase()];
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": Added ").concat((0, formatter_1.formatBN)(this.amount, addedToken.decimals), " ").concat(addedToken.symbol, " as collateral");
    };
    TxAddCollateral.prototype.serialize = function () {
        return {
            type: "TxAddCollateral",
            content: JSON.stringify(this)
        };
    };
    return TxAddCollateral;
}(eventOrTx_1.EVMTx));
exports.TxAddCollateral = TxAddCollateral;
var TxIncreaseBorrowAmount = /** @class */ (function (_super) {
    __extends(TxIncreaseBorrowAmount, _super);
    function TxIncreaseBorrowAmount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = opts.amount;
        _this.underlyingToken = opts.underlyingToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    TxIncreaseBorrowAmount.prototype.toString = function (tokenData) {
        var token = tokenData[this.underlyingToken.toLowerCase()];
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": Borrowed amount was increased for ").concat((0, formatter_1.formatBN)(this.amount, (token === null || token === void 0 ? void 0 : token.decimals) || 18), " ").concat(token === null || token === void 0 ? void 0 : token.symbol);
    };
    TxIncreaseBorrowAmount.prototype.serialize = function () {
        return {
            type: "TxIncreaseBorrowAmount",
            content: JSON.stringify(this)
        };
    };
    return TxIncreaseBorrowAmount;
}(eventOrTx_1.EVMTx));
exports.TxIncreaseBorrowAmount = TxIncreaseBorrowAmount;
var TxOpenAccount = /** @class */ (function (_super) {
    __extends(TxOpenAccount, _super);
    function TxOpenAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.leverage = opts.leverage;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    TxOpenAccount.prototype.toString = function (tokenData) {
        var token = tokenData[this.underlyingToken.toLowerCase()];
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": opening ").concat((0, formatter_1.formatBN)(this.amount, (token === null || token === void 0 ? void 0 : token.decimals) || 18), " ").concat(token === null || token === void 0 ? void 0 : token.symbol, " x ").concat(this.leverage.toFixed(2), " \u21D2 \n    ").concat((0, formatter_1.formatBN)(this.amount
            .mul(Math.floor(this.leverage * constants_1.LEVERAGE_DECIMALS))
            .div(constants_1.LEVERAGE_DECIMALS), (token === null || token === void 0 ? void 0 : token.decimals) || 18), " ").concat(token === null || token === void 0 ? void 0 : token.symbol);
    };
    TxOpenAccount.prototype.serialize = function () {
        return {
            type: "TxOpenAccount",
            content: JSON.stringify(this)
        };
    };
    return TxOpenAccount;
}(eventOrTx_1.EVMTx));
exports.TxOpenAccount = TxOpenAccount;
var TxRepayAccount = /** @class */ (function (_super) {
    __extends(TxRepayAccount, _super);
    function TxRepayAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    TxRepayAccount.prototype.toString = function (_) {
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": Repaying account");
    };
    TxRepayAccount.prototype.serialize = function () {
        return {
            type: "TxRepayAccount",
            content: JSON.stringify(this)
        };
    };
    return TxRepayAccount;
}(eventOrTx_1.EVMTx));
exports.TxRepayAccount = TxRepayAccount;
var TxCloseAccount = /** @class */ (function (_super) {
    __extends(TxCloseAccount, _super);
    function TxCloseAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    TxCloseAccount.prototype.toString = function (_) {
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": Closing account");
    };
    TxCloseAccount.prototype.serialize = function () {
        return {
            type: "TxCloseAccount",
            content: JSON.stringify(this)
        };
    };
    return TxCloseAccount;
}(eventOrTx_1.EVMTx));
exports.TxCloseAccount = TxCloseAccount;
var TxApprove = /** @class */ (function (_super) {
    __extends(TxApprove, _super);
    function TxApprove(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            txStatus: opts.txStatus,
            timestamp: opts.timestamp
        }) || this;
        _this.token = opts.token;
        return _this;
    }
    TxApprove.prototype.toString = function (tokenData) {
        var token = tokenData[this.token.toLowerCase()];
        return "Approve ".concat(token === null || token === void 0 ? void 0 : token.symbol);
    };
    TxApprove.prototype.serialize = function () {
        return {
            type: "TxApprove",
            content: JSON.stringify(this)
        };
    };
    return TxApprove;
}(eventOrTx_1.EVMTx));
exports.TxApprove = TxApprove;
