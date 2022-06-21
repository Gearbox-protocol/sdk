"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICurveV1Adapter__factory = void 0;
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
        inputs: [
            {
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "rateMinRAY",
                type: "uint256",
            },
        ],
        name: "add_all_liquidity_one_coin",
        outputs: [],
        stateMutability: "nonpayable",
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
        name: "balances",
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
                internalType: "uint256",
                name: "i",
                type: "uint256",
            },
        ],
        name: "coins",
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
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "int128",
                name: "j",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "dx",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "min_dy",
                type: "uint256",
            },
        ],
        name: "exchange",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "int128",
                name: "j",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "rateMinRAY",
                type: "uint256",
            },
        ],
        name: "exchange_all",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "int128",
                name: "j",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "rateMinRAY",
                type: "uint256",
            },
        ],
        name: "exchange_all_underlying",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "int128",
                name: "j",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "dx",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "min_dy",
                type: "uint256",
            },
        ],
        name: "exchange_underlying",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "int128",
                name: "j",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "dx",
                type: "uint256",
            },
        ],
        name: "get_dy",
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
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "int128",
                name: "j",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "dx",
                type: "uint256",
            },
        ],
        name: "get_dy_underlying",
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
        name: "get_virtual_price",
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
        name: "lp_token",
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
        name: "metapoolBase",
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
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "minRateRAY",
                type: "uint256",
            },
        ],
        name: "remove_all_liquidity_one_coin",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_token_amount",
                type: "uint256",
            },
            {
                internalType: "int128",
                name: "i",
                type: "int128",
            },
            {
                internalType: "uint256",
                name: "min_amount",
                type: "uint256",
            },
        ],
        name: "remove_liquidity_one_coin",
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
    {
        inputs: [],
        name: "token",
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
        name: "underlying_coins",
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
var ICurveV1Adapter__factory = /** @class */ (function () {
    function ICurveV1Adapter__factory() {
    }
    ICurveV1Adapter__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    ICurveV1Adapter__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ICurveV1Adapter__factory.abi = _abi;
    return ICurveV1Adapter__factory;
}());
exports.ICurveV1Adapter__factory = ICurveV1Adapter__factory;