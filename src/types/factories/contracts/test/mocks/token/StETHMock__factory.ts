/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  StETHMock,
  StETHMockInterface,
} from "../../../../../contracts/test/mocks/token/StETHMock";

const _abi = [
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
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spender",
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
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
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
        name: "_account",
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
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_subtractedValue",
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
        internalType: "uint256",
        name: "_sharesAmount",
        type: "uint256",
      },
    ],
    name: "getPooledEthByShares",
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
        internalType: "uint256",
        name: "_ethAmount",
        type: "uint256",
      },
    ],
    name: "getSharesByPooledEth",
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
    name: "getTotalPooledEther",
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
    name: "getTotalShares",
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
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_addedValue",
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
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    name: "sharesOf",
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
    name: "symbol",
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
    inputs: [],
    name: "totalPooledEtherSynced",
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
    name: "totalSharesSynced",
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
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
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
        name: "_sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "_recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
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
];

const _bytecode =
  "0x60806040526000600255600060035534801561001a57600080fd5b50610c818061002a6000396000f3fe608060405234801561001057600080fd5b50600436106101365760003560e01c80637a28fb88116100b2578063bdd17e1c11610081578063d5002f2e11610066578063d5002f2e1461029e578063dd62ed3e146102a6578063f5eb42dc146102ec57600080fd5b8063bdd17e1c1461028c578063cdb9a21c1461029557600080fd5b80637a28fb881461021a57806395d89b411461022d578063a457c2d714610266578063a9059cbb1461027957600080fd5b806323b872dd1161010957806337cfdaca116100ee57806337cfdaca146101a957806339509351146101f457806370a082311461020757600080fd5b806323b872dd146101d2578063313ce567146101e557600080fd5b806306fdde031461013b578063095ea7b31461018657806318160ddd146101a957806319208451146101bf575b600080fd5b60408051808201909152601781527f4c6971756964207374616b656420457468657220322e3000000000000000000060208201525b60405161017d9190610a0c565b60405180910390f35b610199610194366004610aa8565b6102ff565b604051901515815260200161017d565b6101b1610315565b60405190815260200161017d565b6101b16101cd366004610ad2565b610325565b6101996101e0366004610aeb565b610365565b6040516012815260200161017d565b610199610202366004610aa8565b610455565b6101b1610215366004610b27565b610498565b6101b1610228366004610ad2565b6104cd565b60408051808201909152600581527f73744554480000000000000000000000000000000000000000000000000000006020820152610170565b610199610274366004610aa8565b6104f9565b610199610287366004610aa8565b6105ad565b6101b160035481565b6101b160025481565b6101b16105ba565b6101b16102b4366004610b42565b73ffffffffffffffffffffffffffffffffffffffff918216600090815260016020908152604080832093909416825291909152205490565b6101b16102fa366004610b27565b6105c5565b600061030c3384846105f0565b50600192915050565b600061032060035490565b905090565b60008061033160035490565b9050806103415750600092915050565b61035e8161035861035160025490565b8690610758565b90610764565b9392505050565b73ffffffffffffffffffffffffffffffffffffffff831660009081526001602090815260408083203384529091528120548281101561042b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f5452414e534645525f414d4f554e545f455843454544535f414c4c4f57414e4360448201527f450000000000000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b610436858585610770565b61044a853361044584876107f5565b6105f0565b506001949350505050565b33600081815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff87168452909152812054909161030c9185906104459086610801565b73ffffffffffffffffffffffffffffffffffffffff81166000908152602081905260408120546104c7906104cd565b92915050565b6000806104d960025490565b9050806104e95750600092915050565b61035e8161035861035160035490565b33600090815260016020908152604080832073ffffffffffffffffffffffffffffffffffffffff8616845290915281205482811015610594576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f4445435245415345445f414c4c4f57414e43455f42454c4f575f5a45524f00006044820152606401610422565b6105a3338561044584876107f5565b5060019392505050565b600061030c338484610770565b600061032060025490565b73ffffffffffffffffffffffffffffffffffffffff81166000908152602081905260408120546104c7565b73ffffffffffffffffffffffffffffffffffffffff831661066d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601960248201527f415050524f56455f46524f4d5f5a45524f5f41444452455353000000000000006044820152606401610422565b73ffffffffffffffffffffffffffffffffffffffff82166106ea576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f415050524f56455f544f5f5a45524f5f414444524553530000000000000000006044820152606401610422565b73ffffffffffffffffffffffffffffffffffffffff83811660008181526001602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b600061035e8284610ba4565b600061035e8284610be1565b600061077b82610325565b905061078884848361080d565b8273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516107e791815260200190565b60405180910390a350505050565b600061035e8284610c1c565b600061035e8284610c33565b73ffffffffffffffffffffffffffffffffffffffff831661088a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601e60248201527f5452414e534645525f46524f4d5f5448455f5a45524f5f4144445245535300006044820152606401610422565b73ffffffffffffffffffffffffffffffffffffffff8216610907576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601c60248201527f5452414e534645525f544f5f5448455f5a45524f5f41444452455353000000006044820152606401610422565b73ffffffffffffffffffffffffffffffffffffffff831660009081526020819052604090205480821115610997576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f5452414e534645525f414d4f554e545f455843454544535f42414c414e4345006044820152606401610422565b6109a181836107f5565b73ffffffffffffffffffffffffffffffffffffffff80861660009081526020819052604080822093909355908516815220546109dd9083610801565b73ffffffffffffffffffffffffffffffffffffffff909316600090815260208190526040902092909255505050565b600060208083528351808285015260005b81811015610a3957858101830151858201604001528201610a1d565b81811115610a4b576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b803573ffffffffffffffffffffffffffffffffffffffff81168114610aa357600080fd5b919050565b60008060408385031215610abb57600080fd5b610ac483610a7f565b946020939093013593505050565b600060208284031215610ae457600080fd5b5035919050565b600080600060608486031215610b0057600080fd5b610b0984610a7f565b9250610b1760208501610a7f565b9150604084013590509250925092565b600060208284031215610b3957600080fd5b61035e82610a7f565b60008060408385031215610b5557600080fd5b610b5e83610a7f565b9150610b6c60208401610a7f565b90509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610bdc57610bdc610b75565b500290565b600082610c17577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b500490565b600082821015610c2e57610c2e610b75565b500390565b60008219821115610c4657610c46610b75565b50019056fea26469706673582212202b9be39340b19fe992a0de0f9a6f84ef193f8c9c929b42d356f542ae700eb7d064736f6c634300080a0033";

type StETHMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StETHMockConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StETHMock__factory extends ContractFactory {
  constructor(...args: StETHMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<StETHMock> {
    return super.deploy(overrides || {}) as Promise<StETHMock>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): StETHMock {
    return super.attach(address) as StETHMock;
  }
  override connect(signer: Signer): StETHMock__factory {
    return super.connect(signer) as StETHMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StETHMockInterface {
    return new utils.Interface(_abi) as StETHMockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): StETHMock {
    return new Contract(address, _abi, signerOrProvider) as StETHMock;
  }
}
