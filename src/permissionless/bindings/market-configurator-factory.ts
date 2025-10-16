import type { Address, PublicClient } from "viem";
import { iMarketConfiguratorFactoryAbi } from "../../abi/310/iMarketConfiguratorFactory.js";
import type { RawTx } from "../../sdk/types/index.js";
import { BaseContract } from "./base-contract";

const abi = iMarketConfiguratorFactoryAbi;

export class MarketConfiguratorFactoryContract extends BaseContract<
  typeof abi
> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "MarketConfiguratorFactory");
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
