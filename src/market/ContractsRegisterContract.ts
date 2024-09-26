import { Address } from "viem";
import contractsRegister from "../../../forge-out/default/ContractsRegister.sol/ContractsRegister.json";
import { AP_CONTRACTS_REGISTER } from "../../core/addresses";
import { RawTx } from "../../core/transactions";
import { ContractInfo } from "../../deployer/types";
import { CoreFactory } from "../../factories/CoreFactory";
import { contractsRegisterAbi } from "../../generated";
import { BaseContract } from "../base/BaseContract";
import { ContractsRegisterState } from "../state/coreState";

type abi = typeof contractsRegisterAbi;

export class ContractsRegisterContract extends BaseContract<abi, CoreFactory> {
  get state(): ContractsRegisterState {
    return {
      ...this.contractData,
    };
  }

  public static deploy(factory: CoreFactory): ContractsRegisterContract {
    const { tx, contractAddress } = factory.v3.getCreate2DeployTx2({
      abi: contractsRegisterAbi,
      contractInfo: contractsRegister as ContractInfo,
      args: [factory.addressProviderContract.address],
      options: {
        verify: true,
      },
    });

    factory.addDeployTx([
      tx,
      factory.addressProvider.setAddress(
        AP_CONTRACTS_REGISTER,
        contractAddress,
        false,
      ),
    ]);

    return new ContractsRegisterContract({
      address: contractAddress,
      factory,
    });
  }

  public static async attach(factory: CoreFactory) {
    const address = factory.addressProviderContract.getAddress(
      AP_CONTRACTS_REGISTER,
    );
    factory.v3.logger.debug(`Attaching ContractsRegister at ${address}`);
    return new ContractsRegisterContract({
      address,
      factory,
    });
  }

  constructor(args: { address: Address; chainClient: Provider }) {
    super({ ...args, name: "ContractsRegister", abi: contractsRegisterAbi });
  }

  public addCreditManager(newCreditManager: Address): RawTx {
    return this.createRawTx({
      functionName: "addCreditManager",
      args: [newCreditManager],
    });
  }

  public addPool(newPoolAddress: Address): RawTx {
    return this.createRawTx({
      functionName: "addPool",
      args: [newPoolAddress],
    });
  }
}
