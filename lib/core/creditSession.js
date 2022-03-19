"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditSession = void 0;
var ethers_1 = require("ethers");
var moment_1 = __importDefault(require("moment"));
var constants_1 = require("./constants");
var statusEnum = [
    "active",
    "closed",
    "repaid",
    "liquidated",
];
var CreditSession = /** @class */ (function () {
    function CreditSession(payload) {
        this.id = payload.id;
        this.status = statusEnum[payload.status];
        this.name = payload.name;
        this.background = payload.background;
        this.borrower = payload.borrower;
        this.creditManager = payload.creditManager;
        this.account = payload.account;
        this.since = payload.since;
        this.closedAt = payload.closedAt;
        this.initialAmount = ethers_1.BigNumber.from(payload.initialAmount || 0);
        this.borrowedAmount = ethers_1.BigNumber.from(payload.borrowedAmount || 0);
        this.profit = ethers_1.BigNumber.from(payload.profit || 0);
        this.profitPercentage = payload.profitPercentage || 0;
        this.totalValue = ethers_1.BigNumber.from(payload.totalValue || 0);
        this.healthFactor =
            ethers_1.BigNumber.from(payload.healthFactor || 0).toNumber() / constants_1.PERCENTAGE_FACTOR;
        this.score = payload.score;
        this.operations = (payload.operations || []).map(function (op) {
            op.date = (0, moment_1.default)(op.timestamp * 1000).format("Do MMM YYYY");
            return op;
        });
        this.sinceDate = (0, moment_1.default)(payload.sinceTimestamp * 1000).format("Do MMM YYYY");
        this.closedAtDate = (0, moment_1.default)(payload.closedAtTimestamp * 1000).format("Do MMM YYYY");
    }
    return CreditSession;
}());
exports.CreditSession = CreditSession;
