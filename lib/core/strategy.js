"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
var ethers_1 = require("ethers");
var constants_1 = require("./constants");
var price_1 = require("./price");
var Strategy = /** @class */ (function () {
    function Strategy(payload) {
        this.apy = payload.apy;
        this.name = payload.name;
        this.lpToken = payload.lpToken;
        this.pools = payload.pools;
        this.unleveragableCollateral = payload.unleveragableCollateral;
        this.leveragableCollateral = payload.leveragableCollateral;
        this.baseAssets = payload.baseAssets;
    }
    Strategy.prototype.maxAPY = function (maxLeverage, poolApy) {
        var minApy = minBorrowApy(poolApy);
        return roi(this.apy || 0, maxLeverage, maxLeverage - constants_1.LEVERAGE_DECIMALS, minApy);
    };
    Strategy.prototype.overallAPY = function (apy, leverage, depositCollateral, borrowAPY) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        return roi(apy, farmLev, leverage - constants_1.LEVERAGE_DECIMALS, borrowAPY);
    };
    // eslint-disable-next-line class-methods-use-this
    Strategy.prototype.liquidationPrice = function (borrowed, collateral, lp, ltCollateral) {
        var borrowedMoney = (0, price_1.calcTotalPrice)(borrowed.price, borrowed.amount, borrowed.decimals);
        var collateralMoney = (0, price_1.calcTotalPrice)(collateral.price, collateral.amount, collateral.decimals)
            .mul(ltCollateral)
            .div(constants_1.PERCENTAGE_FACTOR);
        var lpMoney = (0, price_1.calcTotalPrice)(lp.price, lp.amount, lp.decimals);
        return lpMoney.gt(0)
            ? borrowedMoney.sub(collateralMoney).mul(constants_1.WAD).div(lpMoney)
            : ethers_1.BigNumber.from(0);
    };
    Strategy.prototype.farmLev = function (leverage, depositCollateral) {
        return this.inBaseAssets(depositCollateral) ||
            this.inLeveragableAssets(depositCollateral)
            ? leverage
            : leverage - constants_1.LEVERAGE_DECIMALS;
    };
    Strategy.prototype.inBaseAssets = function (depositCollateral) {
        return this.baseAssets.some(function (c) { return c.toLowerCase() === depositCollateral.toLowerCase(); });
    };
    Strategy.prototype.inLeveragableAssets = function (depositCollateral) {
        return this.leveragableCollateral.some(function (c) { return c.toLowerCase() === depositCollateral.toLowerCase(); });
    };
    return Strategy;
}());
exports.Strategy = Strategy;
function roi(apy, farmLev, debtLev, borrowAPY) {
    return (apy * farmLev - borrowAPY * debtLev) / constants_1.LEVERAGE_DECIMALS;
}
function minBorrowApy(poolApy) {
    var apys = Object.values(poolApy).sort(function (a, b) { return a.borrowRate - b.borrowRate; });
    return apys.length > 0 ? apys[0].borrowRate : 0;
}
