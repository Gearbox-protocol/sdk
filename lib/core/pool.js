"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolData = void 0;
var ethers_1 = require("ethers");
var formatter_1 = require("../utils/formatter");
var types_1 = require("../types");
var constants_1 = require("./constants");
var PoolData = /** @class */ (function () {
    function PoolData(payload) {
        this.isPaused = false;
        this.id = payload.addr.toLowerCase();
        this.address = payload.addr.toLowerCase();
        this.underlyingToken = payload.underlying.toLowerCase();
        this.dieselToken = payload.dieselToken.toLowerCase();
        this.isWETH = payload.isWETH || false;
        this.expectedLiquidity = ethers_1.BigNumber.from(payload.expectedLiquidity);
        this.expectedLiquidityLimit = ethers_1.BigNumber.from(payload.expectedLiquidityLimit || 0);
        this.availableLiquidity = ethers_1.BigNumber.from(payload.availableLiquidity);
        this.totalBorrowed = ethers_1.BigNumber.from(payload.totalBorrowed);
        this.depositAPY = (0, formatter_1.rayToNumber)(payload.depositAPY_RAY) * constants_1.PERCENTAGE_DECIMALS;
        this.borrowAPY = (0, formatter_1.rayToNumber)(payload.borrowAPY_RAY) * constants_1.PERCENTAGE_DECIMALS;
        this.borrowAPYRay = ethers_1.BigNumber.from(payload.borrowAPY_RAY);
        this.dieselRate = (0, formatter_1.rayToNumber)(payload.dieselRate_RAY);
        this.dieselRateRay = ethers_1.BigNumber.from(payload.dieselRate_RAY);
        this.withdrawFee =
            ethers_1.BigNumber.from(payload.withdrawFee).toNumber() / constants_1.PERCENTAGE_DECIMALS;
        this.timestampLU = ethers_1.BigNumber.from(payload.timestampLU || 0);
        this.cumulativeIndex_RAY = ethers_1.BigNumber.from(payload.cumulativeIndex_RAY || 0);
    }
    PoolData.prototype.getContractETH = function (signer) {
        return types_1.IPoolService__factory.connect(this.address, signer);
    };
    return PoolData;
}());
exports.PoolData = PoolData;
