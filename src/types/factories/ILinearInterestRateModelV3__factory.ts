/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ILinearInterestRateModelV3,
  ILinearInterestRateModelV3Interface,
} from "../ILinearInterestRateModelV3";

const _abi = [
  {
    type: "function",
    name: "availableToBorrow",
    inputs: [
      {
        name: "expectedLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "availableLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "calcBorrowRate",
    inputs: [
      {
        name: "expectedLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "availableLiquidity",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "checkOptimalBorrowing",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getModelParameters",
    inputs: [],
    outputs: [
      {
        name: "U_1",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "U_2",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "R_base",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "R_slope1",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "R_slope2",
        type: "uint16",
        internalType: "uint16",
      },
      {
        name: "R_slope3",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isBorrowingMoreU2Forbidden",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "version",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
] as const;

export class ILinearInterestRateModelV3__factory {
  static readonly abi = _abi;
  static createInterface(): ILinearInterestRateModelV3Interface {
    return new utils.Interface(_abi) as ILinearInterestRateModelV3Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ILinearInterestRateModelV3 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ILinearInterestRateModelV3;
  }
}