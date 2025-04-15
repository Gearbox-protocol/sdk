import type { Address } from "viem";

import { iVersionAbi } from "../../../abi/iVersion.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { AddressProviderContractV3_1 } from "./AddressProviderV3_1Contract.js";
import { AddressProviderContractV3 } from "./AddressProviderV3Contract.js";
import type {
  AddressProviderState,
  IAddressProviderContract,
} from "./types.js";

export interface CreateAddressProviderOptions {
  version?: number;
  state?: AddressProviderState;
}

export async function createAddressProvider(
  sdk: GearboxSDK,
  address: Address,
  options?: CreateAddressProviderOptions,
): Promise<IAddressProviderContract> {
  const addr = options?.state?.baseParams.addr ?? address;
  let v = options?.state?.baseParams.version ?? options?.version;
  if (!v) {
    const vv = await sdk.provider.publicClient.readContract({
      address: addr,
      abi: iVersionAbi,
      functionName: "version",
    });
    v = Number(vv);
  }
  switch (v) {
    case 3_00:
      return new AddressProviderContractV3(
        sdk,
        addr,
        options?.state?.addresses,
      );
    case 3_10:
      return new AddressProviderContractV3_1(
        sdk,
        addr,
        options?.state?.addresses,
      );
    default:
      throw new Error(`Unsupported address provider version: ${v}`);
  }
}
