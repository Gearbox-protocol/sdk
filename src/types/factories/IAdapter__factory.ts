/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAdapter, IAdapterInterface } from "../IAdapter";

const _abi = [
  {
    type: "function",
    name: "_gearboxAdapterType",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "enum AdapterType",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "_gearboxAdapterVersion",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint16",
        internalType: "uint16",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addressProvider",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "creditManager",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetContract",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },
] as const;

export class IAdapter__factory {
  static readonly abi = _abi;
  static createInterface(): IAdapterInterface {
    return new utils.Interface(_abi) as IAdapterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IAdapter {
    return new Contract(address, _abi, signerOrProvider) as IAdapter;
  }
}