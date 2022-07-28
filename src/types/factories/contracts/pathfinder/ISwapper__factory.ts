/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  ISwapper,
  ISwapperInterface,
} from "../../../contracts/pathfinder/ISwapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "adapter",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "slippageFactor",
        type: "uint256",
      },
    ],
    name: "getBestPairSwap",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "address",
                name: "target",
                type: "address",
              },
              {
                internalType: "bytes",
                name: "callData",
                type: "bytes",
              },
            ],
            internalType: "struct MultiCall",
            name: "multiCall",
            type: "tuple",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "found",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "gasUsage",
            type: "uint256",
          },
        ],
        internalType: "struct SwapQuote",
        name: "quote",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class ISwapper__factory {
  static readonly abi = _abi;
  static createInterface(): ISwapperInterface {
    return new utils.Interface(_abi) as ISwapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ISwapper {
    return new Contract(address, _abi, signerOrProvider) as ISwapper;
  }
}