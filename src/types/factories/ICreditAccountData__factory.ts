/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { ICreditAccountData } from "../ICreditAccountData";

export class ICreditAccountData__factory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICreditAccountData {
    return new Contract(address, _abi, signerOrProvider) as ICreditAccountData;
  }
}

const _abi = [
  {
    inputs: [],
    name: "getCreditAccountDataExtended",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "address",
            name: "borrower",
            type: "address",
          },
          {
            internalType: "bool",
            name: "inUse",
            type: "bool",
          },
          {
            internalType: "address",
            name: "creditManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "underlyingToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "borrowedAmountPlusInterest",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "healthFactor",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowRate",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "balance",
                type: "uint256",
              },
            ],
            internalType: "struct DataTypes.TokenBalance[]",
            name: "balances",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "repayAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "liquidationAmount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "canBeClosed",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "borrowedAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "cumulativeIndexAtOpen",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "since",
            type: "uint256",
          },
        ],
        internalType: "struct DataTypes.CreditAccountDataExtended",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCreditManagerData",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "addr",
            type: "address",
          },
          {
            internalType: "bool",
            name: "hasAccount",
            type: "bool",
          },
          {
            internalType: "address",
            name: "underlyingToken",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isWETH",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "canBorrow",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "borrowRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxLeverageFactor",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableLiquidity",
            type: "uint256",
          },
          {
            internalType: "address[]",
            name: "allowedTokens",
            type: "address[]",
          },
          {
            components: [
              {
                internalType: "address",
                name: "allowedContract",
                type: "address",
              },
              {
                internalType: "address",
                name: "adapter",
                type: "address",
              },
            ],
            internalType: "struct DataTypes.ContractAdapter[]",
            name: "adapters",
            type: "tuple[]",
          },
        ],
        internalType: "struct DataTypes.CreditManagerData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
