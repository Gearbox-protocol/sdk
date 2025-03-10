import { type Abi, type Address, hexToString, isHex, stringToHex } from "viem";

import type { BaseContractOptions } from "../../base/BaseContract.js";
import { BaseContract } from "../../base/index.js";
import { NO_VERSION } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { AddressProviderV3StateHuman } from "../../types/index.js";
import type { AddressProviderState } from "./types.js";

export default abstract class AbstractAddressProviderContract<
  abi extends Abi | readonly unknown[],
> extends BaseContract<abi> {
  #addresses: Record<string, Record<number, Address>> = {};
  #latest: Record<string, number> = {};

  constructor(
    sdk: GearboxSDK,
    args: BaseContractOptions<abi>,
    addresses: Record<string, Record<number, Address>> = {},
  ) {
    super(sdk, args);
    this.#addresses = addresses;
  }

  protected setInternalAddress(key: string, address: Address, version: number) {
    let k = isHex(key) ? hexToString(key, { size: 32 }) : key;
    if (!this.#addresses[k]) {
      this.#addresses[k] = {};
    }
    this.#addresses[k][version] = address;
    if (!this.#latest[k] || version > this.#latest[key]) {
      this.#latest[k] = version;
    }
    this.logger?.debug(`Set address for ${k}@${version} to ${address}`);
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

  public get state(): AddressProviderState {
    return {
      baseParams: {
        addr: this.address,
        version: BigInt(this.version),
        contractType: stringToHex(this.contractType, { size: 32 }),
        serializedParams: "0x0",
      },
      addresses: this.#addresses,
    };
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
