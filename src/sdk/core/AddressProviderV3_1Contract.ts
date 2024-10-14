import type {
  Address,
  ContractEventName,
  DecodeFunctionDataReturnType,
  Log,
} from "viem";
import { bytesToString, parseEventLogs, toBytes } from "viem";

import { iAddressProviderV3_1Abi } from "../abi";
import { BaseContract } from "../base";
import { NO_VERSION } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { AddressProviderV3StateHuman } from "../types";

type abi = typeof iAddressProviderV3_1Abi;

export class AddressProviderContractV3_1 extends BaseContract<abi> {
  #addresses: Record<string, Record<number, Address>> = {};
  versions: Record<string, Set<number>> = {};
  latest: Record<string, number> = {};

  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "AddressProviderV3",
      abi: iAddressProviderV3_1Abi,
    });
  }

  public parseFunctionParams(
    params: DecodeFunctionDataReturnType<abi>,
  ): Array<string> | undefined {
    switch (params.functionName) {
      case "setAddress": {
        if (params.args.length !== 3) {
          const [key, saveVersion] = params.args;
          return [key, `${saveVersion}`];
        }
        const [key, value, saveVersion] = params.args;
        return [bytesToString(toBytes(key)), value, `${saveVersion}`];
      }
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

    this.logger?.debug(
      `Latest version found for ${contract} : ${this.latest[contract]}`,
    );

    return this.getAddress(contract, this.latest[contract]);
  }

  public async fetchState(blockNumber?: bigint): Promise<void> {
    const entries = await this.contract.read.getAllSavedContracts({
      blockNumber,
    });
    for (const log of entries) {
      this.setInternalAddress(log.key, log.value, Number(log.version));
    }
  }

  public override stateHuman(raw = true): AddressProviderV3StateHuman {
    return {
      ...super.stateHuman(raw),
      addresses: Object.entries(this.#addresses)
        .map(([key, value]) => {
          return Object.entries(value).map(([version, address]) => {
            return {
              key,
              version,
              address: this.sdk.provider.addressLabels.get(address),
            };
          });
        })
        .reduce(
          (acc, vals) => {
            for (const val of vals) {
              if (!acc[val.key]) {
                acc[val.key] = {};
              }
              acc[val.key][val.version as unknown as number] = val.address;
            }
            return acc;
          },
          {} as Record<string, Record<number, string>>,
        ),
    };
  }

  public override processLog(
    log: Log<
      bigint,
      number,
      false,
      undefined,
      undefined,
      abi,
      ContractEventName<abi>
    >,
  ): void {
    switch (log.eventName) {
      case "SetAddress": {
        const parsedLog2 = parseEventLogs({
          abi: this.abi,
          eventName: "SetAddress",
          logs: [log],
        })[0];
        const key = parsedLog2.args.key;

        this.setInternalAddress(
          key,
          log.args.value as Address,
          Number(parsedLog2.args.version),
        );
        break;
      }
      default:
        this.logger?.warn(`Unknown event: ${log.eventName}`);
        break;
    }
  }
}
