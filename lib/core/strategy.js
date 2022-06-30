"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
var Strategy = /** @class */ (function () {
    function Strategy(payload) {
        this.apy = payload.apy;
        this.poolApy = payload.poolApy;
        this.ltStrategyLP = payload.ltStrategyLP;
        this.name = payload.name;
        this.lpToken = payload.lpToken;
        this.pools = payload.pools;
        this.unleveragableCollateral = payload.unleveragableCollateral;
        this.leveragableCollateral = payload.leveragableCollateral;
        this.baseAssets = payload.baseAssets;
    }
    Strategy.prototype.roiMax = function () {
        var max = this.maxLeverage();
        return this.roi(max, max - 1, this.minBorrowApy());
    };
    Strategy.prototype.maxLeverage = function () {
        return Math.floor(1 / (1 - this.ltStrategyLP));
    };
    Strategy.prototype.minBorrowApy = function () {
        return Object.values(this.poolApy).filter(function (a, b) { return a - b; })[0] || 0;
    };
    Strategy.prototype.roi = function (farmLev, debtLev, borrowAPY) {
        return this.apy * farmLev - borrowAPY * debtLev;
    };
    Strategy.prototype.borrowApy = function (pool) {
        return this.poolApy[pool] || 0;
    };
    Strategy.prototype.farmLev = function (leverage, depositCollateral) {
        var depositIsUnleveragable = this.unleveragableCollateral.some(function (c) { return c.toLowerCase() === depositCollateral.toLowerCase(); });
        return depositIsUnleveragable ? leverage - 1 : leverage;
    };
    Strategy.prototype.overallAPY = function (leverage, depositCollateral) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        var borrowAPY = this.borrowApy(depositCollateral);
        return this.roi(farmLev, leverage - 1, borrowAPY);
    };
    Strategy.prototype.liquidationPrice = function (leverage, depositCollateral) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        var ltCollateral = 0.5;
        return (1 -
            (leverage - 1 - ltCollateral * (leverage - farmLev)) /
                (this.ltStrategyLP * farmLev));
    };
    return Strategy;
}());
exports.Strategy = Strategy;
