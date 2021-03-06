"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PercentageMathTest__factory = void 0;
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
var ethers_1 = require("ethers");
var _abi = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "percentage",
                type: "uint256",
            },
        ],
        name: "percentDiv",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "value",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "percentage",
                type: "uint256",
            },
        ],
        name: "percentMul",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "pure",
        type: "function",
    },
];
var _bytecode = "0x608060405234801561001057600080fd5b50610343806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806346c840bb1461003b5780634bf6a8f014610060575b600080fd5b61004e610049366004610190565b610073565b60405190815260200160405180910390f35b61004e61006e366004610190565b610088565b600061007f8383610094565b90505b92915050565b600061007f8383610146565b60408051808201909152600281527f4d3300000000000000000000000000000000000000000000000000000000000060208201526000908261010c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161010391906101b2565b60405180910390fd5b50600061011a600284610283565b9050828161012a61271087610297565b61013491906102d4565b61013e9190610283565b949350505050565b6000821580610153575081155b1561016057506000610082565b61271061016e6002826102ec565b61ffff1661017c8486610297565b61018691906102d4565b61007f9190610283565b600080604083850312156101a357600080fd5b50508035926020909101359150565b600060208083528351808285015260005b818110156101df578581018301518582016040015282016101c3565b818111156101f1576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008261029257610292610225565b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156102cf576102cf610254565b500290565b600082198211156102e7576102e7610254565b500190565b600061ffff8084168061030157610301610225565b9216919091049291505056fea26469706673582212208f38722287bb8f6292d8b0a108329767d6ca6a1cb2ba155f6a167014b5872bc364736f6c634300080a0033";
var isSuperArgs = function (xs) { return xs.length > 1; };
var PercentageMathTest__factory = /** @class */ (function (_super) {
    __extends(PercentageMathTest__factory, _super);
    function PercentageMathTest__factory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        if (isSuperArgs(args)) {
            _this = _super.apply(this, args) || this;
        }
        else {
            _this = _super.call(this, _abi, _bytecode, args[0]) || this;
        }
        return _this;
    }
    PercentageMathTest__factory.prototype.deploy = function (overrides) {
        return _super.prototype.deploy.call(this, overrides || {});
    };
    PercentageMathTest__factory.prototype.getDeployTransaction = function (overrides) {
        return _super.prototype.getDeployTransaction.call(this, overrides || {});
    };
    PercentageMathTest__factory.prototype.attach = function (address) {
        return _super.prototype.attach.call(this, address);
    };
    PercentageMathTest__factory.prototype.connect = function (signer) {
        return _super.prototype.connect.call(this, signer);
    };
    PercentageMathTest__factory.createInterface = function () {
        return new ethers_1.utils.Interface(_abi);
    };
    PercentageMathTest__factory.connect = function (address, signerOrProvider) {
        return new ethers_1.Contract(address, _abi, signerOrProvider);
    };
    PercentageMathTest__factory.bytecode = _bytecode;
    PercentageMathTest__factory.abi = _abi;
    return PercentageMathTest__factory;
}(ethers_1.ContractFactory));
exports.PercentageMathTest__factory = PercentageMathTest__factory;
