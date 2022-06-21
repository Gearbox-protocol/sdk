"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBoosterMockEvents__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "poolid",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "bool",
                name: "_stake",
                type: "bool",
            },
        ],
        name: "Mock_Deposited",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "poolid",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "Mock_Withdrawn",
        type: "event",
    },
];
var IBoosterMockEvents__factory = /** @class */ (function () {
    function IBoosterMockEvents__factory() {
    }
    IBoosterMockEvents__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IBoosterMockEvents__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IBoosterMockEvents__factory.abi = _abi;
    return IBoosterMockEvents__factory;
}());
exports.IBoosterMockEvents__factory = IBoosterMockEvents__factory;