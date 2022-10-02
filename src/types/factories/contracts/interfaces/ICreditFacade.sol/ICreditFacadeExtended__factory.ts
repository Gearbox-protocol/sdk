/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ICreditFacadeExtended,
  ICreditFacadeExtendedInterface,
} from "../../../../contracts/interfaces/ICreditFacade.sol/ICreditFacadeExtended";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "onBehalfOf",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "addCollateral",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "decreaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "disableToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "enableToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "increaseDebt",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
        internalType: "struct Balance[]",
        name: "expected",
        type: "tuple[]",
      },
    ],
    name: "revertIfReceivedLessThan",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ICreditFacadeExtended__factory {
  static readonly abi = _abi;
  static createInterface(): ICreditFacadeExtendedInterface {
    return new utils.Interface(_abi) as ICreditFacadeExtendedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ICreditFacadeExtended {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ICreditFacadeExtended;
  }
}