"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ILidoV1Adapter__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [],
        name: "LimitIsOverException",
        type: "error",
    },
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
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "_limit",
                type: "uint256",
            },
        ],
        name: "NewLimit",
        type: "event",
    },
    {
        inputs: [],
        name: "_gearboxAdapterType",
        outputs: [
            {
                internalType: "enum AdapterType",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "_gearboxAdapterVersion",
        outputs: [
            {
                internalType: "uint16",
                name: "",
                type: "uint16",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [],
        name: "creditFacade",
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
        name: "creditManager",
        outputs: [
            {
                internalType: "contract ICreditManagerV2",
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
                name: "_limit",
                type: "uint256",
            },
        ],
        name: "setLimit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "targetContract",
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
var ILidoV1Adapter__factory = /** @class */ (function () {
    function ILidoV1Adapter__factory() {
    }
    ILidoV1Adapter__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    ILidoV1Adapter__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ILidoV1Adapter__factory.abi = _abi;
    return ILidoV1Adapter__factory;
}());
exports.ILidoV1Adapter__factory = ILidoV1Adapter__factory;