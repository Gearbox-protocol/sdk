"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TradeType = void 0;
var TradeType;
(function (TradeType) {
    TradeType[TradeType["UniswapV2Swap"] = 0] = "UniswapV2Swap";
    TradeType[TradeType["UniswapV3Swap"] = 1] = "UniswapV3Swap";
    TradeType[TradeType["CurveExchange"] = 2] = "CurveExchange";
    TradeType[TradeType["CurveExchangeUnderlying"] = 3] = "CurveExchangeUnderlying";
    TradeType[TradeType["CurveDepositLP"] = 4] = "CurveDepositLP";
    TradeType[TradeType["CurveWithdrawLP"] = 5] = "CurveWithdrawLP";
    TradeType[TradeType["YearnDeposit"] = 6] = "YearnDeposit";
    TradeType[TradeType["YearnWithdraw"] = 7] = "YearnWithdraw";
    TradeType[TradeType["LidoStake"] = 8] = "LidoStake";
    TradeType[TradeType["ConvexDeposit"] = 9] = "ConvexDeposit";
    TradeType[TradeType["ConvexStake"] = 10] = "ConvexStake";
    TradeType[TradeType["ConvexDepositAndStake"] = 11] = "ConvexDepositAndStake";
})(TradeType = exports.TradeType || (exports.TradeType = {}));
