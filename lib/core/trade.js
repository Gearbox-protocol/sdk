"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradePath = void 0;
var swap_1 = require("./swap");
var constants_1 = require("./constants");
var TradePath = /** @class */ (function () {
    function TradePath(params) {
        this.swapType = params.swapType;
        this.amount = params.amount;
        this.path = params.path;
        this.expectedAmount = params.expectedAmount;
        this.pathUniV3 = params.pathUniV3;
        this.rate =
            params.swapType !== swap_1.SwapType.ExactInput
                ? params.expectedAmount.mul(constants_1.WAD).div(params.amount)
                : constants_1.WAD.mul(params.amount).div(params.expectedAmount);
        this.i = params.i;
        this.j = params.j;
        this.operationName = params.operationName;
    }
    TradePath.prototype.getExpectedAmountWithSlippage = function (slippage) {
        return this.swapType === swap_1.SwapType.ExactInput
            ? this.getAmountOutMin(slippage)
            : this.getAmountInMax(slippage);
    };
    TradePath.prototype.getAmountInMax = function (slippage) {
        return this.expectedAmount
            .mul(constants_1.PERCENTAGE_FACTOR + slippage)
            .div(constants_1.PERCENTAGE_FACTOR);
    };
    TradePath.prototype.getAmountOutMin = function (slippage) {
        return this.expectedAmount
            .mul(constants_1.PERCENTAGE_FACTOR)
            .div(constants_1.PERCENTAGE_FACTOR + slippage);
    };
    Object.defineProperty(TradePath.prototype, "from", {
        get: function () {
            return this.path[0];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TradePath.prototype, "to", {
        get: function () {
            return this.path[this.path.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    TradePath.prototype.getFromAmount = function (slippage) {
        return this.swapType === swap_1.SwapType.ExactInput
            ? this.amount
            : this.getExpectedAmountWithSlippage(slippage);
    };
    TradePath.prototype.getToAmount = function (slippage) {
        return this.swapType === swap_1.SwapType.ExactOutput
            ? this.amount
            : this.getExpectedAmountWithSlippage(slippage);
    };
    return TradePath;
}());
exports.TradePath = TradePath;
