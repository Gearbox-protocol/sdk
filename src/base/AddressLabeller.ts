import type { Address, NetworkType } from "@gearbox-protocol/sdk-gov";
import {
  contractsByNetwork,
  emergencyLiquidators,
  MULTISIG,
  NOT_DEPLOYED,
  ROUTER_MULTISIG_ADDRESS,
  tickerTokensByNetwork,
  tokenDataByNetwork,
  TREASURY,
  VETO_ADMIN,
} from "@gearbox-protocol/sdk-gov";

import { AddressMap } from "../utils";
import type { IAddressLabeller } from "./IAddressLabeller";

/**
 * Helper class to be used during transition from v3 to v3.1
 */
export class AddressLabeller implements IAddressLabeller {
  #labels = new AddressMap<string>();

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

/**
 * This method is using sdk-gov, and is not part of the interface, so it'll be easier to remove it once we get rid of sdk-gov
 * @param labeller
 * @param network
 */
export function initLegacyLabels(
  labeller: IAddressLabeller,
  network: NetworkType,
): void {
  Object.entries(tokenDataByNetwork[network]).forEach(([label, address]) => {
    labeller.set(address, label);
  });

  Object.entries(tickerTokensByNetwork[network]).forEach(([label, address]) => {
    labeller.set(address, label);
  });

  Object.entries(contractsByNetwork[network]).forEach(([label, address]) => {
    labeller.set(address, label);
  });

  const multisigs = [
    { safe: MULTISIG, label: "Multisig" },
    { safe: ROUTER_MULTISIG_ADDRESS, label: "RouterMultisig" },
    { safe: VETO_ADMIN, label: "VetoAdmin" },
    { safe: TREASURY, label: "Treasury" },
  ];

  multisigs.forEach(({ safe, label }) => {
    labeller.set(safe[network], label);
  });

  emergencyLiquidators.forEach(address => {
    labeller.set(address, "EmergencyLiquidator");
  });
}
