"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolData = void 0;
var ethers_1 = require("ethers");
var types_1 = require("../types");
var formatter_1 = require("../utils/formatter");
var PoolData = /** @class */ (function () {
    function PoolData(payload) {
        this.id = payload.addr;
        this.address = payload.addr;
        this.underlyingToken = payload.underlying || "";
        this.dieselToken = payload.dieselToken || "";
        this.isWETH = payload.isWETH || false;
        this.expectedLiquidity = ethers_1.BigNumber.from(payload.expectedLiquidity);
        this.expectedLiquidityLimit = ethers_1.BigNumber.from(payload.expectedLiquidityLimit || 0);
        this.availableLiquidity = ethers_1.BigNumber.from(payload.availableLiquidity);
        this.totalBorrowed = ethers_1.BigNumber.from(payload.totalBorrowed);
        this.depositAPY = (0, formatter_1.rayToNumber)(payload.depositAPY_RAY) * 100;
        this.borrowAPY = (0, formatter_1.rayToNumber)(payload.borrowAPY_RAY) * 100;
        this.borrowAPYRay = ethers_1.BigNumber.from(payload.borrowAPY_RAY);
        this.dieselRate = (0, formatter_1.rayToNumber)(payload.dieselRate_RAY);
        this.dieselRateRay = ethers_1.BigNumber.from(payload.dieselRate_RAY);
        this.withdrawFee = ethers_1.BigNumber.from(payload.withdrawFee).toNumber() / 100;
        this.timestampLU = ethers_1.BigNumber.from(payload.timestampLU || 0);
        this.cumulativeIndex_RAY = ethers_1.BigNumber.from(payload.cumulativeIndex_RAY || 0);
    }
    PoolData.prototype.getContractETH = function (signer) {
        return types_1.IPoolService__factory.connect(this.address, signer);
    };
    Object.defineProperty(PoolData.prototype, "isPaused", {
        get: function () {
            return false;
        },
        enumerable: false,
        configurable: true
    });
    return PoolData;
}());
exports.PoolData = PoolData;
