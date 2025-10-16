import { type Address, type PublicClient, stringToHex } from "viem";
import { iAddressProviderV310Abi } from "../../abi/310/generated.js";
import { BaseContract } from "./base-contract";

const abi = iAddressProviderV310Abi;

export class AddressProviderContract extends BaseContract<typeof abi> {
  constructor(address: Address, client: PublicClient) {
    super(abi, address, client, "AddressProvider");
  }

  async getAddressOrRevert(key: string, version = 0n): Promise<Address> {
    return await this.contract.read.getAddressOrRevert([
      stringToHex(key, { size: 32 }),
      version,
    ]);
  }

  async getLatestVersionAddress(key: string): Promise<Address> {
    const version = await this.getLatestVersion(key);
    return await this.getAddressOrRevert(key, version);
  }

  async getLatestVersion(key: string): Promise<bigint> {
    return await this.contract.read.getLatestVersion([
      stringToHex(key, { size: 32 }),
    ]);
  }
}
