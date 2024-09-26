import type { Address, DecodeFunctionDataReturnType, Log } from "viem";
import { bytesToString, parseEventLogs, toBytes } from "viem";

import { iAddressProviderV3_1Abi } from "../../compressors";
import { NO_VERSION } from "../../core/addresses";
import type { Provider } from "../../deployer/Provider";
import { BaseContract } from "../../sdk/base/BaseContract";
import type { AddressProviderV3State } from "../../sdk/state/coreState";

type abi = typeof iAddressProviderV3_1Abi;

export class AddressProviderContractV3_1 extends BaseContract<abi> {
  #addresses: Record<string, Record<number, Address>> = {};
  versions: Record<string, Set<number>> = {};
  latest: Record<string, number> = {};

  constructor(args: { address: Address; chainClient: Provider }) {
    super({ ...args, name: "AddressProviderV3", abi: iAddressProviderV3_1Abi });
  }

  parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setAddress":
        if (params.args.length !== 3) {
          const [key, saveVersion] = params.args;
          return [key, `${saveVersion}`];
        }
        const [key, value, saveVersion] = params.args;
        return [bytesToString(toBytes(key)), value, `${saveVersion}`];
      default:
        return undefined;
    }
  }

  protected setInternalAddress(key: string, address: Address, version: number) {
    if (!this.#addresses[key]) {
      this.#addresses[key] = {};
    }
    this.#addresses[key][version] = address;

    if (!this.latest[key] || version > this.latest[key]) {
      this.latest[key] = version;
    }

    if (!this.versions[key]) {
      this.versions[key] = new Set();
    }

    this.versions[key].add(version);
  }

  public getAddress(contract: string, version = NO_VERSION): Address {
    if (!this.#addresses[contract]) {
      throw new Error(`Address ${contract}, version: ${version} not found`);
    }

    const result = this.#addresses[contract][version];
    if (!result) {
      throw new Error(`Address ${contract}, version: ${version} not found`);
    }

    return result;
  }

  public getLatestVersion(contract: string): Address {
    if (!this.latest[contract]) {
      throw new Error(`Latest version for ${contract} not found`);
    }

    this.v3.logger.debug(
      `Latest version found for ${contract} : ${this.latest[contract]}`,
    );

    return this.getAddress(contract, this.latest[contract]);
  }

  async fetchState(toBlock: bigint): Promise<void> {
    const entries = await this.contract.read.getAllSavedContracts({
      blockNumber: toBlock,
    });

    entries.forEach(log => {
      this.setInternalAddress(log.key, log.value, Number(log.version));
    });

    this.version = 3_10;
  }

  public get state(): AddressProviderV3State {
    return {
      ...this.contractData,
      addresses: this.#addresses,
    };
  }

  protected parseLog(log: Log): void {
    const parsedLog = parseEventLogs({
      abi: this.abi,
      logs: [log],
    })[0];

    switch (parsedLog.eventName) {
      case "SetAddress":
        const parsedLog2 = parseEventLogs({
          abi: this.abi,
          eventName: "SetAddress",
          logs: [log],
        })[0];
        const key = parsedLog2.args.key;

        this.setInternalAddress(
          key,
          parsedLog.args.value as Address,
          Number(parsedLog2.args.version),
        );
        break;

      default:
        this.v3.logger.warn(`Unknown event: ${parsedLog.eventName}`);
        break;
    }
  }
}
