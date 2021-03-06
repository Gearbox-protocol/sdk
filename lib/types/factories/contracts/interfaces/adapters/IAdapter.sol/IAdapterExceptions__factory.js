"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAdapterExceptions__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        name: "TokenIsNotInAllowedList",
        type: "error",
    },
];
var IAdapterExceptions__factory = /** @class */ (function () {
    function IAdapterExceptions__factory() {
    }
    IAdapterExceptions__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IAdapterExceptions__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IAdapterExceptions__factory.abi = _abi;
    return IAdapterExceptions__factory;
}());
exports.IAdapterExceptions__factory = IAdapterExceptions__factory;
