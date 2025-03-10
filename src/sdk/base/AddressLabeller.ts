import type { Address } from "viem";

import { NOT_DEPLOYED } from "../constants";
import { AddressMap } from "../utils";
import type { IAddressLabeller } from "./IAddressLabeller";

/**
 * Helper class to be used during transition from v3 to v3.1
 */
export class AddressLabeller implements IAddressLabeller {
  #labels = new AddressMap<string>(undefined, "addressLabeller");

  public set(
    address: Address,
    label: string | ((oldLabel?: string) => string),
  ): void {
    if (address === NOT_DEPLOYED) {
      return;
    }
    if (typeof label === "string") {
      this.#labels.upsert(address, label);
    } else {
      this.#labels.upsert(address, label(this.#labels.get(address)));
    }
  }

  public get(address: Address): string {
    const label = this.#labels.get(address);
    return label ? `${address} [${label}]` : address;
  }

  public get all(): Record<Address, string> {
    return this.#labels.asRecord();
  }
}
