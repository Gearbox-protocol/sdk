"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIDO_FEE_DECIMALS = exports.getLidoApy = void 0;
var multicall_1 = require("../utils/multicall");
var constants_1 = require("../core/constants");
var types_1 = require("../types");
var lidoOracleAddress = {
    Mainnet: "0x442af784A788A5bd6F42A01Ebe9F287a871243fb",
    Kovan: ""
};
var lidoStEthAddress = {
    Mainnet: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
    Kovan: ""
};
function getLidoApy(provider, networkType) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, postTotalPooledEther, preTotalPooledEther, timeElapsed, fee, lidoAPRRay;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!lidoOracleAddress[networkType]) {
                        throw "No Lido APR oracle found on current network: ".concat(networkType);
                    }
                    if (!lidoStEthAddress[networkType]) {
                        throw "No Lido stETH found on current network: ".concat(networkType);
                    }
                    return [4 /*yield*/, geLidoData(lidoOracleAddress[networkType], lidoStEthAddress[networkType], provider)];
                case 1:
                    _a = _c.sent(), _b = _a[0], postTotalPooledEther = _b.postTotalPooledEther, preTotalPooledEther = _b.preTotalPooledEther, timeElapsed = _b.timeElapsed, fee = _a[1];
                    lidoAPRRay = postTotalPooledEther
                        .sub(preTotalPooledEther)
                        .mul(constants_1.SECONDS_PER_YEAR)
                        .mul(constants_1.WAD)
                        .div(preTotalPooledEther.mul(timeElapsed));
                    return [2 /*return*/, [lidoAPRRay, fee]];
            }
        });
    });
}
exports.getLidoApy = getLidoApy;
function geLidoData(lidoOracleAddress, stETHAddress, provider) {
    return __awaiter(this, void 0, void 0, function () {
        var calls;
        return __generator(this, function (_a) {
            calls = [
                {
                    address: lidoOracleAddress,
                    interface: types_1.ILidoOracle__factory.createInterface(),
                    method: "getLastCompletedReportDelta()"
                },
                {
                    address: stETHAddress,
                    interface: types_1.IstETH__factory.createInterface(),
                    method: "getFee()"
                }
            ];
            return [2 /*return*/, (0, multicall_1.multicall)(calls, provider)];
        });
    });
}
exports.LIDO_FEE_DECIMALS = 10000;
