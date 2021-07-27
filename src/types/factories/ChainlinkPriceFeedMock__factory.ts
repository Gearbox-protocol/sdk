/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, BigNumberish } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { ChainlinkPriceFeedMock } from "../ChainlinkPriceFeedMock";

export class ChainlinkPriceFeedMock__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _price: BigNumberish,
    _decimals: BigNumberish,
    overrides?: Overrides
  ): Promise<ChainlinkPriceFeedMock> {
    return super.deploy(
      _price,
      _decimals,
      overrides || {}
    ) as Promise<ChainlinkPriceFeedMock>;
  }
  getDeployTransaction(
    _price: BigNumberish,
    _decimals: BigNumberish,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_price, _decimals, overrides || {});
  }
  attach(address: string): ChainlinkPriceFeedMock {
    return super.attach(address) as ChainlinkPriceFeedMock;
  }
  connect(signer: Signer): ChainlinkPriceFeedMock__factory {
    return super.connect(signer) as ChainlinkPriceFeedMock__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ChainlinkPriceFeedMock {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as ChainlinkPriceFeedMock;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "int256",
        name: "_price",
        type: "int256",
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    name: "getRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "",
        type: "int256",
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
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "",
        type: "int256",
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
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "newPrice",
        type: "int256",
      },
    ],
    name: "setPrice",
    outputs: [],
    stateMutability: "nonpayable",
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
    stateMutability: "pure",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b506040516103b23803806103b28339818101604052604081101561003357600080fd5b810190808051906020019092919080519060200190929190505050816000819055508060ff1660808160ff1660f81b81525050505060805160f81c61032d6100856000398061022d525061032d6000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c8063313ce5671461006757806354fd4d50146100885780637284e416146100a65780639a6fc8f514610129578063f7a30806146101ab578063feaf968c146101d9575b600080fd5b61006f61022b565b604051808260ff16815260200191505060405180910390f35b61009061024f565b6040518082815260200191505060405180910390f35b6100ae610258565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100ee5780820151818401526020810190506100d3565b50505050905090810190601f16801561011b5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101616004803603602081101561013f57600080fd5b81019080803569ffffffffffffffffffff169060200190929190505050610295565b604051808669ffffffffffffffffffff1681526020018581526020018481526020018381526020018269ffffffffffffffffffff1681526020019550505050505060405180910390f35b6101d7600480360360208110156101c157600080fd5b81019080803590602001909291905050506102c2565b005b6101e16102cc565b604051808669ffffffffffffffffffff1681526020018581526020018481526020018381526020018269ffffffffffffffffffff1681526020019550505050505060405180910390f35b7f000000000000000000000000000000000000000000000000000000000000000081565b60006001905090565b60606040518060400160405280600c81526020017f7072696365206f7261636c650000000000000000000000000000000000000000815250905090565b60008060008060006050600054600143036001430360026050039450945094509450945091939590929450565b8060008190555050565b600080600080600060506000546001430360014303600260500394509450945094509450909192939456fea2646970667358221220569149313cece4a0112fb9367ef21ea2fb6db5057b8ae2542e7e5d482ac9420764736f6c63430007060033";
