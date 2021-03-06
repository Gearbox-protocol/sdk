"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IClaimZap__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [
            {
                internalType: "address[]",
                name: "rewardContracts",
                type: "address[]",
            },
            {
                internalType: "address[]",
                name: "extraRewardContracts",
                type: "address[]",
            },
            {
                internalType: "address[]",
                name: "tokenRewardContracts",
                type: "address[]",
            },
            {
                internalType: "address[]",
                name: "tokenRewardTokens",
                type: "address[]",
            },
            {
                internalType: "uint256",
                name: "depositCrvMaxAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "minAmountOut",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "depositCvxMaxAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "spendCvxAmount",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "options",
                type: "uint256",
            },
        ],
        name: "claimRewards",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "crv",
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
        inputs: [],
        name: "cvx",
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
var IClaimZap__factory = /** @class */ (function () {
    function IClaimZap__factory() {
    }
    IClaimZap__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IClaimZap__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IClaimZap__factory.abi = _abi;
    return IClaimZap__factory;
}());
exports.IClaimZap__factory = IClaimZap__factory;
