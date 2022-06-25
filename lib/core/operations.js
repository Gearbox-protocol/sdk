"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationData = void 0;
var moment_1 = __importDefault(require("moment"));
var OperationData = /** @class */ (function () {
    function OperationData(payload) {
        this.id = payload.id;
        this.address = payload.address;
        this.txHash = payload.txHash;
        this.blockNum = payload.blockNum;
        this.operation = payload.operation;
        this.timestamp = payload.timestamp;
        this.date = (0, moment_1.default)(payload.timestamp * 1000).format("Do MMM YYYY");
    }
    return OperationData;
}());
exports.OperationData = OperationData;
