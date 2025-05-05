import { type Abi, type Address, hexToString, isHex, stringToHex } from "viem";

import type { BaseContractOptions } from "../../base/BaseContract.js";
import { BaseContract } from "../../base/index.js";
import type { VersionRange } from "../../constants/index.js";
import { NO_VERSION } from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { AddressProviderV3StateHuman } from "../../types/index.js";
import { TypedObjectUtils } from "../../utils/mappers.js";
import type { AddressProviderState } from "./types.js";

export default abstract class AbstractAddressProviderContract<
  abi extends Abi | readonly unknown[],
> extends BaseContract<abi> {
  #addresses: Record<string, Record<number, Address>> = {};

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

  public getLatest(
    contract: string,
    range: VersionRange,
  ): [address: Address, version: number] | undefined {
    const allVersions = this.#addresses[contract];
    if (!allVersions) {
      return undefined;
    }
    let version = 0;
    let address: Address | undefined;
    for (const [vStr, a] of TypedObjectUtils.entries(allVersions)) {
      const v = Number(vStr);
      if (v >= range[0] && v <= range[1] && v >= version) {
        version = v;
        address = a;
      }
    }
    if (!address) {
      return undefined;
    }
    return [address, version];
  }

  public mustGetLatest(
    contract: string,
    range: VersionRange,
  ): [address: Address, version: number] {
    const result = this.getLatest(contract, range);
    if (!result) {
      throw new Error(`no address found for ${contract} in range ${range}`);
    }
    return result;
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
