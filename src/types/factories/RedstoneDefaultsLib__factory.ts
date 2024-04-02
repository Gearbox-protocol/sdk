/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../common";
import type {
  RedstoneDefaultsLib,
  RedstoneDefaultsLibInterface,
} from "../RedstoneDefaultsLib";

const _abi = [
  {
    type: "error",
    name: "TimestampFromTooLongFuture",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "blockTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "TimestampIsTooOld",
    inputs: [
      {
        name: "receivedTimestampSeconds",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "blockTimestamp",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
] as const;

const _bytecode =
  "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212200b260d0f7178561c06e9cc5fb9e72c8331183e1136d95997ca349ddb3afedf4464736f6c63430008110033";

type RedstoneDefaultsLibConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RedstoneDefaultsLibConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RedstoneDefaultsLib__factory extends ContractFactory {
  constructor(...args: RedstoneDefaultsLibConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<RedstoneDefaultsLib> {
    return super.deploy(overrides || {}) as Promise<RedstoneDefaultsLib>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): RedstoneDefaultsLib {
    return super.attach(address) as RedstoneDefaultsLib;
  }
  override connect(signer: Signer): RedstoneDefaultsLib__factory {
    return super.connect(signer) as RedstoneDefaultsLib__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RedstoneDefaultsLibInterface {
    return new utils.Interface(_abi) as RedstoneDefaultsLibInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RedstoneDefaultsLib {
    return new Contract(address, _abi, signerOrProvider) as RedstoneDefaultsLib;
  }
}
