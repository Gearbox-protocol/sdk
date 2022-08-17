/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IVoting,
  IVotingInterface,
} from "../../../../../contracts/test/sigp/Interfaces.sol/IVoting";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getVote",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
    name: "vote_for_gauge_weights",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IVoting__factory {
  static readonly abi = _abi;
  static createInterface(): IVotingInterface {
    return new utils.Interface(_abi) as IVotingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): IVoting {
    return new Contract(address, _abi, signerOrProvider) as IVoting;
  }
}
