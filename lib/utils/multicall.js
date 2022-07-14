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
exports.MultiCallContract = exports.multicall = void 0;
var config_1 = require("../config");
var types_1 = require("../types");
function multicall(calls, p) {
    return __awaiter(this, void 0, void 0, function () {
        var multiCallContract, returnData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    multiCallContract = types_1.Multicall2__factory.connect(config_1.MULTICALL_ADDRESS, p);
                    return [4 /*yield*/, multiCallContract.callStatic.aggregate(calls.map(function (c) { return ({
                            target: c.address,
                            callData: c.interface.encodeFunctionData(c.method, c.params)
                        }); }))];
                case 1:
                    returnData = (_a.sent()).returnData;
                    return [2 /*return*/, returnData
                            .map(function (d, num) {
                            return calls[num].interface.decodeFunctionResult(calls[num].method, d);
                        })
                            .map(function (r) { return (Array.isArray(r) && r.length <= 1 ? r[0] : r); })];
            }
        });
    });
}
exports.multicall = multicall;
var MultiCallContract = /** @class */ (function () {
    function MultiCallContract(address, intrerface, provider) {
        this._address = address;
        this._interface = intrerface;
        this._multiCall = types_1.Multicall2__factory.connect(config_1.MULTICALL_ADDRESS, provider);
    }
    MultiCallContract.prototype.call = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var returnData;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._multiCall.callStatic.aggregate(data.map(function (c) { return ({
                            target: _this._address,
                            callData: _this._interface.encodeFunctionData(c.method, c.params)
                        }); }))];
                    case 1:
                        returnData = (_a.sent()).returnData;
                        return [2 /*return*/, returnData
                                .map(function (d, num) {
                                return _this._interface.decodeFunctionResult(data[num].method, d);
                            })
                                .map(function (r) { return r[0]; })];
                }
            });
        });
    };
    Object.defineProperty(MultiCallContract.prototype, "address", {
        get: function () {
            return this._address;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MultiCallContract.prototype, "interface", {
        get: function () {
            return this._interface;
        },
        enumerable: false,
        configurable: true
    });
    return MultiCallContract;
}());
exports.MultiCallContract = MultiCallContract;
