import { Address, Log, parseEventLogs } from "viem";
import { AP_ACL } from "../../core/addresses";
import { RawTx } from "../../core/transactions";
import { CoreFactory } from "../../factories/CoreFactory";
import { aclAbi } from "../../generated";
import { BaseContract } from "../base/BaseContract";

import aCLContract from "../../../forge-out/default/ACL.sol/ACL.json";
import { ContractInfo } from "../../deployer/types";
import { ACLState } from "../state/coreState";

type abi = typeof aclAbi;

export class ACLContract extends BaseContract<abi, CoreFactory> {
  owner: Address;
  pausableAdmins: Set<Address> = new Set();
  unpausableAdmins: Set<Address> = new Set();

  public static deploy(factory: CoreFactory): ACLContract {
    const { tx, contractAddress } = factory.v3.getCreate2DeployTx2({
      abi: aclAbi,
      contractInfo: aCLContract as ContractInfo,
      options: {
        verify: true,
      },
    });

    factory.addDeployTx(tx);

    const contract = new ACLContract({
      address: contractAddress,
      factory,
    });

    contract.owner = factory.v3.governanceFactory.c2fContract.address;

    return contract;
  }

  public static async attach(factory: CoreFactory) {
    const address = factory.addressProviderContract.getAddress(AP_ACL);

    factory.v3.logger.debug(`Attaching ACL at ${address}`);
    const contract = new ACLContract({ address, factory });
    await contract.fetchState(factory.sdk.currentBlock);
    return contract;
  }

  constructor(args: { address: Address; chainClient: Provider }) {
    super({ ...args, name: "ACL", abi: aclAbi });
  }

  public addPausableAdmin(address: Address): RawTx {
    return this.createRawTx({
      functionName: "addPausableAdmin",
      args: [address],
    });
  }

  public addUnpausableAdmin(address: Address): RawTx {
    return this.createRawTx({
      functionName: "addUnpausableAdmin",
      args: [address],
    });
  }

  public transferOwnership(address: Address): RawTx {
    this.owner = address;

    return this.createRawTx({
      functionName: "transferOwnership",
      args: [address],
    });
  }

  public claimOwnership(): RawTx {
    return this.createRawTx({ functionName: "claimOwnership" });
  }

  public async fetchState(toBlock: bigint): Promise<void> {
    this.owner = (await this.contract.read.owner()) as Address;

    const logs = await this.v3.publicClient.getContractEvents({
      address: this.address,
      abi: this.abi,
      fromBlock: 0n,
      toBlock: BigInt(toBlock),
    });

    logs.forEach(e => {
      this.parseLog(e);
    });
  }

  public get state(): ACLState {
    return {
      ...this.contractData,
      owner: this.owner,
      pausableAdmins: Array.from(this.pausableAdmins),
      unpausableAdmins: Array.from(this.unpausableAdmins),
    };
  }

  protected parseLog(log: Log): void {
    const parsedLog = parseEventLogs({
      abi: this.abi,
      logs: [log],
    })[0];

    switch (parsedLog.eventName) {
      case "PausableAdminAdded":
        this.pausableAdmins.add(parsedLog.args.newAdmin);
        break;
      case "PausableAdminRemoved":
        this.pausableAdmins.delete(parsedLog.args.admin);
        break;
      case "UnpausableAdminAdded":
        this.unpausableAdmins.add(parsedLog.args.newAdmin);
        break;
      case "UnpausableAdminRemoved":
        this.unpausableAdmins.delete(parsedLog.args.admin);
        break;
      case "OwnershipTransferred":
        this.owner = parsedLog.args.newOwner;
        break;
    }
  }
}
