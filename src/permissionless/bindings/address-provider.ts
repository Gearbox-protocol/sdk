import {
  type Address,
  type Chain,
  type PublicClient,
  stringToHex,
  type Transport,
} from "viem";
import { AddressProviderV310Contract } from "../../sdk/index.js";

export class AddressProviderContract extends AddressProviderV310Contract {
  constructor(addr: Address, client: PublicClient<Transport, Chain>) {
    super({ client }, addr);
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
