/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IStashFactory,
  IStashFactoryInterface,
} from "../../../../../contracts/test/sigp/Interfaces.sol/IStashFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "CreateStash",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IStashFactory__factory {
  static readonly abi = _abi;
  static createInterface(): IStashFactoryInterface {
    return new utils.Interface(_abi) as IStashFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): IStashFactory {
    return new Contract(address, _abi, signerOrProvider) as IStashFactory;
  }
}
