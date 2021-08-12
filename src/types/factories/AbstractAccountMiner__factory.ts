/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  AbstractAccountMiner,
  AbstractAccountMinerInterface,
} from "../AbstractAccountMiner";

const _abi = [
  {
    inputs: [],
    name: "accountFactory",
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
    name: "kind",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "user",
        type: "address",
      },
    ],
    name: "mineAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class AbstractAccountMiner__factory {
  static readonly abi = _abi;
  static createInterface(): AbstractAccountMinerInterface {
    return new utils.Interface(_abi) as AbstractAccountMinerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AbstractAccountMiner {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as AbstractAccountMiner;
  }
}
