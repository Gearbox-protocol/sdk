/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ACL, ACLInterface } from "../../../contracts/core/ACL";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "PausableAdminAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "PausableAdminRemoved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "UnpausableAdminAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "UnpausableAdminRemoved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "addPausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "addUnpausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isConfigurator",
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
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "isPausableAdmin",
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
    inputs: [
      {
        internalType: "address",
        name: "addr",
        type: "address",
      },
    ],
    name: "isUnpausableAdmin",
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
    name: "owner",
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
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "pausableAdminSet",
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
    inputs: [
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "removePausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "removeUnpausableAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
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
    ],
    name: "unpausableAdminSet",
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
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b61090e8061007e6000396000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c8063732818191161008c578063adce758d11610066578063adce758d14610215578063ba306df114610228578063d4eb5db01461023b578063f2fde38b1461027457600080fd5b806373281819146101b7578063819ad68e146101da5780638da5cb5b146101ed57600080fd5b806354fd4d50116100bd57806354fd4d501461016a5780635f259aba14610180578063715018a6146101af57600080fd5b806335914829146100e45780633a41ec641461011c5780634910832f14610155575b600080fd5b6101076100f236600461089b565b60016020526000908152604090205460ff1681565b60405190151581526020015b60405180910390f35b61010761012a36600461089b565b73ffffffffffffffffffffffffffffffffffffffff1660009081526001602052604090205460ff1690565b61016861016336600461089b565b610287565b005b610172600181565b604051908152602001610113565b61010761018e36600461089b565b60005473ffffffffffffffffffffffffffffffffffffffff91821691161490565b610168610387565b6101076101c536600461089b565b60026020526000908152604090205460ff1681565b6101686101e836600461089b565b610414565b60005460405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610113565b61016861022336600461089b565b61050c565b61016861023636600461089b565b610601565b61010761024936600461089b565b73ffffffffffffffffffffffffffffffffffffffff1660009081526002602052604090205460ff1690565b61016861028236600461089b565b6106f6565b60005473ffffffffffffffffffffffffffffffffffffffff16331461030d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064015b60405180910390fd5b73ffffffffffffffffffffffffffffffffffffffff8116600081815260016020819052604080832080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0016909217909155517fae26b1cfe9454ba87274a4e8330b6654684362d0f3d7bbd17f7449a1d38387c69190a250565b60005473ffffffffffffffffffffffffffffffffffffffff163314610408576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610304565b6104126000610826565b565b60005473ffffffffffffffffffffffffffffffffffffffff163314610495576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610304565b73ffffffffffffffffffffffffffffffffffffffff811660008181526002602052604080822080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00166001179055517fd400da6c0c0a894dacc0981730b88af0545d00272ee8fff1437bf560ff245fc49190a250565b60005473ffffffffffffffffffffffffffffffffffffffff16331461058d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610304565b73ffffffffffffffffffffffffffffffffffffffff811660008181526002602052604080822080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055517f1998397e7203f7baca9d6f41b9e4da6e768daac5caad4234fb9bf5869d2715459190a250565b60005473ffffffffffffffffffffffffffffffffffffffff163314610682576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610304565b73ffffffffffffffffffffffffffffffffffffffff811660008181526001602052604080822080547fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00169055517f28b01395b7e25d20552a0c8dc8ecd3b1d4abc986f14dad7885fd45b6fd73c8d99190a250565b60005473ffffffffffffffffffffffffffffffffffffffff163314610777576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610304565b73ffffffffffffffffffffffffffffffffffffffff811661081a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f64647265737300000000000000000000000000000000000000000000000000006064820152608401610304565b61082381610826565b50565b6000805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000602082840312156108ad57600080fd5b813573ffffffffffffffffffffffffffffffffffffffff811681146108d157600080fd5b939250505056fea26469706673582212204712efbfe997070def77285a5b8753bc882b62da2133ce1937ad26cd2b48e49864736f6c634300080a0033";

type ACLConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ACLConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ACL__factory extends ContractFactory {
  constructor(...args: ACLConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ACL> {
    return super.deploy(overrides || {}) as Promise<ACL>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ACL {
    return super.attach(address) as ACL;
  }
  override connect(signer: Signer): ACL__factory {
    return super.connect(signer) as ACL__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ACLInterface {
    return new utils.Interface(_abi) as ACLInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): ACL {
    return new Contract(address, _abi, signerOrProvider) as ACL;
  }
}
