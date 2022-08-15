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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurveAPY = void 0;
var ethers_1 = require("ethers");
var axios_1 = __importDefault(require("axios"));
var formatter_1 = require("../utils/formatter");
var constants_1 = require("../core/constants");
var mappers_1 = require("../utils/mappers");
var curveLPTokenToPoolName = {
    "3Crv": "3pool",
    FRAX3CRV: "frax",
    gusd3CRV: "gusd",
    LUSD3CRV: "lusd",
    crvPlain3andSUSD: "susdv2",
    steCRV: "steth"
};
var RESPONSE_DECIMALS = 100;
var ZERO = ethers_1.BigNumber.from(0);
function getCurveAPY() {
    return __awaiter(this, void 0, void 0, function () {
        var url, data, apys_1, curveAPY, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    url = "http://localhost:8000/api/curve-apys";
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    data = (_a.sent()).data;
                    apys_1 = (data || {}).apys;
                    curveAPY = (0, mappers_1.objectEntries)(curveLPTokenToPoolName).reduce(function (acc, _a) {
                        var curveSymbol = _a[0], apiEntry = _a[1];
                        var _b = (apys_1[apiEntry] || {}).baseApy, baseApy = _b === void 0 ? 0 : _b;
                        acc[curveSymbol] = (0, formatter_1.toBN)((baseApy / RESPONSE_DECIMALS).toString(), constants_1.WAD_DECIMALS_POW);
                        return acc;
                    }, {});
                    return [2 /*return*/, curveAPY];
                case 2:
                    e_1 = _a.sent();
                    return [2 /*return*/, {
                            "3Crv": ZERO,
                            FRAX3CRV: ZERO,
                            gusd3CRV: ZERO,
                            LUSD3CRV: ZERO,
                            crvPlain3andSUSD: ZERO,
                            steCRV: ZERO
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getCurveAPY = getCurveAPY;
