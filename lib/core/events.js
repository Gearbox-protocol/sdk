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
exports.EventTransferOwnership = exports.EventUnPausableAdminRemoved = exports.EventUnPausableAdminAdded = exports.EventPausableAdminRemoved = exports.EventPausableAdminAdded = exports.EventUnPaused = exports.EventPaused = exports.EventTakeForever = exports.EventNewPriceFeed = exports.EventNewWithdrawFee = exports.EventNewExpectedLiquidityLimit = exports.EventBorrowForbidden = exports.EventNewCreditManagerConnected = exports.EventNewInterestRateModel = exports.EventTransferPluginAllowed = exports.EventPriceOracleUpdated = exports.EventNewFastCheckParameters = exports.EventContractForbidden = exports.EventContractAllowed = exports.EventTokenForbidden = exports.EventTokenAllowed = exports.EventCMNewParameters = exports.EventIncreaseBorrowAmount = exports.EventAddCollateral = exports.EventRepayCreditAccount = exports.EventLiquidateCreditAccount = exports.EventCloseCreditAccount = exports.EventOpenCreditAccount = exports.EventRemoveLiquidity = exports.EventAddLiquidity = exports.EventParser = void 0;
var ethers_1 = require("ethers");
var formatter_1 = require("../utils/formatter");
var constants_1 = require("./constants");
var eventOrTx_1 = require("./eventOrTx");
var contractsRegister_1 = require("../contracts/contractsRegister");
var EventParser = /** @class */ (function () {
    function EventParser() {
    }
    EventParser.serialize = function (items) {
        return JSON.stringify(items.map(function (i) { return i.serialize(); }));
    };
    EventParser.deserialize = function (data) {
        var params = data.content;
        switch (data.type) {
            case "EventAddLiquidity":
                return new EventAddLiquidity(params);
            case "EventRemoveLiquidity":
                return new EventRemoveLiquidity(params);
            case "EventOpenCreditAccount":
                return new EventOpenCreditAccount(params);
            case "EventCloseCreditAccount":
                return new EventCloseCreditAccount(params);
            case "EventLiquidateCreditAccount":
                return new EventLiquidateCreditAccount(params);
            case "EventRepayCreditAccount":
                return new EventRepayCreditAccount(params);
            case "EventAddCollateral":
                return new EventAddCollateral(params);
            case "EventIncreaseBorrowAmount":
                return new EventIncreaseBorrowAmount(params);
            case "EventCMNewParameters":
                return new EventCMNewParameters(params);
            case "EventTokenAllowed":
                return new EventTokenAllowed(params);
            case "EventTokenForbidden":
                return new EventTokenForbidden(params);
            case "EventContractAllowed":
                return new EventContractAllowed(params);
            case "EventContractForbidden":
                return new EventContractForbidden(params);
            case "EventNewFastCheckParameters":
                return new EventNewFastCheckParameters(params);
            case "EventPriceOracleUpdated":
                return new EventPriceOracleUpdated(params);
            case "EventTransferPluginAllowed":
                return new EventTransferPluginAllowed(params);
            case "EventNewInterestRateModel":
                return new EventNewInterestRateModel(params);
            case "EventNewCreditManagerConnected":
                return new EventNewCreditManagerConnected(params);
            case "EventBorrowForbidden":
                return new EventBorrowForbidden(params);
            case "EventNewExpectedLiquidityLimit":
                return new EventNewExpectedLiquidityLimit(params);
            case "EventNewWithdrawFee":
                return new EventNewWithdrawFee(params);
            case "EventNewPriceFeed":
                return new EventNewPriceFeed(params);
            case "EventTakeForever":
                return new EventTakeForever(params);
            case "EventPaused":
                return new EventPaused(params);
            case "EventUnPaused":
                return new EventUnPaused(params);
            case "EventPausableAdminAdded":
                return new EventPausableAdminAdded(params);
            case "EventPausableAdminRemoved":
                return new EventPausableAdminRemoved(params);
            case "EventUnpausableAdminAdded":
                return new EventUnPausableAdminAdded(params);
            case "EventUnpausableAdminRemoved":
                return new EventUnPausableAdminRemoved(params);
            case "EventOwnershipTransferred":
                return new EventTransferOwnership(params);
            default:
                throw new Error("Unknown transaction for parsing");
        }
    };
    EventParser.deserializeArray = function (data) {
        return data.map(function (e) {
            return EventParser.deserialize(e);
        });
    };
    return EventParser;
}());
exports.EventParser = EventParser;
var EventAddLiquidity = /** @class */ (function (_super) {
    __extends(EventAddLiquidity, _super);
    function EventAddLiquidity(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.pool = opts.pool;
        return _this;
    }
    EventAddLiquidity.prototype.toString = function (tokenData) {
        var _a = tokenData[this.underlyingToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), ": Deposit ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol);
    };
    return EventAddLiquidity;
}(eventOrTx_1.EVMEvent));
exports.EventAddLiquidity = EventAddLiquidity;
var EventRemoveLiquidity = /** @class */ (function (_super) {
    __extends(EventRemoveLiquidity, _super);
    function EventRemoveLiquidity(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.dieselToken = opts.dieselToken;
        _this.pool = opts.pool;
        return _this;
    }
    EventRemoveLiquidity.prototype.toString = function (tokenData) {
        var _a = tokenData[this.dieselToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), ": withdraw ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol);
    };
    return EventRemoveLiquidity;
}(eventOrTx_1.EVMEvent));
exports.EventRemoveLiquidity = EventRemoveLiquidity;
var EventOpenCreditAccount = /** @class */ (function (_super) {
    __extends(EventOpenCreditAccount, _super);
    function EventOpenCreditAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.leverage = opts.leverage;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventOpenCreditAccount.prototype.toString = function (tokenData) {
        var _a = tokenData[this.underlyingToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": open ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol, " x ").concat(this.leverage.toFixed(2), " \u21D2 \n    ").concat((0, formatter_1.formatBN)(this.amount
            .mul(Math.floor(this.leverage + constants_1.LEVERAGE_DECIMALS))
            .div(constants_1.LEVERAGE_DECIMALS), decimals + 2), " ").concat(symbol);
    };
    return EventOpenCreditAccount;
}(eventOrTx_1.EVMEvent));
exports.EventOpenCreditAccount = EventOpenCreditAccount;
var EventCloseCreditAccount = /** @class */ (function (_super) {
    __extends(EventCloseCreditAccount, _super);
    function EventCloseCreditAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventCloseCreditAccount.prototype.toString = function (tokenData) {
        var _a = tokenData[this.underlyingToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": was closed and got ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol, " as remaining funds");
    };
    return EventCloseCreditAccount;
}(eventOrTx_1.EVMEvent));
exports.EventCloseCreditAccount = EventCloseCreditAccount;
var EventLiquidateCreditAccount = /** @class */ (function (_super) {
    __extends(EventLiquidateCreditAccount, _super);
    function EventLiquidateCreditAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventLiquidateCreditAccount.prototype.toString = function (tokenData) {
        var _a = tokenData[this.underlyingToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": was liquidated. ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol, " were paid back as remaining funds");
    };
    return EventLiquidateCreditAccount;
}(eventOrTx_1.EVMEvent));
exports.EventLiquidateCreditAccount = EventLiquidateCreditAccount;
var EventRepayCreditAccount = /** @class */ (function (_super) {
    __extends(EventRepayCreditAccount, _super);
    function EventRepayCreditAccount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.underlyingToken = opts.underlyingToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventRepayCreditAccount.prototype.toString = function (_) {
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": was repaid");
    };
    return EventRepayCreditAccount;
}(eventOrTx_1.EVMEvent));
exports.EventRepayCreditAccount = EventRepayCreditAccount;
var EventAddCollateral = /** @class */ (function (_super) {
    __extends(EventAddCollateral, _super);
    function EventAddCollateral(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.addedToken = opts.addedToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventAddCollateral.prototype.toString = function (tokenData) {
        var _a = tokenData[this.addedToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": added ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol, " as collateral");
    };
    return EventAddCollateral;
}(eventOrTx_1.EVMEvent));
exports.EventAddCollateral = EventAddCollateral;
var EventIncreaseBorrowAmount = /** @class */ (function (_super) {
    __extends(EventIncreaseBorrowAmount, _super);
    function EventIncreaseBorrowAmount(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.amount = ethers_1.BigNumber.from(opts.amount);
        _this.underlyingToken = opts.underlyingToken;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventIncreaseBorrowAmount.prototype.toString = function (tokenData) {
        var _a = tokenData[this.underlyingToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return "Credit account ".concat((0, contractsRegister_1.getContractName)(this.creditManager), ": borrowed amount was increased for ").concat((0, formatter_1.formatBN)(this.amount, decimals), " ").concat(symbol);
    };
    return EventIncreaseBorrowAmount;
}(eventOrTx_1.EVMEvent));
exports.EventIncreaseBorrowAmount = EventIncreaseBorrowAmount;
var EventCMNewParameters = /** @class */ (function (_super) {
    __extends(EventCMNewParameters, _super);
    function EventCMNewParameters(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.underlyingToken = opts.underlyingToken;
        _this.minAmount = ethers_1.BigNumber.from(opts.minAmount);
        _this.maxAmount = ethers_1.BigNumber.from(opts.maxAmount);
        _this.maxLeverage = opts.maxLeverage;
        _this.feeInterest = opts.feeInterest;
        _this.feeLiquidation = opts.feeLiquidation;
        _this.liquidationDiscount = opts.liquidationDiscount;
        _this.prevMinAmount = ethers_1.BigNumber.from(opts.prevMinAmount);
        _this.prevMaxAmount = ethers_1.BigNumber.from(opts.prevMaxAmount);
        _this.prevMaxLeverage = opts.prevMaxLeverage;
        _this.prevFeeInterest = opts.prevFeeInterest;
        _this.prevFeeLiquidation = opts.prevFeeLiquidation;
        _this.prevLiquidationDiscount = opts.prevLiquidationDiscount;
        return _this;
    }
    EventCMNewParameters.prototype.toString = function (tokenData) {
        var token = tokenData[this.underlyingToken.toLowerCase()];
        var msg = "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated: ");
        if (this.minAmount !== this.prevMinAmount) {
            msg += "min amount: ".concat((0, formatter_1.formatBN)(this.prevMinAmount, token.decimals), " => ").concat((0, formatter_1.formatBN)(this.minAmount, token.decimals), " ").concat(token.symbol, ", ");
        }
        if (this.maxAmount !== this.prevMaxAmount) {
            msg += "max amount: ".concat((0, formatter_1.formatBN)(this.prevMaxAmount, token.decimals), " => ").concat((0, formatter_1.formatBN)(this.maxAmount, token.decimals), " ").concat(token.symbol, ", ");
        }
        if (this.maxLeverage !== this.prevMaxLeverage) {
            msg += "max leverage: ".concat(this.prevMaxLeverage / 100 + 1, " => ").concat(this.maxLeverage / 100 + 1, ", ");
        }
        if (this.feeInterest !== this.prevFeeInterest) {
            msg += "interest fee: ".concat(this.prevFeeInterest / 100, "% => ").concat(this.feeInterest / 100, "%, ");
        }
        if (this.feeLiquidation !== this.prevFeeLiquidation) {
            msg += "liquidation fee: ".concat(this.prevFeeLiquidation / 100, "% => ").concat(this.feeLiquidation / 100, "%, ");
        }
        if (this.liquidationDiscount !== this.prevLiquidationDiscount) {
            msg += "liquidation premium: ".concat(100 - this.prevLiquidationDiscount / 100, "% => ").concat(100 - this.liquidationDiscount / 100, "%, ");
        }
        return msg.slice(0, msg.length - 2);
    };
    return EventCMNewParameters;
}(eventOrTx_1.EVMEvent));
exports.EventCMNewParameters = EventCMNewParameters;
var EventTokenAllowed = /** @class */ (function (_super) {
    __extends(EventTokenAllowed, _super);
    function EventTokenAllowed(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.token = opts.token;
        _this.liquidityThreshold = opts.liquidityThreshold;
        _this.prevLiquidationThreshold = opts.prevLiquidationThreshold;
        _this.status = opts.status;
        return _this;
    }
    EventTokenAllowed.prototype.toString = function (tokenData) {
        var token = tokenData[this.token.toLowerCase()];
        var msg = "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated ");
        switch (this.status) {
            case "NewToken":
                return "".concat(msg, ": New token allowed: ").concat(token.symbol, ", liquidation threshold: ").concat(this.liquidityThreshold / 100, "%");
            case "Allowed":
                return "".concat(msg, ": ").concat(token.symbol, " is allowed now, liquidation threshold: ").concat(this.liquidityThreshold / 100, "%");
            case "LTUpdated":
                return "".concat(msg, ": ").concat(token.symbol, " liquidation threshold: ").concat((this.prevLiquidationThreshold || 0) / 100, " => ").concat(this.liquidityThreshold / 100, "%");
        }
    };
    return EventTokenAllowed;
}(eventOrTx_1.EVMEvent));
exports.EventTokenAllowed = EventTokenAllowed;
var EventTokenForbidden = /** @class */ (function (_super) {
    __extends(EventTokenForbidden, _super);
    function EventTokenForbidden(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.token = opts.token;
        return _this;
    }
    EventTokenForbidden.prototype.toString = function (tokenData) {
        var token = tokenData[this.token.toLowerCase()];
        return "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated ").concat(token.symbol, " forbidden");
    };
    return EventTokenForbidden;
}(eventOrTx_1.EVMEvent));
exports.EventTokenForbidden = EventTokenForbidden;
var EventContractAllowed = /** @class */ (function (_super) {
    __extends(EventContractAllowed, _super);
    function EventContractAllowed(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.protocol = opts.protocol;
        _this.adapter = opts.adapter;
        _this.status = opts.status;
        return _this;
    }
    EventContractAllowed.prototype.toString = function (_) {
        var msg = "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated");
        switch (this.status) {
            case "Connected":
                return "".concat(msg, " : ").concat((0, contractsRegister_1.getContractName)(this.protocol), " was connected. Adapter at: ").concat(this.adapter);
            case "AdapterUpdate":
                return "".concat(msg, " : ").concat((0, contractsRegister_1.getContractName)(this.protocol), " adapter was updated. New adapter:  ").concat(this.adapter);
        }
    };
    return EventContractAllowed;
}(eventOrTx_1.EVMEvent));
exports.EventContractAllowed = EventContractAllowed;
var EventContractForbidden = /** @class */ (function (_super) {
    __extends(EventContractForbidden, _super);
    function EventContractForbidden(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.protocol = opts.protocol;
        return _this;
    }
    EventContractForbidden.prototype.toString = function (_) {
        return "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated: ").concat((0, contractsRegister_1.getContractName)(this.protocol));
    };
    return EventContractForbidden;
}(eventOrTx_1.EVMEvent));
exports.EventContractForbidden = EventContractForbidden;
var EventNewFastCheckParameters = /** @class */ (function (_super) {
    __extends(EventNewFastCheckParameters, _super);
    function EventNewFastCheckParameters(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.chiThreshold = opts.chiThreshold;
        _this.fastCheckDelay = opts.fastCheckDelay;
        _this.prevChiThreshold = opts.prevChiThreshold;
        _this.prevFastCheckDelay = opts.prevFastCheckDelay;
        return _this;
    }
    EventNewFastCheckParameters.prototype.toString = function (_) {
        var msg = "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated: ");
        if (this.chiThreshold !== this.prevChiThreshold) {
            msg += "Chi threshold: ".concat(this.prevChiThreshold, " => ").concat(this.chiThreshold, ", ");
        }
        if (this.fastCheckDelay !== this.prevFastCheckDelay) {
            msg += "fast check delay: ".concat(this.prevFastCheckDelay, " => ").concat(this.fastCheckDelay, ", ");
        }
        return msg.slice(0, msg.length - 2);
    };
    return EventNewFastCheckParameters;
}(eventOrTx_1.EVMEvent));
exports.EventNewFastCheckParameters = EventNewFastCheckParameters;
var EventPriceOracleUpdated = /** @class */ (function (_super) {
    __extends(EventPriceOracleUpdated, _super);
    function EventPriceOracleUpdated(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.priceOracle = opts.priceOracle;
        return _this;
    }
    EventPriceOracleUpdated.prototype.toString = function (_) {
        return "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated: price oracle was updated. New price oracle ").concat((0, contractsRegister_1.getContractName)(this.priceOracle));
    };
    return EventPriceOracleUpdated;
}(eventOrTx_1.EVMEvent));
exports.EventPriceOracleUpdated = EventPriceOracleUpdated;
var EventTransferPluginAllowed = /** @class */ (function (_super) {
    __extends(EventTransferPluginAllowed, _super);
    function EventTransferPluginAllowed(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditManager = opts.creditManager;
        _this.plugin = opts.priceOracle;
        _this.state = opts.state;
        return _this;
    }
    EventTransferPluginAllowed.prototype.toString = function (_) {
        return "Credit manager ".concat((0, contractsRegister_1.getContractName)(this.creditManager), " updated: transfer plugin  ").concat((0, contractsRegister_1.getContractName)(this.plugin), " was ").concat(this.state ? "allowed" : "forbidden");
    };
    return EventTransferPluginAllowed;
}(eventOrTx_1.EVMEvent));
exports.EventTransferPluginAllowed = EventTransferPluginAllowed;
var EventNewInterestRateModel = /** @class */ (function (_super) {
    __extends(EventNewInterestRateModel, _super);
    function EventNewInterestRateModel(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.pool = opts.pool;
        _this.newInterestRateModel = opts.newInterestRateModel;
        return _this;
    }
    EventNewInterestRateModel.prototype.toString = function (_) {
        return "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: interest rate model was updated. New model: ").concat((0, contractsRegister_1.getContractName)(this.newInterestRateModel));
    };
    return EventNewInterestRateModel;
}(eventOrTx_1.EVMEvent));
exports.EventNewInterestRateModel = EventNewInterestRateModel;
var EventNewCreditManagerConnected = /** @class */ (function (_super) {
    __extends(EventNewCreditManagerConnected, _super);
    function EventNewCreditManagerConnected(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.pool = opts.pool;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventNewCreditManagerConnected.prototype.toString = function (_) {
        return "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: new credit manager ").concat((0, contractsRegister_1.getContractName)(this.creditManager), " was connected");
    };
    return EventNewCreditManagerConnected;
}(eventOrTx_1.EVMEvent));
exports.EventNewCreditManagerConnected = EventNewCreditManagerConnected;
var EventBorrowForbidden = /** @class */ (function (_super) {
    __extends(EventBorrowForbidden, _super);
    function EventBorrowForbidden(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.pool = opts.pool;
        _this.creditManager = opts.creditManager;
        return _this;
    }
    EventBorrowForbidden.prototype.toString = function (_) {
        return "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: credit manager ").concat((0, contractsRegister_1.getContractName)(this.creditManager), " was forbidden to borrow");
    };
    return EventBorrowForbidden;
}(eventOrTx_1.EVMEvent));
exports.EventBorrowForbidden = EventBorrowForbidden;
var EventNewExpectedLiquidityLimit = /** @class */ (function (_super) {
    __extends(EventNewExpectedLiquidityLimit, _super);
    function EventNewExpectedLiquidityLimit(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.pool = opts.pool;
        _this.underlyingToken = opts.underlyingToken;
        _this.newLimit = ethers_1.BigNumber.from(opts.newLimit);
        _this.prevLimit = ethers_1.BigNumber.from(opts.oldLimit);
        return _this;
    }
    EventNewExpectedLiquidityLimit.prototype.toString = function (tokenData) {
        var _a = tokenData[this.underlyingToken.toLowerCase()] || {}, _b = _a.decimals, decimals = _b === void 0 ? 18 : _b, symbol = _a.symbol;
        return this.prevLimit.isZero()
            ? "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: expected liquidity limit was set to ").concat((0, formatter_1.formatBN)(this.newLimit, decimals), " ").concat(symbol)
            : "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: expected liquidity limit was ").concat(this.newLimit.gt(this.prevLimit) ? "increased" : "decreased", ": ").concat((0, formatter_1.formatBN)(this.prevLimit, decimals), " ").concat(symbol, " => ").concat((0, formatter_1.formatBN)(this.newLimit, decimals), " ").concat(symbol);
    };
    return EventNewExpectedLiquidityLimit;
}(eventOrTx_1.EVMEvent));
exports.EventNewExpectedLiquidityLimit = EventNewExpectedLiquidityLimit;
var EventNewWithdrawFee = /** @class */ (function (_super) {
    __extends(EventNewWithdrawFee, _super);
    function EventNewWithdrawFee(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.pool = opts.pool;
        _this.underlyingToken = opts.underlyingToken;
        _this.newFee = Number(opts.newFee);
        _this.prevFee = Number(opts.oldFee);
        return _this;
    }
    EventNewWithdrawFee.prototype.toString = function (_) {
        return this.prevFee === 0
            ? "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: withdraw fee was set to: ").concat(this.newFee / 100, "%")
            : "Pool ".concat((0, contractsRegister_1.getContractName)(this.pool), " updated: withdraw fee was ").concat(this.newFee > this.prevFee ? "increased" : "decreased", ": ").concat(this.prevFee / 100, "% => ").concat(this.newFee / 100, "%");
    };
    return EventNewWithdrawFee;
}(eventOrTx_1.EVMEvent));
exports.EventNewWithdrawFee = EventNewWithdrawFee;
var EventNewPriceFeed = /** @class */ (function (_super) {
    __extends(EventNewPriceFeed, _super);
    function EventNewPriceFeed(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.token = opts.token;
        _this.priceFeed = opts.priceFeed;
        return _this;
    }
    EventNewPriceFeed.prototype.toString = function (tokenData) {
        var symbol = (tokenData[this.token.toLowerCase()] || {}).symbol;
        return "PriceOracle: oracle for ".concat(symbol, " was updated to ").concat((0, contractsRegister_1.getContractName)(this.priceFeed));
    };
    return EventNewPriceFeed;
}(eventOrTx_1.EVMEvent));
exports.EventNewPriceFeed = EventNewPriceFeed;
var EventTakeForever = /** @class */ (function (_super) {
    __extends(EventTakeForever, _super);
    function EventTakeForever(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.creditAccount = opts.creditAccount;
        _this.to = opts.to;
        return _this;
    }
    EventTakeForever.prototype.toString = function (_) {
        return "AccountFactory: account ".concat(this.creditAccount, " was taken forever and transferred to ").concat(this.to);
    };
    return EventTakeForever;
}(eventOrTx_1.EVMEvent));
exports.EventTakeForever = EventTakeForever;
var EventPaused = /** @class */ (function (_super) {
    __extends(EventPaused, _super);
    function EventPaused(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.contract = opts.contract;
        return _this;
    }
    EventPaused.prototype.toString = function (_) {
        return "".concat((0, contractsRegister_1.getContractName)(this.contract), " was paused");
    };
    return EventPaused;
}(eventOrTx_1.EVMEvent));
exports.EventPaused = EventPaused;
var EventUnPaused = /** @class */ (function (_super) {
    __extends(EventUnPaused, _super);
    function EventUnPaused(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.contract = opts.contract;
        return _this;
    }
    EventUnPaused.prototype.toString = function (_) {
        return "".concat((0, contractsRegister_1.getContractName)(this.contract), " was unpaused");
    };
    return EventUnPaused;
}(eventOrTx_1.EVMEvent));
exports.EventUnPaused = EventUnPaused;
var EventPausableAdminAdded = /** @class */ (function (_super) {
    __extends(EventPausableAdminAdded, _super);
    function EventPausableAdminAdded(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.admin = opts.admin;
        return _this;
    }
    EventPausableAdminAdded.prototype.toString = function (_) {
        return "ACL: pausable admin ".concat(this.admin, " was added");
    };
    return EventPausableAdminAdded;
}(eventOrTx_1.EVMEvent));
exports.EventPausableAdminAdded = EventPausableAdminAdded;
var EventPausableAdminRemoved = /** @class */ (function (_super) {
    __extends(EventPausableAdminRemoved, _super);
    function EventPausableAdminRemoved(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.admin = opts.admin;
        return _this;
    }
    EventPausableAdminRemoved.prototype.toString = function (_) {
        return "ACL: pausable admin ".concat(this.admin, " was removed");
    };
    return EventPausableAdminRemoved;
}(eventOrTx_1.EVMEvent));
exports.EventPausableAdminRemoved = EventPausableAdminRemoved;
var EventUnPausableAdminAdded = /** @class */ (function (_super) {
    __extends(EventUnPausableAdminAdded, _super);
    function EventUnPausableAdminAdded(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.admin = opts.admin;
        return _this;
    }
    EventUnPausableAdminAdded.prototype.toString = function (_) {
        return "ACL: unpausable admin ".concat(this.admin, " was added");
    };
    return EventUnPausableAdminAdded;
}(eventOrTx_1.EVMEvent));
exports.EventUnPausableAdminAdded = EventUnPausableAdminAdded;
var EventUnPausableAdminRemoved = /** @class */ (function (_super) {
    __extends(EventUnPausableAdminRemoved, _super);
    function EventUnPausableAdminRemoved(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.admin = opts.admin;
        return _this;
    }
    EventUnPausableAdminRemoved.prototype.toString = function (_) {
        return "ACL: unpausable admin ".concat(this.admin, " was removed");
    };
    return EventUnPausableAdminRemoved;
}(eventOrTx_1.EVMEvent));
exports.EventUnPausableAdminRemoved = EventUnPausableAdminRemoved;
// ACL: Transfer ownership
var EventTransferOwnership = /** @class */ (function (_super) {
    __extends(EventTransferOwnership, _super);
    function EventTransferOwnership(opts) {
        var _this = _super.call(this, {
            block: opts.block,
            txHash: opts.txHash,
            timestamp: opts.timestamp
        }) || this;
        _this.newOwner = opts.admin;
        return _this;
    }
    EventTransferOwnership.prototype.toString = function (_) {
        return "ACL: configurator was changed to ".concat(this.newOwner);
    };
    return EventTransferOwnership;
}(eventOrTx_1.EVMEvent));
exports.EventTransferOwnership = EventTransferOwnership;
