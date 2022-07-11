"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
var constants_1 = require("../core/constants");
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
    Strategy.prototype.roiMax = function (apy, maxLeverage, poolApy) {
        var minApy = this.minBorrowApy(poolApy);
        return this.roi(apy, maxLeverage, maxLeverage - constants_1.LEVERAGE_DECIMALS, minApy);
    };
    Strategy.prototype.overallAPY = function (apy, leverage, depositCollateral, borrowAPY) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        return this.roi(apy, farmLev, leverage - constants_1.LEVERAGE_DECIMALS, borrowAPY);
    };
    Strategy.prototype.liquidationPrice = function (leverage, ltStrategy, ltCollateral, depositCollateral) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        return (1 -
            (leverage - constants_1.LEVERAGE_DECIMALS - ltCollateral * (leverage - farmLev)) /
                (ltStrategy * farmLev));
    };
    Strategy.prototype.ltStrategyLP = function (maxLeverage) {
        return 1 - constants_1.LEVERAGE_DECIMALS / maxLeverage;
    };
    Strategy.prototype.maxLeverage = function (ltStrategyLP) {
        var leverage = Math.floor(1 / (1 - ltStrategyLP));
        return Math.floor(leverage * constants_1.LEVERAGE_DECIMALS);
    };
    Strategy.prototype.roi = function (apy, farmLev, debtLev, borrowAPY) {
        return (apy * farmLev - borrowAPY * debtLev) / constants_1.LEVERAGE_DECIMALS;
    };
    Strategy.prototype.minBorrowApy = function (poolApy) {
        var apys = Object.values(poolApy).sort(function (a, b) { return a.borrowRate - b.borrowRate; });
        return apys.length > 0 ? apys[0].borrowRate : 0;
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
