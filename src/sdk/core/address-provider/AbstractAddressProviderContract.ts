import type { Abi, Address } from "viem";

import { BaseContract } from "../../base";
import { NO_VERSION } from "../../constants";
import type { AddressProviderV3StateHuman } from "../../types";

export default abstract class AbstractAddressProviderContract<
  abi extends Abi | readonly unknown[],
> extends BaseContract<abi> {
  #addresses: Record<string, Record<number, Address>> = {};
  #versions: Record<string, Set<number>> = {};
  #latest: Record<string, number> = {};

  protected setInternalAddress(key: string, address: Address, version: number) {
    if (!this.#addresses[key]) {
      this.#addresses[key] = {};
    }
    this.#addresses[key][version] = address;

    if (!this.#latest[key] || version > this.#latest[key]) {
      this.#latest[key] = version;
    }

    if (!this.#versions[key]) {
      this.#versions[key] = new Set();
    }

    this.#versions[key].add(version);
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
    if (!this.#latest[contract]) {
      throw new Error(`Latest version for ${contract} not found`);
    }

    this.logger?.debug(
      `Latest version found for ${contract} : ${this.#latest[contract]}`,
    );

    return this.getAddress(contract, this.#latest[contract]);
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
}
