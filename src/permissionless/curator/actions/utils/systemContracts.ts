/**
 * The Gearbox v3.1 system contracts a GIP touches. They sit at the same
 * CREATE2 addresses on every chain (see `Addresses`), so they are bound
 * directly instead of being looked up through the market configurator and
 * its address provider: every lookup was a sequential round trip.
 **/
import { type Address, getContract } from "viem";
import { iPriceFeedStoreAbi } from "../../../../abi/310/iPriceFeedStore.js";
import { AddressProviderContract } from "../../../bindings/address-provider.js";
import { BytecodeRepositoryContract } from "../../../bindings/bytecode-repository.js";
import { Addresses } from "../../../deployment/addresses.js";
import type { GipBuilderContext } from "../builderContext.js";

type Client = GipBuilderContext["client"];

export const ADDRESS_PROVIDER: Address = Addresses.ADDRESS_PROVIDER;
export const PRICE_FEED_STORE: Address = Addresses.PRICE_FEED_STORE;
export const BYTECODE_REPOSITORY: Address = Addresses.BYTECODE_REPOSITORY;

export function addressProvider(client: Client): AddressProviderContract {
  return new AddressProviderContract(ADDRESS_PROVIDER, client);
}

export function bytecodeRepository(client: Client): BytecodeRepositoryContract {
  return new BytecodeRepositoryContract(BYTECODE_REPOSITORY, client);
}

export function priceFeedStore(client: Client) {
  return getContract({
    address: PRICE_FEED_STORE,
    abi: iPriceFeedStoreAbi,
    client,
  });
}
