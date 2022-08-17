/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ERC20ApproveRestrictedFalse,
  ERC20ApproveRestrictedFalseInterface,
} from "../../../../../../contracts/test/mocks/token/ERC20ApproveRestricted.sol/ERC20ApproveRestrictedFalse";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
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
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
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
        name: "user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
    name: "balanceOf",
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
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
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
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
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
    inputs: [],
    name: "totalSupply",
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
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
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
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604080516020808201808452600080845284519283019094529281528151919290916200004291600391620000d1565b50805162000058906004906020840190620000d1565b505050620000756200006f6200007b60201b60201c565b6200007f565b620001b4565b3390565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b828054620000df9062000177565b90600052602060002090601f0160209004810192826200010357600085556200014e565b82601f106200011e57805160ff19168380011785556200014e565b828001600101855582156200014e579182015b828111156200014e57825182559160200191906001019062000131565b506200015c92915062000160565b5090565b5b808211156200015c576000815560010162000161565b600181811c908216806200018c57607f821691505b60208210811415620001ae57634e487b7160e01b600052602260045260246000fd5b50919050565b610e3b80620001c46000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c8063715018a61161008c578063a457c2d711610066578063a457c2d7146101e7578063a9059cbb146101fa578063dd62ed3e1461020d578063f2fde38b1461025357600080fd5b8063715018a6146101ad5780638da5cb5b146101b757806395d89b41146101df57600080fd5b806323b872dd116100c857806323b872dd14610142578063313ce56714610155578063395093511461016457806370a082311461017757600080fd5b806306fdde03146100ef578063095ea7b31461010d57806318160ddd14610130575b600080fd5b6100f7610266565b6040516101049190610c1b565b60405180910390f35b61012061011b366004610cb7565b6102f8565b6040519015158152602001610104565b6002545b604051908152602001610104565b610120610150366004610ce1565b610358565b60405160128152602001610104565b610120610172366004610cb7565b610443565b610134610185366004610d1d565b73ffffffffffffffffffffffffffffffffffffffff1660009081526020819052604090205490565b6101b561048c565b005b60055460405173ffffffffffffffffffffffffffffffffffffffff9091168152602001610104565b6100f7610519565b6101206101f5366004610cb7565b610528565b610120610208366004610cb7565b610600565b61013461021b366004610d3f565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b6101b5610261366004610d1d565b61060d565b60606003805461027590610d72565b80601f01602080910402602001604051908101604052809291908181526020018280546102a190610d72565b80156102ee5780601f106102c3576101008083540402835291602001916102ee565b820191906000526020600020905b8154815290600101906020018083116102d157829003601f168201915b5050505050905090565b33600090815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff861684529091528120548110801561033657508115155b1561034357506000610352565b61034e33848461073d565b5060015b92915050565b60006103658484846108f0565b73ffffffffffffffffffffffffffffffffffffffff841660009081526001602090815260408083203384529091529020548281101561042b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206160448201527f6c6c6f77616e636500000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b610438853385840361073d565b506001949350505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909161034e918590610487908690610dc6565b61073d565b60055473ffffffffffffffffffffffffffffffffffffffff16331461050d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610422565b6105176000610ba4565b565b60606004805461027590610d72565b33600090815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff86168452909152812054828110156105e9576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f7760448201527f207a65726f0000000000000000000000000000000000000000000000000000006064820152608401610422565b6105f6338585840361073d565b5060019392505050565b600061034e3384846108f0565b60055473ffffffffffffffffffffffffffffffffffffffff16331461068e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610422565b73ffffffffffffffffffffffffffffffffffffffff8116610731576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f64647265737300000000000000000000000000000000000000000000000000006064820152608401610422565b61073a81610ba4565b50565b73ffffffffffffffffffffffffffffffffffffffff83166107df576040517f08c379a0000000000000000000000000000000000000000000000000000000008152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f2061646460448201527f72657373000000000000000000000000000000000000000000000000000000006064820152608401610422565b73ffffffffffffffffffffffffffffffffffffffff8216610882576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f20616464726560448201527f73730000000000000000000000000000000000000000000000000000000000006064820152608401610422565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b73ffffffffffffffffffffffffffffffffffffffff8316610993576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f20616460448201527f64726573730000000000000000000000000000000000000000000000000000006064820152608401610422565b73ffffffffffffffffffffffffffffffffffffffff8216610a36576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201527f65737300000000000000000000000000000000000000000000000000000000006064820152608401610422565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205481811015610aec576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e742065786365656473206260448201527f616c616e636500000000000000000000000000000000000000000000000000006064820152608401610422565b73ffffffffffffffffffffffffffffffffffffffff808516600090815260208190526040808220858503905591851681529081208054849290610b30908490610dc6565b925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610b9691815260200190565b60405180910390a350505050565b6005805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b600060208083528351808285015260005b81811015610c4857858101830151858201604001528201610c2c565b81811115610c5a576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610cb257600080fd5b919050565b60008060408385031215610cca57600080fd5b610cd383610c8e565b946020939093013593505050565b600080600060608486031215610cf657600080fd5b610cff84610c8e565b9250610d0d60208501610c8e565b9150604084013590509250925092565b600060208284031215610d2f57600080fd5b610d3882610c8e565b9392505050565b60008060408385031215610d5257600080fd5b610d5b83610c8e565b9150610d6960208401610c8e565b90509250929050565b600181811c90821680610d8657607f821691505b60208210811415610dc0577f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b50919050565b60008219821115610e00577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b50019056fea264697066735822122046ab9b2ff246a21fe95c48d51fda8c67c187c16ac22893aa37d4d531643fa5e364736f6c634300080a0033";

type ERC20ApproveRestrictedFalseConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ERC20ApproveRestrictedFalseConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ERC20ApproveRestrictedFalse__factory extends ContractFactory {
  constructor(...args: ERC20ApproveRestrictedFalseConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<ERC20ApproveRestrictedFalse> {
    return super.deploy(
      overrides || {},
    ) as Promise<ERC20ApproveRestrictedFalse>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): ERC20ApproveRestrictedFalse {
    return super.attach(address) as ERC20ApproveRestrictedFalse;
  }
  override connect(signer: Signer): ERC20ApproveRestrictedFalse__factory {
    return super.connect(signer) as ERC20ApproveRestrictedFalse__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ERC20ApproveRestrictedFalseInterface {
    return new utils.Interface(_abi) as ERC20ApproveRestrictedFalseInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): ERC20ApproveRestrictedFalse {
    return new Contract(
      address,
      _abi,
      signerOrProvider,
    ) as ERC20ApproveRestrictedFalse;
  }
}
