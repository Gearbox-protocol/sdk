"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strategy = void 0;
var EXTERNAL_APY_DECIMALS = 100;
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
    Strategy.prototype.roiMax = function (maxLeverage, poolApy) {
        var minApy = this.minBorrowApy(poolApy);
        return this.roi(maxLeverage, maxLeverage - 1, minApy);
    };
    Strategy.prototype.overallAPY = function (leverage, depositCollateral, pool) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        var borrowAPY = this.borrowApy(pool);
        return this.roi(farmLev, leverage - 1, borrowAPY);
    };
    Strategy.prototype.liquidationPrice = function (leverage, maxLeverage, ltCollateral, depositCollateral) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        var ltStrategy = this.ltStrategyLP(maxLeverage);
        return (1 -
            (leverage - 1 - ltCollateral * (leverage - farmLev)) /
                (ltStrategy * farmLev));
    };
    Strategy.prototype.roi = function (farmLev, debtLev, borrowAPY) {
        return this.apy * farmLev - borrowAPY * debtLev;
    };
    Strategy.prototype.minBorrowApy = function (poolApy) {
        var apys = Object.values(poolApy).sort(function (a, b) { return a.borrowAPY - b.borrowAPY; });
        return apys.length > 0 ? apys[0].borrowAPY / EXTERNAL_APY_DECIMALS : 0;
    };
    Strategy.prototype.borrowApy = function (pool) {
        return pool ? pool.borrowAPY / EXTERNAL_APY_DECIMALS : 0;
    };
    Strategy.prototype.farmLev = function (leverage, depositCollateral) {
        return this.inBaseAssets(depositCollateral) ||
            this.inLeveragableAssets(depositCollateral)
            ? leverage
            : leverage - 1;
    };
    Strategy.prototype.inBaseAssets = function (depositCollateral) {
        return this.baseAssets.some(function (c) { return c.toLowerCase() === depositCollateral.toLowerCase(); });
    };
    Strategy.prototype.inLeveragableAssets = function (depositCollateral) {
        return this.leveragableCollateral.some(function (c) { return c.toLowerCase() === depositCollateral.toLowerCase(); });
    };
    Strategy.prototype.ltStrategyLP = function (maxLeverage) {
        return Math.floor(1 - 1 / maxLeverage);
    };
    return Strategy;
}());
exports.Strategy = Strategy;
