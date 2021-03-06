"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAdapter__factory = void 0;
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
var IAdapter__factory = /** @class */ (function () {
    function IAdapter__factory() {
    }
    IAdapter__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    IAdapter__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    IAdapter__factory.abi = _abi;
    return IAdapter__factory;
}());
exports.IAdapter__factory = IAdapter__factory;
