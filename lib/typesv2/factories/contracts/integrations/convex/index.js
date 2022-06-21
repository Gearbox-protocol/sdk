"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IRewards__factory = exports.IConvexToken__factory = exports.IClaimZap__factory = exports.IBooster__factory = exports.IBaseRewardPool__factory = exports.interfacesSol = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
exports.interfacesSol = __importStar(require("./Interfaces.sol"));
var IBaseRewardPool__factory_1 = require("./IBaseRewardPool__factory");
Object.defineProperty(exports, "IBaseRewardPool__factory", { enumerable: true, get: function () { return IBaseRewardPool__factory_1.IBaseRewardPool__factory; } });
var IBooster__factory_1 = require("./IBooster__factory");
Object.defineProperty(exports, "IBooster__factory", { enumerable: true, get: function () { return IBooster__factory_1.IBooster__factory; } });
var IClaimZap__factory_1 = require("./IClaimZap__factory");
Object.defineProperty(exports, "IClaimZap__factory", { enumerable: true, get: function () { return IClaimZap__factory_1.IClaimZap__factory; } });
var IConvexToken__factory_1 = require("./IConvexToken__factory");
Object.defineProperty(exports, "IConvexToken__factory", { enumerable: true, get: function () { return IConvexToken__factory_1.IConvexToken__factory; } });
var IRewards__factory_1 = require("./IRewards__factory");
Object.defineProperty(exports, "IRewards__factory", { enumerable: true, get: function () { return IRewards__factory_1.IRewards__factory; } });