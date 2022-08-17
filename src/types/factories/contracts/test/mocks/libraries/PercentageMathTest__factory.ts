/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  PercentageMathTest,
  PercentageMathTestInterface,
} from "../../../../../contracts/test/mocks/libraries/PercentageMathTest";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "percentage",
        type: "uint256",
      },
    ],
    name: "percentDiv",
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
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "percentage",
        type: "uint256",
      },
    ],
    name: "percentMul",
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
  "0x608060405234801561001057600080fd5b50610343806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806346c840bb1461003b5780634bf6a8f014610060575b600080fd5b61004e610049366004610190565b610073565b60405190815260200160405180910390f35b61004e61006e366004610190565b610088565b600061007f8383610094565b90505b92915050565b600061007f8383610146565b60408051808201909152600281527f4d3300000000000000000000000000000000000000000000000000000000000060208201526000908261010c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161010391906101b2565b60405180910390fd5b50600061011a600284610283565b9050828161012a61271087610297565b61013491906102d4565b61013e9190610283565b949350505050565b6000821580610153575081155b1561016057506000610082565b61271061016e6002826102ec565b61ffff1661017c8486610297565b61018691906102d4565b61007f9190610283565b600080604083850312156101a357600080fd5b50508035926020909101359150565b600060208083528351808285015260005b818110156101df578581018301518582016040015282016101c3565b818111156101f1576000604083870101525b50601f017fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe016929092016040019392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60008261029257610292610225565b500490565b6000817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156102cf576102cf610254565b500290565b600082198211156102e7576102e7610254565b500190565b600061ffff8084168061030157610301610225565b9216919091049291505056fea26469706673582212208f38722287bb8f6292d8b0a108329767d6ca6a1cb2ba155f6a167014b5872bc364736f6c634300080a0033";

type PercentageMathTestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PercentageMathTestConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PercentageMathTest__factory extends ContractFactory {
  constructor(...args: PercentageMathTestConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<PercentageMathTest> {
    return super.deploy(overrides || {}) as Promise<PercentageMathTest>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PercentageMathTest {
    return super.attach(address) as PercentageMathTest;
  }
  override connect(signer: Signer): PercentageMathTest__factory {
    return super.connect(signer) as PercentageMathTest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PercentageMathTestInterface {
    return new utils.Interface(_abi) as PercentageMathTestInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): PercentageMathTest {
    return new Contract(address, _abi, signerOrProvider) as PercentageMathTest;
  }
}
