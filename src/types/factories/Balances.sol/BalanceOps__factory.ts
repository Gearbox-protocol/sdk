/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  BalanceOps,
  BalanceOpsInterface,
} from "../../Balances.sol/BalanceOps";

const _abi = [
  {
    type: "error",
    name: "UnknownToken",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
  },
] as const;

const _bytecode =
  "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea26469706673582212202cd85281473ba5d2eb326a239f40c712998afdd2df8ba536e1f7bd18397b589664736f6c63430008110033";

type BalanceOpsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: BalanceOpsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class BalanceOps__factory extends ContractFactory {
  constructor(...args: BalanceOpsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      BalanceOps & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): BalanceOps__factory {
    return super.connect(runner) as BalanceOps__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): BalanceOpsInterface {
    return new Interface(_abi) as BalanceOpsInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): BalanceOps {
    return new Contract(address, _abi, runner) as unknown as BalanceOps;
  }
}
