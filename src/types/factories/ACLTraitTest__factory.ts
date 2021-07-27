/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { ACLTraitTest } from "../ACLTraitTest";

export class ACLTraitTest__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    addressProvider: string,
    overrides?: Overrides
  ): Promise<ACLTraitTest> {
    return super.deploy(
      addressProvider,
      overrides || {}
    ) as Promise<ACLTraitTest>;
  }
  getDeployTransaction(
    addressProvider: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(addressProvider, overrides || {});
  }
  attach(address: string): ACLTraitTest {
    return super.attach(address) as ACLTraitTest;
  }
  connect(signer: Signer): ACLTraitTest__factory {
    return super.connect(signer) as ACLTraitTest__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ACLTraitTest {
    return new Contract(address, _abi, signerOrProvider) as ACLTraitTest;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "addressProvider",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "accessConfiguratorOnly",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accessWhenNotPaused",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "accessWhenPaused",
    outputs: [],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
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
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610a05380380610a058339818101604052602081101561003357600080fd5b81019080805190602001909291905050508060008060006101000a81548160ff0219169083151502179055508073ffffffffffffffffffffffffffffffffffffffff1663087376956040518163ffffffff1660e01b815260040160206040518083038186803b1580156100a557600080fd5b505afa1580156100b9573d6000803e3d6000fd5b505050506040513d60208110156100cf57600080fd5b8101908080519060200190929190505050600060016101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050506108d4806101316000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806319df69ae146100675780633f4ba83a1461007157806350a472ae1461007b5780635c975abb146100855780638456cb59146100a55780638def0c0b146100af575b600080fd5b61006f6100b9565b005b61007961025c565b005b610083610407565b005b61008d610484565b60405180821515815260200191505060405180910390f35b6100ad61049a565b005b6100b7610645565b005b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16635f259aba336040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561014257600080fd5b505afa158015610156573d6000803e3d6000fd5b505050506040513d602081101561016c57600080fd5b81019080805190602001909291905050506040518060400160405280600281526020017f4c3300000000000000000000000000000000000000000000000000000000000081525090610259576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561021e578082015181840152602081019050610203565b50505050905090810190601f16801561024b5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b50565b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663d4eb5db0336040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b1580156102e557600080fd5b505afa1580156102f9573d6000803e3d6000fd5b505050506040513d602081101561030f57600080fd5b81019080805190602001909291905050506040518060400160405280600281526020017f4c31000000000000000000000000000000000000000000000000000000000000815250906103fc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156103c15780820151818401526020810190506103a6565b50505050905090810190601f1680156103ee5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506104056106c1565b565b61040f610484565b15610482576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b565b60008060009054906101000a900460ff16905090565b600060019054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16633a41ec64336040518263ffffffff1660e01b8152600401808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060206040518083038186803b15801561052357600080fd5b505afa158015610537573d6000803e3d6000fd5b505050506040513d602081101561054d57600080fd5b81019080805190602001909291905050506040518060400160405280600281526020017f4c310000000000000000000000000000000000000000000000000000000000008152509061063a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b838110156105ff5780820151818401526020810190506105e4565b50505050905090810190601f16801561062c5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b506106436107ab565b565b61064d610484565b6106bf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b565b6106c9610484565b61073b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260148152602001807f5061757361626c653a206e6f742070617573656400000000000000000000000081525060200191505060405180910390fd5b60008060006101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa61077e610896565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b6107b3610484565b15610826576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260108152602001807f5061757361626c653a207061757365640000000000000000000000000000000081525060200191505060405180910390fd5b60016000806101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258610869610896565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390a1565b60003390509056fea2646970667358221220460561ed1455124dd18b937159ac968a107e1f7b6e5f13d3fa02bd4cf659a32164736f6c63430007060033";
