"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBooster__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
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
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "_stake",
                type: "bool",
            },
        ],
        name: "deposit",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "bool",
                name: "_stake",
                type: "bool",
            },
        ],
        name: "depositAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "lockFees",
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
        name: "lockRewards",
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
        name: "minter",
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
                internalType: "uint256",
                name: "i",
                type: "uint256",
            },
        ],
        name: "poolInfo",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "lptoken",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "token",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "gauge",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "crvRewards",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "stash",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "shutdown",
                        type: "bool",
                    },
                ],
                internalType: "struct IBooster.PoolInfo",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "poolLength",
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
        inputs: [],
        name: "registry",
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
        name: "staker",
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
        name: "stakerRewards",
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
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "withdraw",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_pid",
                type: "uint256",
            },
        ],
        name: "withdrawAll",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
];
var IBooster__factory = /** @class */ (function () {
    function IBooster__factory() {
    }
    IBooster__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IBooster__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IBooster__factory.abi = _abi;
    return IBooster__factory;
}());
exports.IBooster__factory = IBooster__factory;