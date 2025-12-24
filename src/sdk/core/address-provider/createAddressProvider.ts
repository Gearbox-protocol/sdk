import type { Address } from "viem";

import { iVersionAbi } from "../../../abi/iVersion.js";
import {
  ADDRESS_PROVIDER_V310,
  isV300,
  isV310,
} from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { hexEq } from "../../utils/hex.js";
import { AddressProviderV300Contract } from "./AddressProviderV300Contract.js";
import { AddressProviderV310Contract } from "./AddressProviderV310Contract.js";
import type {
  AddressProviderState,
  IAddressProviderContract,
} from "./types.js";

export async function createAddressProvider(
  sdk: GearboxSDK,
  address: Address,
): Promise<IAddressProviderContract> {
  let v: bigint;
  if (hexEq(address, ADDRESS_PROVIDER_V310)) {
    v = 310n;
  } else {
    v = await sdk.client.readContract({
      address,
      abi: iVersionAbi,
      functionName: "version",
    });
  }
  return newAddressProvider(sdk, address, Number(v));
}

export function hydrateAddressProvider(
  sdk: GearboxSDK,
  state: AddressProviderState,
): IAddressProviderContract {
  const { addr, version } = state.baseParams;
  return newAddressProvider(sdk, addr, Number(version), state.addresses);
}

function newAddressProvider(
  sdk: GearboxSDK,
  address: Address,
  version: number,
  addresses?: Record<string, Record<number, Address>>,
): IAddressProviderContract {
  if (isV300(version)) {
    return new AddressProviderV300Contract(sdk, address, version, addresses);
  }
  if (isV310(version)) {
    return new AddressProviderV310Contract(sdk, address, version, addresses);
  }
  throw new Error(`unsupported address provider version: ${version}`);
}
