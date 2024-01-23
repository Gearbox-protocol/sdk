/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRouter, IRouterInterface } from "../IRouter";

const _abi = [
  {
    type: "function",
    name: "componentAddressById",
    inputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
      },
    ],
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
    name: "findAllSwaps",
    inputs: [
      {
        name: "swapTask",
        type: "tuple",
        internalType: "struct SwapTask",
        components: [
          {
            name: "swapOperation",
            type: "uint8",
            internalType: "enum SwapOperation",
          },
          {
            name: "creditAccount",
            type: "address",
            internalType: "address",
          },
          {
            name: "tokenIn",
            type: "address",
            internalType: "address",
          },
          {
            name: "tokenOut",
            type: "address",
            internalType: "address",
          },
          {
            name: "connectors",
            type: "address[]",
            internalType: "address[]",
          },
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "slippage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "externalSlippage",
            type: "bool",
            internalType: "bool",
          },
        ],
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct RouterResult[]",
        components: [
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasUsage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              {
                name: "target",
                type: "address",
                internalType: "address",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findBestClosePath",
    inputs: [
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "connectors",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "slippage",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "pathOptions",
        type: "tuple[]",
        internalType: "struct PathOption[]",
        components: [
          {
            name: "target",
            type: "address",
            internalType: "address",
          },
          {
            name: "option",
            type: "uint8",
            internalType: "uint8",
          },
          {
            name: "totalOptions",
            type: "uint8",
            internalType: "uint8",
          },
        ],
      },
      {
        name: "iterations",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "force",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasUsage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              {
                name: "target",
                type: "address",
                internalType: "address",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
        ],
      },
      {
        name: "gasPriceTargetRAY",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findOneTokenPath",
    inputs: [
      {
        name: "tokenIn",
        type: "address",
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tokenOut",
        type: "address",
        internalType: "address",
      },
      {
        name: "creditAccount",
        type: "address",
        internalType: "address",
      },
      {
        name: "connectors",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "slippage",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasUsage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              {
                name: "target",
                type: "address",
                internalType: "address",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "findOpenStrategyPath",
    inputs: [
      {
        name: "creditManager",
        type: "address",
        internalType: "address",
      },
      {
        name: "balances",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "balance",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "target",
        type: "address",
        internalType: "address",
      },
      {
        name: "connectors",
        type: "address[]",
        internalType: "address[]",
      },
      {
        name: "slippage",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Balance[]",
        components: [
          {
            name: "token",
            type: "address",
            internalType: "address",
          },
          {
            name: "balance",
            type: "uint256",
            internalType: "uint256",
          },
        ],
      },
      {
        name: "",
        type: "tuple",
        internalType: "struct RouterResult",
        components: [
          {
            name: "amount",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "gasUsage",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "calls",
            type: "tuple[]",
            internalType: "struct MultiCall[]",
            components: [
              {
                name: "target",
                type: "address",
                internalType: "address",
              },
              {
                name: "callData",
                type: "bytes",
                internalType: "bytes",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getGasPriceTokenOutRAY",
    inputs: [
      {
        name: "token",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "gasPrice",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isRouterConfigurator",
    inputs: [
      {
        name: "account",
        type: "address",
        internalType: "address",
      },
    ],
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
    name: "tokenTypes",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint8",
        internalType: "uint8",
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
  {
    type: "event",
    name: "ResolverUpdate",
    inputs: [
      {
        name: "ttIn",
        type: "uint8",
        indexed: true,
        internalType: "uint8",
      },
      {
        name: "ttOut",
        type: "uint8",
        indexed: true,
        internalType: "uint8",
      },
      {
        name: "rc",
        type: "uint8",
        indexed: true,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RouterComponentUpdate",
    inputs: [
      {
        name: "",
        type: "uint8",
        indexed: true,
        internalType: "uint8",
      },
      {
        name: "",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokenTypeUpdate",
    inputs: [
      {
        name: "tokenAddress",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "tt",
        type: "uint8",
        indexed: true,
        internalType: "uint8",
      },
    ],
    anonymous: false,
  },
] as const;

export class IRouter__factory {
  static readonly abi = _abi;
  static createInterface(): IRouterInterface {
    return new utils.Interface(_abi) as IRouterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IRouter {
    return new Contract(address, _abi, signerOrProvider) as IRouter;
  }
}