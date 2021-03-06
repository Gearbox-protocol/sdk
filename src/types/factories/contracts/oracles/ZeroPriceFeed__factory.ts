/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ZeroPriceFeed,
  ZeroPriceFeedInterface,
} from "../../../contracts/oracles/ZeroPriceFeed";

const _abi = [
  {
    inputs: [],
    name: "NotImplementedException",
    type: "error",
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
    name: "dependsOnAddress",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
    stateMutability: "view",
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
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceFeedType",
    outputs: [
      {
        internalType: "enum PriceFeedType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "skipPriceCheck",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506102ed806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063975c19ab1161005b578063975c19ab146101205780639a6fc8f514610138578063d62ada1114610182578063feaf968c1461018a57600080fd5b8063313ce5671461008d5780633fd0875f146100ac57806354fd4d50146100c15780637284e416146100d7575b600080fd5b610095600881565b60405160ff90911681526020015b60405180910390f35b6100b4600581565b6040516100a391906101d0565b6100c9600181565b6040519081526020016100a3565b6101136040518060400160405280600e81526020017f5a65726f2070726963656665656400000000000000000000000000000000000081525081565b6040516100a39190610211565b610128600081565b60405190151581526020016100a3565b61014b610146366004610284565b610196565b6040805169ffffffffffffffffffff968716815260208101959095528401929092526060830152909116608082015260a0016100a3565b610128600181565b6001600042808361014b565b60008060008060006040517f24e46f7000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b602081016006831061020b577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91905290565b600060208083528351808285015260005b8181101561023e57858101830151858201604001528201610222565b81811115610250576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b60006020828403121561029657600080fd5b813569ffffffffffffffffffff811681146102b057600080fd5b939250505056fea2646970667358221220d5e9d60bf947599ccc8338dfb9025b9f46960934f18c6d921b7cdc583333b22164736f6c634300080a0033";

type ZeroPriceFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ZeroPriceFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ZeroPriceFeed__factory extends ContractFactory {
  constructor(...args: ZeroPriceFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ZeroPriceFeed> {
    return super.deploy(overrides || {}) as Promise<ZeroPriceFeed>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ZeroPriceFeed {
    return super.attach(address) as ZeroPriceFeed;
  }
  override connect(signer: Signer): ZeroPriceFeed__factory {
    return super.connect(signer) as ZeroPriceFeed__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ZeroPriceFeedInterface {
    return new utils.Interface(_abi) as ZeroPriceFeedInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ZeroPriceFeed {
    return new Contract(address, _abi, signerOrProvider) as ZeroPriceFeed;
  }
}
