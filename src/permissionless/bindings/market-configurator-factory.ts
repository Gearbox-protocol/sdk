import type { Address, Chain, PublicClient, Transport } from "viem";
import { iMarketConfiguratorFactoryAbi } from "../../abi/310/iMarketConfiguratorFactory.js";
import type { RawTx } from "../../onchain/index.js";
import { BaseContract } from "../../onchain/index.js";
import { Addresses } from "../deployment/addresses.js";
import { KILL_SWITCH_PROXY } from "../utils/literals.js";
import { BytecodeRepositoryContract } from "./bytecode-repository.js";
import {
  KillSwitchProxyContract,
  killSwitchProxySalt,
} from "./kill-switch-proxy.js";

const abi = iMarketConfiguratorFactoryAbi;

export class MarketConfiguratorFactoryContract extends BaseContract<
  typeof abi
> {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, { abi, addr, name: "MarketConfiguratorFactory" });
  }

  createMarketConfiguratorTx(args: {
    emergencyAdmin: Address;
    adminFeeTreasury: Address;
    curatorName: string;
    deployGovernor: boolean;
  }): RawTx {
    return this.createRawTx({
      functionName: "createMarketConfigurator",
      args: [
        args.emergencyAdmin,
        args.adminFeeTreasury,
        args.curatorName,
        args.deployGovernor,
      ],
    });
  }

  /**
   * Builds transactions that deploy market configurator with kill switch proxy as its emergency admin:
   * 1. kill switch proxy deployment via bytecode repository (skipped if already deployed)
   * 2. market configurator creation with proxy as emergency admin
   *
   * Transactions must be sent in this order by `admin`, e.g. as one Safe batch.
   * When `deployGovernor` is true, proxy also becomes governor's veto admin.
   *
   * @param args.admin - address that sends transactions, becomes market configurator admin
   * @param args.emergencyAdmin - address that executes emergency actions through the proxy
   * @param args.killSwitchOwner - address that can kill the proxy, defaults to `admin`
   * @throws {KillSwitchProxyNotAllowedError} if kill switch proxy is not allowed in bytecode repository,
   * use {@link createMarketConfiguratorTx} to deploy market configurator without it
   */
  async createMarketConfiguratorWithKillSwitchTxs(args: {
    admin: Address;
    emergencyAdmin: Address;
    killSwitchOwner?: Address;
    adminFeeTreasury: Address;
    curatorName: string;
    deployGovernor: boolean;
  }): Promise<{
    killSwitchProxy: Address;
    /**
     * True if proxy with the same deployer, owner, caller and curator name already exists,
     * in which case it is reused and its deployment transaction is omitted
     */
    isKillSwitchProxyDeployed: boolean;
    txs: RawTx[];
  }> {
    const { admin, emergencyAdmin, killSwitchOwner, ...rest } = args;
    const bcr = new BytecodeRepositoryContract(
      Addresses.BYTECODE_REPOSITORY,
      this.client,
    );
    const proxy = await KillSwitchProxyContract.prepareDeploy(bcr, {
      deployer: admin,
      owner: killSwitchOwner ?? admin,
      caller: emergencyAdmin,
      salt: killSwitchProxySalt(args.curatorName),
    });
    if (proxy.isKilled) {
      throw new Error(
        `${KILL_SWITCH_PROXY} ${proxy.address} is already deployed and killed`,
      );
    }

    return {
      killSwitchProxy: proxy.address,
      isKillSwitchProxyDeployed: proxy.isAlreadyDeployed,
      txs: [
        ...(proxy.isAlreadyDeployed ? [] : [proxy.tx]),
        this.createMarketConfiguratorTx({
          ...rest,
          emergencyAdmin: proxy.address,
        }),
      ],
    };
  }

  async getMarketConfigurators(): Promise<Address[]> {
    return [...(await this.contract.read.getMarketConfigurators())];
  }

  async getShutdownMarketConfigurators(): Promise<Address[]> {
    return [...(await this.contract.read.getShutdownMarketConfigurators())];
  }

  async syncMarketConfigurators(
    fromBlock: bigint,
    toBlock: bigint,
  ): Promise<{
    newMarketConfigurators: Array<{
      address: Address;
      name: string;
      atBlock: number;
    }>;
    shutdownMarketConfigurators: Array<{ address: Address; atBlock: number }>;
  }> {
    const createEvents = await this.getEvents(
      "CreateMarketConfigurator",
      fromBlock,
      toBlock,
    );

    const shutdownEvents = await this.getEvents(
      "ShutdownMarketConfigurator",
      fromBlock,
      toBlock,
    );

    return {
      newMarketConfigurators: (createEvents || [])
        .map(event => ({
          address: event.args.marketConfigurator as Address,
          name: event.args.name!,
          atBlock: Number(event.blockNumber),
        }))
        .filter(marketConfigurator => marketConfigurator.address !== undefined),
      shutdownMarketConfigurators: (shutdownEvents || [])
        .map(event => ({
          address: event.args.marketConfigurator as Address,
          atBlock: Number(event.blockNumber),
        }))
        .filter(marketConfigurator => marketConfigurator.address !== undefined),
    };
  }
}
