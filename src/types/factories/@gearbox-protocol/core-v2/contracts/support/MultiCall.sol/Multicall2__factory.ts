/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  Multicall2,
  Multicall2Interface,
} from "../../../../../../@gearbox-protocol/core-v2/contracts/support/MultiCall.sol/Multicall2";

const _abi = [
  {
    inputs: [
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
        internalType: "struct Multicall2.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "returnData",
        type: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
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
        internalType: "struct Multicall2.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "blockAndAggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall2.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    name: "getBlockHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBlockNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentBlockCoinbase",
    outputs: [
      {
        internalType: "address",
        name: "coinbase",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentBlockDifficulty",
    outputs: [
      {
        internalType: "uint256",
        name: "difficulty",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentBlockGasLimit",
    outputs: [
      {
        internalType: "uint256",
        name: "gaslimit",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentBlockTimestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "timestamp",
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
        name: "addr",
        type: "address",
      },
    ],
    name: "getEthBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLastBlockHash",
    outputs: [
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "requireSuccess",
        type: "bool",
      },
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
        internalType: "struct Multicall2.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "tryAggregate",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall2.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "requireSuccess",
        type: "bool",
      },
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
        internalType: "struct Multicall2.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "tryBlockAndAggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "blockHash",
        type: "bytes32",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall2.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610b51806100206000396000f3fe608060405234801561001057600080fd5b50600436106100d45760003560e01c806372425d9d11610081578063bce38bd71161005b578063bce38bd714610181578063c3077fa9146101a1578063ee82ac5e146101b457600080fd5b806372425d9d1461016757806386d516e81461016d578063a8b0574e1461017357600080fd5b8063399542e9116100b2578063399542e91461011757806342cbb15c146101395780634d2301cc1461013f57600080fd5b80630f28c97d146100d9578063252dba42146100ee57806327e86d6e1461010f575b600080fd5b425b6040519081526020015b60405180910390f35b6101016100fc3660046107df565b6101c6565b6040516100e5929190610896565b6100db610373565b61012a61012536600461091e565b610386565b6040516100e5939291906109db565b436100db565b6100db61014d366004610a03565b73ffffffffffffffffffffffffffffffffffffffff163190565b446100db565b456100db565b6040514181526020016100e5565b61019461018f36600461091e565b61039e565b6040516100e59190610a25565b61012a6101af3660046107df565b610599565b6100db6101c2366004610a38565b4090565b8051439060609067ffffffffffffffff8111156101e5576101e56105b6565b60405190808252806020026020018201604052801561021857816020015b60608152602001906001900390816102035790505b50905060005b835181101561036d5760008085838151811061023c5761023c610a51565b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff1686848151811061027057610270610a51565b6020026020010151602001516040516102899190610a80565b6000604051808303816000865af19150503d80600081146102c6576040519150601f19603f3d011682016040523d82523d6000602084013e6102cb565b606091505b50915091508161033c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4d756c746963616c6c206167677265676174653a2063616c6c206661696c656460448201526064015b60405180910390fd5b8084848151811061034f5761034f610a51565b602002602001018190525050508061036690610acb565b905061021e565b50915091565b6000610380600143610b04565b40905090565b4380406060610395858561039e565b90509250925092565b6060815167ffffffffffffffff8111156103ba576103ba6105b6565b60405190808252806020026020018201604052801561040057816020015b6040805180820190915260008152606060208201528152602001906001900390816103d85790505b50905060005b82518110156105925760008084838151811061042457610424610a51565b60200260200101516000015173ffffffffffffffffffffffffffffffffffffffff1685848151811061045857610458610a51565b6020026020010151602001516040516104719190610a80565b6000604051808303816000865af19150503d80600081146104ae576040519150601f19603f3d011682016040523d82523d6000602084013e6104b3565b606091505b5091509150851561054b578161054b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602160248201527f4d756c746963616c6c32206167677265676174653a2063616c6c206661696c6560448201527f64000000000000000000000000000000000000000000000000000000000000006064820152608401610333565b604051806040016040528083151581526020018281525084848151811061057457610574610a51565b602002602001018190525050508061058b90610acb565b9050610406565b5092915050565b60008060606105a9600185610386565b9196909550909350915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040805190810167ffffffffffffffff81118282101715610608576106086105b6565b60405290565b604051601f82017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016810167ffffffffffffffff81118282101715610655576106556105b6565b604052919050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461068157600080fd5b919050565b6000601f838184011261069857600080fd5b8235602067ffffffffffffffff808311156106b5576106b56105b6565b8260051b6106c483820161060e565b93845286810183019383810190898611156106de57600080fd5b84890192505b858310156107d2578235848111156106fc5760008081fd5b890160407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0828d0381018213156107335760008081fd5b61073b6105e5565b61074689850161065d565b8152828401358881111561075a5760008081fd5b8085019450508d603f8501126107705760008081fd5b8884013588811115610784576107846105b6565b6107938a848e8401160161060e565b92508083528e848287010111156107aa5760008081fd5b808486018b85013760009083018a0152808901919091528452505091840191908401906106e4565b9998505050505050505050565b6000602082840312156107f157600080fd5b813567ffffffffffffffff81111561080857600080fd5b61081484828501610686565b949350505050565b60005b8381101561083757818101518382015260200161081f565b83811115610846576000848401525b50505050565b6000815180845261086481602086016020860161081c565b601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0169290920160200192915050565b600060408201848352602060408185015281855180845260608601915060608160051b870101935082870160005b82811015610910577fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffa08887030184526108fe86835161084c565b955092840192908401906001016108c4565b509398975050505050505050565b6000806040838503121561093157600080fd5b8235801515811461094157600080fd5b9150602083013567ffffffffffffffff81111561095d57600080fd5b61096985828601610686565b9150509250929050565b6000815180845260208085019450848260051b860182860160005b858110156109ce578383038952815180511515845285015160408685018190526109ba8186018361084c565b9a87019a945050509084019060010161098e565b5090979650505050505050565b8381528260208201526060604082015260006109fa6060830184610973565b95945050505050565b600060208284031215610a1557600080fd5b610a1e8261065d565b9392505050565b602081526000610a1e6020830184610973565b600060208284031215610a4a57600080fd5b5035919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60008251610a9281846020870161081c565b9190910192915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415610afd57610afd610a9c565b5060010190565b600082821015610b1657610b16610a9c565b50039056fea264697066735822122015cf07205b7ef3c673bc94b34d8c7ae4e14c64e7966eb6b62d1841b161f6c8f664736f6c634300080a0033";

type Multicall2ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: Multicall2ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Multicall2__factory extends ContractFactory {
  constructor(...args: Multicall2ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Multicall2> {
    return super.deploy(overrides || {}) as Promise<Multicall2>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): Multicall2 {
    return super.attach(address) as Multicall2;
  }
  override connect(signer: Signer): Multicall2__factory {
    return super.connect(signer) as Multicall2__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): Multicall2Interface {
    return new utils.Interface(_abi) as Multicall2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Multicall2 {
    return new Contract(address, _abi, signerOrProvider) as Multicall2;
  }
}
