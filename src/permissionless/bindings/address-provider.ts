import { Address, PublicClient, stringToHex } from "viem";
import { BaseContract } from "./base-contract";
import { addressProviderAbi } from "../abi";

const abi = addressProviderAbi;

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
