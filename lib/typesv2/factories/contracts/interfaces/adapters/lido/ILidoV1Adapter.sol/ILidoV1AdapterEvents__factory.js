"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ILidoV1AdapterEvents__factory = void 0;
var ethers_1 = require("ethers");
var _abi = [
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
];
var ILidoV1AdapterEvents__factory = /** @class */ (function () {
    function ILidoV1AdapterEvents__factory() {
    }
    ILidoV1AdapterEvents__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    ILidoV1AdapterEvents__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    ILidoV1AdapterEvents__factory.abi = _abi;
    return ILidoV1AdapterEvents__factory;
}());
exports.ILidoV1AdapterEvents__factory = ILidoV1AdapterEvents__factory;