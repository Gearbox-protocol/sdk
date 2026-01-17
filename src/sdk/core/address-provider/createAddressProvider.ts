import type { Address } from "viem";

import { iVersionAbi } from "../../../abi/iVersion.js";
import type { NetworkType } from "../../chain/chains.js";
import {
  ADDRESS_PROVIDER_V310,
  AP_MARKET_COMPRESSOR,
  AP_PRICE_FEED_COMPRESSOR,
  isV300,
  isV310,
} from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { hexEq } from "../../utils/hex.js";
import { AddressProviderV300Contract } from "./AddressProviderV300Contract.js";
import { AddressProviderV310Contract } from "./AddressProviderV310Contract.js";
import type {
  AddressProviderAddresses,
  AddressProviderState,
  IAddressProviderContract,
} from "./types.js";

const OVERRIDE_ADDRESSES: Partial<
  Record<NetworkType, AddressProviderAddresses["overrides"]>
> = {
  // Override price feed compressor and market feed compressor
  // we urgently deployed fix and it has not been added to the address provider yet
  Mainnet: {
    [AP_PRICE_FEED_COMPRESSOR]: {
      311: "0x1fA2637B9fab0CD14290A7EE908DDc9688a15120",
    },
    [AP_MARKET_COMPRESSOR]: {
      311: "0x0C27F242f6e9F2A9AD3261bE6e439De3B948bcA2",
    },
  },
};

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
  const addrOptions: AddressProviderAddresses = {
    addresses,
    overrides: OVERRIDE_ADDRESSES[sdk.networkType],
  };
  if (isV300(version)) {
    return new AddressProviderV300Contract(sdk, address, version, addrOptions);
  }
  if (isV310(version)) {
    return new AddressProviderV310Contract(sdk, address, version, addrOptions);
  }
  throw new Error(`unsupported address provider version: ${version}`);
}
