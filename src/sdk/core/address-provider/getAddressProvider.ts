import type { Address } from "viem";

import { iVersionAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import { AddressProviderContractV3_1 } from "./AddressProviderV3_1Contract";
import { AddressProviderContractV3 } from "./AddressProviderV3Contract";
import type { IAddressProviderContract } from "./types";

export async function getAddressProvider(
  sdk: GearboxSDK,
  address: Address,
  version?: number,
): Promise<IAddressProviderContract> {
  let v = version;
  if (!v) {
    const vv = await sdk.provider.publicClient.readContract({
      address,
      abi: iVersionAbi,
      functionName: "version",
    });
    v = Number(vv);
  }

  switch (v) {
    case 3_00:
      return new AddressProviderContractV3(sdk, address);
    case 3_10:
      return new AddressProviderContractV3_1(sdk, address);
    default:
      throw new Error(`Unsupported address provider version: ${v}`);
  }
}
