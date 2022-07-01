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
    Strategy.prototype.roiMax = function (maxLeverage, poolApy) {
        var minApy = this.minBorrowApy(poolApy);
        return this.roi(maxLeverage, maxLeverage - constants_1.LEVERAGE_DECIMALS, minApy);
    };
    Strategy.prototype.overallAPY = function (leverage, depositCollateral, pool) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        var _a = (pool || {}).borrowAPY, borrowAPY = _a === void 0 ? 0 : _a;
        return this.roi(farmLev, leverage - constants_1.LEVERAGE_DECIMALS, borrowAPY);
    };
    Strategy.prototype.liquidationPrice = function (leverage, maxLeverage, ltCollateral, depositCollateral) {
        var farmLev = this.farmLev(leverage, depositCollateral);
        var ltStrategy = this.ltStrategyLP(maxLeverage);
        return (1 -
            (leverage - constants_1.LEVERAGE_DECIMALS - ltCollateral * (leverage - farmLev)) /
                (ltStrategy * farmLev));
    };
    Strategy.prototype.roi = function (farmLev, debtLev, borrowAPY) {
        return (this.apy * farmLev - borrowAPY * debtLev) / constants_1.LEVERAGE_DECIMALS;
    };
    Strategy.prototype.minBorrowApy = function (poolApy) {
        var apys = Object.values(poolApy).sort(function (a, b) { return a.borrowAPY - b.borrowAPY; });
        return apys.length > 0 ? apys[0].borrowAPY : 0;
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
    Strategy.prototype.ltStrategyLP = function (maxLeverage) {
        return Math.floor(1 - constants_1.LEVERAGE_DECIMALS / maxLeverage);
    };
    return Strategy;
}());
exports.Strategy = Strategy;
