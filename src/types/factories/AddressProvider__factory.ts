/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  AddressProvider,
  AddressProviderInterface,
} from "../AddressProvider";

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
        internalType: "bytes32",
        name: "service",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "AddressSet",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "addresses",
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
    name: "claimOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getACL",
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
    name: "getAccountFactory",
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
    name: "getContractsRegister",
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
    name: "getDataCompressor",
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
    name: "getGearToken",
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
    name: "getLeveragedActions",
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
    name: "getPriceOracle",
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
    name: "getTreasuryContract",
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
    name: "getWETHGateway",
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
    name: "getWethToken",
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
    name: "pendingOwner",
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
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setACL",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setAccountFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setContractsRegister",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setDataCompressor",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setGearToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setLeveragedActions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setPriceOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setTreasuryContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setWETHGateway",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setWethToken",
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
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361005f565b60405130906f20a2222922a9a9afa82927ab24a222a960811b907fb37614c7d254ea8d16eb81fa11dddaeb266aa8ba4917980859c7740aff30c69190600090a36100af565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b610c4c806100be6000396000f3fe608060405234801561001057600080fd5b50600436106101b95760003560e01c806377532ed9116100f9578063bcaead9811610097578063ce3c4ae411610071578063ce3c4ae414610350578063e30c397814610363578063f2fde38b14610383578063fca513a81461039657600080fd5b8063bcaead9814610322578063c5120b3914610335578063c513c9bb1461034857600080fd5b80638da5cb5b116100d35780638da5cb5b146102e15780639068a868146102ff578063addc1a7614610307578063affd92431461031a57600080fd5b806377532ed9146102b35780637b6757ff146102bb57806386e09c08146102ce57600080fd5b80634c252f911161016657806354fd4d501161014057806354fd4d5014610253578063699f200f14610262578063715018a61461029857806376aad605146102a057600080fd5b80634c252f91146102305780634e71e0c814610238578063530e784f1461024057600080fd5b806321da58371161019757806321da58371461020d57806326c74fc31461022057806344b885631461022857600080fd5b8063060678c2146101be57806308737695146101f05780631ed65110146101f8575b600080fd5b6101c661039e565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b6101c66103ce565b61020b610206366004610b54565b6103f9565b005b61020b61021b366004610b54565b61042e565b6101c6610460565b6101c661048b565b6101c66104b6565b61020b6104e1565b61020b61024e366004610b54565b6105d9565b604051600281526020016101e7565b6101c6610270366004610b91565b60026020526000908152604090205473ffffffffffffffffffffffffffffffffffffffff1681565b61020b61060b565b61020b6102ae366004610b54565b61061f565b6101c6610651565b61020b6102c9366004610b54565b61067c565b61020b6102dc366004610b54565b6106ae565b60005473ffffffffffffffffffffffffffffffffffffffff166101c6565b6101c66106e0565b61020b610315366004610b54565b61070b565b6101c661073d565b61020b610330366004610b54565b610768565b61020b610343366004610b54565b61079a565b6101c66107cc565b61020b61035e366004610b54565b6107f7565b6001546101c69073ffffffffffffffffffffffffffffffffffffffff1681565b61020b610391366004610b54565b610829565b6101c661091b565b60006103c97f444154415f434f4d50524553534f520000000000000000000000000000000000610942565b905090565b60006103c97f41434c0000000000000000000000000000000000000000000000000000000000610942565b6104016109e0565b61042b7f54524541535552595f434f4e545241435400000000000000000000000000000082610a61565b50565b6104366109e0565b61042b7f574554485f47415445574159000000000000000000000000000000000000000082610a61565b60006103c97f54524541535552595f434f4e5452414354000000000000000000000000000000610942565b60006103c97f4c45564552414745445f414354494f4e53000000000000000000000000000000610942565b60006103c97f574554485f544f4b454e00000000000000000000000000000000000000000000610942565b60015473ffffffffffffffffffffffffffffffffffffffff16331461058d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602660248201527f436c61696d61626c653a2053656e646572206973206e6f742070656e64696e6760448201527f206f776e6572000000000000000000000000000000000000000000000000000060648201526084015b60405180910390fd5b6001546105af9073ffffffffffffffffffffffffffffffffffffffff16610adf565b600180547fffffffffffffffffffffffff0000000000000000000000000000000000000000169055565b6105e16109e0565b61042b7f50524943455f4f5241434c45000000000000000000000000000000000000000082610a61565b6106136109e0565b61061d6000610adf565b565b6106276109e0565b61042b7f41434c000000000000000000000000000000000000000000000000000000000082610a61565b60006103c97f574554485f474154455741590000000000000000000000000000000000000000610942565b6106846109e0565b61042b7f4c45564552414745445f414354494f4e5300000000000000000000000000000082610a61565b6106b66109e0565b61042b7f574554485f544f4b454e0000000000000000000000000000000000000000000082610a61565b60006103c97f4143434f554e545f464143544f52590000000000000000000000000000000000610942565b6107136109e0565b61042b7f4143434f554e545f464143544f5259000000000000000000000000000000000082610a61565b60006103c97f474541525f544f4b454e00000000000000000000000000000000000000000000610942565b6107706109e0565b61042b7f474541525f544f4b454e0000000000000000000000000000000000000000000082610a61565b6107a26109e0565b61042b7f444154415f434f4d50524553534f52000000000000000000000000000000000082610a61565b60006103c97f434f4e5452414354535f52454749535445520000000000000000000000000000610942565b6107ff6109e0565b61042b7f434f4e5452414354535f5245474953544552000000000000000000000000000082610a61565b6108316109e0565b73ffffffffffffffffffffffffffffffffffffffff81166108d4576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602860248201527f436c61696d61626c653a206e6577206f776e657220697320746865207a65726f60448201527f20616464726573730000000000000000000000000000000000000000000000006064820152608401610584565b600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b60006103c97f50524943455f4f5241434c4500000000000000000000000000000000000000005b6000818152600260209081526040808320548151808301909252600382527f41503100000000000000000000000000000000000000000000000000000000009282019290925273ffffffffffffffffffffffffffffffffffffffff90911690816109d9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105849190610baa565b5092915050565b60005473ffffffffffffffffffffffffffffffffffffffff16331461061d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610584565b60008281526002602052604080822080547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff85169081179091559051909184917fb37614c7d254ea8d16eb81fa11dddaeb266aa8ba4917980859c7740aff30c6919190a35050565b6000805473ffffffffffffffffffffffffffffffffffffffff8381167fffffffffffffffffffffffff0000000000000000000000000000000000000000831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600060208284031215610b6657600080fd5b813573ffffffffffffffffffffffffffffffffffffffff81168114610b8a57600080fd5b9392505050565b600060208284031215610ba357600080fd5b5035919050565b600060208083528351808285015260005b81811015610bd757858101830151858201604001528201610bbb565b5060006040828601015260407fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0601f830116850101925050509291505056fea2646970667358221220d865081ac9311bd785cd06675a874c9e753a771029aca0949220de5801df3b1364736f6c63430008110033";

type AddressProviderConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AddressProviderConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AddressProvider__factory extends ContractFactory {
  constructor(...args: AddressProviderConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<AddressProvider> {
    return super.deploy(overrides || {}) as Promise<AddressProvider>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): AddressProvider {
    return super.attach(address) as AddressProvider;
  }
  override connect(signer: Signer): AddressProvider__factory {
    return super.connect(signer) as AddressProvider__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AddressProviderInterface {
    return new utils.Interface(_abi) as AddressProviderInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AddressProvider {
    return new Contract(address, _abi, signerOrProvider) as AddressProvider;
  }
}
