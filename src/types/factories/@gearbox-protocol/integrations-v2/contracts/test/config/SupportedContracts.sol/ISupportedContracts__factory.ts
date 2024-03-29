/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ISupportedContracts,
  ISupportedContractsInterface,
} from "../../../../../../../@gearbox-protocol/integrations-v2/contracts/test/config/SupportedContracts.sol/ISupportedContracts";

const _abi = [
  {
    inputs: [
      {
        internalType: "enum Contracts",
        name: "c",
        type: "uint8",
      },
    ],
    name: "addressOf",
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
    name: "contractCount",
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
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "contractIndex",
    outputs: [
      {
        internalType: "enum Contracts",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum Contracts",
        name: "c",
        type: "uint8",
      },
    ],
    name: "nameOf",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export class ISupportedContracts__factory {
  static readonly abi = _abi;
  static createInterface(): ISupportedContractsInterface {
    return new utils.Interface(_abi) as ISupportedContractsInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ISupportedContracts {
    return new Contract(address, _abi, signerOrProvider) as ISupportedContracts;
  }
}
