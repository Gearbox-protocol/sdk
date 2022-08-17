/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  TreasuryMock,
  TreasuryMockInterface,
} from "../../../../../contracts/test/mocks/dao/TreasuryMock";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "NewDonation",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x6080604052348015600f57600080fd5b5060788061001e6000396000f3fe608060405236603d576040513481527f8ffa785350fa6b5fee858c4ca63eff2704b9538ff446bd673c1f6c11fc7aca169060200160405180910390a1005b600080fdfea264697066735822122021be454ea40e918ac93e02604b693891335b2f626cae855d903cebb95ed57ac164736f6c634300080a0033";

type TreasuryMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TreasuryMockConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TreasuryMock__factory extends ContractFactory {
  constructor(...args: TreasuryMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): Promise<TreasuryMock> {
    return super.deploy(overrides || {}) as Promise<TreasuryMock>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TreasuryMock {
    return super.attach(address) as TreasuryMock;
  }
  override connect(signer: Signer): TreasuryMock__factory {
    return super.connect(signer) as TreasuryMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TreasuryMockInterface {
    return new utils.Interface(_abi) as TreasuryMockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider,
  ): TreasuryMock {
    return new Contract(address, _abi, signerOrProvider) as TreasuryMock;
  }
}
