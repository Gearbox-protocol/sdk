"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICurveRegistry__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "pool",
                type: "address",
            },
        ],
        name: "get_lp_token",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "pool",
                type: "address",
            },
        ],
        name: "get_n_coins",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "token",
                type: "address",
            },
        ],
        name: "get_pool_from_lp_token",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
];
var ICurveRegistry__factory = /** @class */ (function () {
    function ICurveRegistry__factory() {
    }
    ICurveRegistry__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    ICurveRegistry__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ICurveRegistry__factory.abi = _abi;
    return ICurveRegistry__factory;
}());
exports.ICurveRegistry__factory = ICurveRegistry__factory;
