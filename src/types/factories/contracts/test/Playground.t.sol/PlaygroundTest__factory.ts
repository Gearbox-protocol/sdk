/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  PlaygroundTest,
  PlaygroundTestInterface,
} from "../../../../contracts/test/Playground.t.sol/PlaygroundTest";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "log",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "log_address",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "log_bytes",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "log_bytes32",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    name: "log_int",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "val",
        type: "address",
      },
    ],
    name: "log_named_address",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "val",
        type: "bytes",
      },
    ],
    name: "log_named_bytes",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "val",
        type: "bytes32",
      },
    ],
    name: "log_named_bytes32",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "val",
        type: "int256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
    ],
    name: "log_named_decimal_int",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "val",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "decimals",
        type: "uint256",
      },
    ],
    name: "log_named_decimal_uint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "int256",
        name: "val",
        type: "int256",
      },
    ],
    name: "log_named_int",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "val",
        type: "string",
      },
    ],
    name: "log_named_string",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "key",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "val",
        type: "uint256",
      },
    ],
    name: "log_named_uint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    name: "log_string",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "log_uint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "logs",
    type: "event",
  },
  {
    inputs: [],
    name: "IS_TEST",
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
    name: "failed",
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
    name: "setUp",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "test_01_test",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040526000805461ff01600160b01b031916757109709ecfa91a80626ff3989d68f67f5b1dd12d0001179055600560015534801561003e57600080fd5b506101208061004e6000396000f3fe6080604052348015600f57600080fd5b506004361060465760003560e01c80630a9254e414604b5780639319393e14607e578063ba414fa61460b9578063fa7626d41460de575b600080fd5b607c60008052600260205260377fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b55565b005b607c6001805460061790556000805260026020526115a97fac33ff75c19e70fe83507db0d683fd3465c996598dc972688b7ace676c89077b55565b60005460ca90610100900460ff1681565b604051901515815260200160405180910390f35b60005460ca9060ff168156fea2646970667358221220fe06d0b05d782a7d452d2c78962e347e45696f19f7aac5f0e5e4ed3ac6a1778d64736f6c634300080a0033";

type PlaygroundTestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PlaygroundTestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PlaygroundTest__factory extends ContractFactory {
  constructor(...args: PlaygroundTestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<PlaygroundTest> {
    return super.deploy(overrides || {}) as Promise<PlaygroundTest>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PlaygroundTest {
    return super.attach(address) as PlaygroundTest;
  }
  override connect(signer: Signer): PlaygroundTest__factory {
    return super.connect(signer) as PlaygroundTest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PlaygroundTestInterface {
    return new utils.Interface(_abi) as PlaygroundTestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PlaygroundTest {
    return new Contract(address, _abi, signerOrProvider) as PlaygroundTest;
  }
}