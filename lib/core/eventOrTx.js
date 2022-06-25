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
exports.EVMTx = exports.EVMEvent = exports.EventOrTx = void 0;
var EventOrTx = /** @class */ (function () {
    function EventOrTx(_a) {
        var block = _a.block, txHash = _a.txHash, txStatus = _a.txStatus, _b = _a.timestamp, timestamp = _b === void 0 ? 0 : _b;
        this.block = block;
        this.txHash = txHash;
        this._txStatus = txStatus;
        this.timestamp = timestamp;
    }
    Object.defineProperty(EventOrTx.prototype, "isPending", {
        get: function () {
            return this._txStatus === "pending";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EventOrTx.prototype, "txStatus", {
        get: function () {
            return this._txStatus;
        },
        enumerable: false,
        configurable: true
    });
    EventOrTx.prototype.compare = function (item) {
        if (this.isPending && !item.isPending) {
            return -1;
        }
        if (!this.isPending && item.isPending) {
            return 1;
        }
        return this.block > item.block ? -1 : 1;
    };
    return EventOrTx;
}());
exports.EventOrTx = EventOrTx;
var EVMEvent = /** @class */ (function (_super) {
    __extends(EVMEvent, _super);
    function EVMEvent(opts) {
        return _super.call(this, __assign(__assign({}, opts), { txStatus: "success" })) || this;
    }
    return EVMEvent;
}(EventOrTx));
exports.EVMEvent = EVMEvent;
var EVMTx = /** @class */ (function (_super) {
    __extends(EVMTx, _super);
    function EVMTx(_a) {
        var txHash = _a.txHash, _b = _a.block, block = _b === void 0 ? 0 : _b, _c = _a.txStatus, txStatus = _c === void 0 ? "pending" : _c, _d = _a.timestamp, timestamp = _d === void 0 ? 0 : _d;
        var _this = _super.call(this, {
            block: block,
            txStatus: txStatus,
            txHash: txHash,
            timestamp: timestamp
        }) || this;
        if (_this.txStatus !== "pending" && _this.block === 0) {
            throw new Error("Block not specified for non-pending tx");
        }
        return _this;
    }
    EVMTx.prototype.revert = function (block) {
        this._txStatus = "reverted";
        this.block = block;
    };
    EVMTx.prototype.success = function (block) {
        this._txStatus = "success";
        this.block = block;
    };
    return EVMTx;
}(EventOrTx));
exports.EVMTx = EVMTx;
