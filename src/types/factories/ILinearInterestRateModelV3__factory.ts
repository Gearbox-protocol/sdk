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
    inputs: [
      {
        internalType: "uint256",
        name: "expectedLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableLiquidity",
        type: "uint256",
      },
    ],
    name: "availableToBorrow",
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
        name: "expectedLiquidity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "availableLiquidity",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "checkOptimalBorrowing",
        type: "bool",
      },
    ],
    name: "calcBorrowRate",
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
    name: "getModelParameters",
    outputs: [
      {
        internalType: "uint16",
        name: "U_1",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "U_2",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "R_base",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "R_slope1",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "R_slope2",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "R_slope3",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isBorrowingMoreU2Forbidden",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
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