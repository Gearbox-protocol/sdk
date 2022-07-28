"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDataCompressorExceptions__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [],
        name: "NotCreditManagerException",
        type: "error",
    },
    {
        inputs: [],
        name: "NotPoolException",
        type: "error",
    },
];
var IDataCompressorExceptions__factory = /** @class */ (function () {
    function IDataCompressorExceptions__factory() {
    }
    IDataCompressorExceptions__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IDataCompressorExceptions__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IDataCompressorExceptions__factory.abi = _abi;
    return IDataCompressorExceptions__factory;
}());
exports.IDataCompressorExceptions__factory = IDataCompressorExceptions__factory;