/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type { WATokenZapper, WATokenZapperInterface } from "../WATokenZapper";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "pool_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ForceApproveFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "SafeTransferFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "SafeTransferFromFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "deposit",
    outputs: [
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint16",
        name: "referralCode",
        type: "uint16",
      },
    ],
    name: "depositWithUnderlying",
    outputs: [
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pool",
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
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "previewDeposit",
    outputs: [
      {
        internalType: "uint256",
        name: "shares",
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
        name: "shares",
        type: "uint256",
      },
    ],
    name: "previewRedeem",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
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
        name: "shares",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "redeem",
    outputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unwrappedToken",
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
    name: "wrappedToken",
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
] as const;

const _bytecode =
  "0x60e06040523480156200001157600080fd5b506040516200105d3803806200105d83398101604081905262000034916200024f565b8080806001600160a01b03166080816001600160a01b031681525050806001600160a01b03166338d52e0f6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156200008f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620000b591906200024f565b6001600160a01b031660a052505060a0516001600160a01b031663a0c1f15e6040518163ffffffff1660e01b8152600401602060405180830381865afa15801562000104573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906200012a91906200024f565b6001600160a01b031660c0526200014062000149565b5062000281565b565b620001476200015760c05190565b60a0516200018181600019846001600160a01b03166200018560201b6200034a179092919060201c565b5050565b6200019a8363095ea7b360e01b8484620001f8565b620001f357620001b58363095ea7b360e01b846000620001f8565b1580620001d45750620001d28363095ea7b360e01b8484620001f8565b155b15620001f35760405163019be9a960e41b815260040160405180910390fd5b505050565b60006040518481528360048201528260248201526020600060448360008a5af1915050801562000247573d80156200023d57600160005114601f3d1116915062000245565b6000863b1191505b505b949350505050565b6000602082840312156200026257600080fd5b81516001600160a01b03811681146200027a57600080fd5b9392505050565b60805160a05160c051610d526200030b6000396000818161017401528181610855015281816108be0152610a3c01526000818161012a0152818161050201528181610747015281816109b401528181610a5d0152610ab30152600081816092015281816101f6015281816102ca0152818161047d0152818161060401526106ca0152610d526000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c8063996c6cc31161005b578063996c6cc314610125578063ba0876521461014c578063ef8b30f71461015f578063fde942ea1461017257600080fd5b806316f0115b1461008d578063421c7284146100de5780634cdad506146100ff5780636e553f6514610112575b600080fd5b6100b47f000000000000000000000000000000000000000000000000000000000000000081565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6100f16100ec366004610bc2565b610198565b6040519081526020016100d5565b6100f161010d366004610c09565b6101ad565b6100f1610120366004610c22565b610273565b6100b47f000000000000000000000000000000000000000000000000000000000000000081565b6100f161015a366004610c4e565b61027f565b6100f161016d366004610c09565b61028c565b7f00000000000000000000000000000000000000000000000000000000000000006100b4565b60006101a5848484610418565b949350505050565b6040517f4cdad50600000000000000000000000000000000000000000000000000000000815260048101829052600090819073ffffffffffffffffffffffffffffffffffffffff7f00000000000000000000000000000000000000000000000000000000000000001690634cdad50690602401602060405180830381865afa15801561023d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102619190610c8a565b905061026c816104f5565b9392505050565b600061026c83836105a9565b60006101a5848484610673565b60008061029883610743565b6040517fef8b30f7000000000000000000000000000000000000000000000000000000008152600481018290529091507f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063ef8b30f790602401602060405180830381865afa158015610326573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061026c9190610c8a565b610376837f095ea7b30000000000000000000000000000000000000000000000000000000084846107e6565b610413576103a7837f095ea7b3000000000000000000000000000000000000000000000000000000008460006107e6565b15806103dc57506103da837f095ea7b30000000000000000000000000000000000000000000000000000000084846107e6565b155b15610413576040517f19be9a9000000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050565b60008061042485610839565b6040517f6e37c0b30000000000000000000000000000000000000000000000000000000081526004810182905273ffffffffffffffffffffffffffffffffffffffff868116602483015261ffff861660448301529192507f000000000000000000000000000000000000000000000000000000000000000090911690636e37c0b3906064016020604051808303816000875af11580156104c8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104ec9190610c8a565b95945050505050565b6000670de0b6b3a76400007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16633ba0b9a96040518163ffffffff1660e01b8152600401602060405180830381865afa15801561056b573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061058f9190610c8a565b6105999084610ca3565b6105a39190610ce1565b92915050565b6000806105b584610839565b6040517f6e553f650000000000000000000000000000000000000000000000000000000081526004810182905273ffffffffffffffffffffffffffffffffffffffff85811660248301529192507f000000000000000000000000000000000000000000000000000000000000000090911690636e553f65906044016020604051808303816000875af115801561064f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101a59190610c8a565b6040517fba0876520000000000000000000000000000000000000000000000000000000081526004810184905230602482015273ffffffffffffffffffffffffffffffffffffffff828116604483015260009182917f0000000000000000000000000000000000000000000000000000000000000000169063ba087652906064016020604051808303816000875af1158015610713573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107379190610c8a565b90506104ec8185610897565b60007f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff16633ba0b9a96040518163ffffffff1660e01b8152600401602060405180830381865afa1580156107b0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107d49190610c8a565b610599670de0b6b3a764000084610ca3565b60006040518481528360048201528260248201526020600060448360008a5af191505080156101a5573d801561082857600160005114601f3d11169150610830565b6000863b1191505b50949350505050565b600061087d73ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000163330856108e5565b61088682610982565b9050610890610a37565b919050565b565b60006108a283610a81565b90506105a373ffffffffffffffffffffffffffffffffffffffff7f0000000000000000000000000000000000000000000000000000000000000000168383610af7565b60006323b872dd60e01b905060006040518281528560048201528460248201528360448201526020600060648360008b5af19150508015610943573d801561093957600160005114601f3d11169150610941565b6000873b1191505b505b8061097a576040517ff405907100000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b505050505050565b6040517fb6b55f25000000000000000000000000000000000000000000000000000000008152600481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff169063b6b55f25906024015b6020604051808303816000875af1158015610a13573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105a39190610c8a565b6108957f00000000000000000000000000000000000000000000000000000000000000007f0000000000000000000000000000000000000000000000000000000000000000610b59565b6040517f2e1a7d4d000000000000000000000000000000000000000000000000000000008152600481018290526000907f000000000000000000000000000000000000000000000000000000000000000073ffffffffffffffffffffffffffffffffffffffff1690632e1a7d4d906024016109f4565b610b23837fa9059cbb0000000000000000000000000000000000000000000000000000000084846107e6565b610413576040517ffb7f507900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b610b9a73ffffffffffffffffffffffffffffffffffffffff8316827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff61034a565b5050565b803573ffffffffffffffffffffffffffffffffffffffff8116811461089057600080fd5b600080600060608486031215610bd757600080fd5b83359250610be760208501610b9e565b9150604084013561ffff81168114610bfe57600080fd5b809150509250925092565b600060208284031215610c1b57600080fd5b5035919050565b60008060408385031215610c3557600080fd5b82359150610c4560208401610b9e565b90509250929050565b600080600060608486031215610c6357600080fd5b83359250610c7360208501610b9e565b9150610c8160408501610b9e565b90509250925092565b600060208284031215610c9c57600080fd5b5051919050565b80820281158282048414176105a3577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600082610d17577f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b50049056fea2646970667358221220262d05ba997199946051c7473211f51275096ec9ed288591226f02ef66642ae264736f6c63430008110033";

type WATokenZapperConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WATokenZapperConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WATokenZapper__factory extends ContractFactory {
  constructor(...args: WATokenZapperConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    pool_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<WATokenZapper> {
    return super.deploy(pool_, overrides || {}) as Promise<WATokenZapper>;
  }
  override getDeployTransaction(
    pool_: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(pool_, overrides || {});
  }
  override attach(address: string): WATokenZapper {
    return super.attach(address) as WATokenZapper;
  }
  override connect(signer: Signer): WATokenZapper__factory {
    return super.connect(signer) as WATokenZapper__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WATokenZapperInterface {
    return new utils.Interface(_abi) as WATokenZapperInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WATokenZapper {
    return new Contract(address, _abi, signerOrProvider) as WATokenZapper;
  }
}
