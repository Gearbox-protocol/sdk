import type { Address } from "viem";
import { formatEther, parseEther, stringToHex } from "viem";

import { iAddressProviderV310Abi } from "../abi/310/generated.js";
import type { GearboxSDK } from "../sdk/index.js";
import { extendAnvilClient } from "./createAnvilClient.js";

/**
 * Sets faucet address on address provider
 * @param sdk
 * @param faucet - faucet address.
 * @returns faucet address as read from address provider
 */
export async function migrateFaucet(
  sdk: GearboxSDK,
  faucet: Address,
): Promise<Address> {
  try {
    await unsafeMigrateFaucet(sdk, faucet);
    sdk.logger?.info("faucet migrated successfully");
  } catch (e) {
    sdk.logger?.error(`faucet migration failed: ${e}`);
  }
  return sdk.client.readContract({
    abi: iAddressProviderV310Abi,
    address: sdk.addressProvider.address,
    functionName: "getAddressOrRevert",
    args: [stringToHex("FAUCET", { size: 32 }), 0n],
  });
}

async function unsafeMigrateFaucet(
  sdk: GearboxSDK,
  faucet: Address,
): Promise<void> {
  const anvil = extendAnvilClient(sdk.client);

  const owner = await anvil.readContract({
    abi: iAddressProviderV310Abi,
    address: sdk.addressProvider.address,
    functionName: "owner",
    args: [],
  });

  sdk.logger?.debug(`faucet address: ${faucet}, owner: ${owner}`);
  await anvil.impersonateAccount({ address: owner });
  await anvil.setBalance({
    address: owner,
    value: parseEther("1000"),
  });
  const balance = await anvil.getBalance({ address: owner });
  sdk.logger?.debug(`owner balance: ${formatEther(balance)} ETH`);
  const { request } = await anvil.simulateContract({
    chain: anvil.chain,
    account: owner,
    address: sdk.addressProvider.address,
    abi: iAddressProviderV310Abi,
    functionName: "setAddress",
    args: [stringToHex("FAUCET", { size: 32 }), faucet, false],
  });
  sdk.logger?.debug("estimated setAddress call");
  const hash = await anvil.writeContract({
    chain: anvil.chain,
    account: owner,
    address: sdk.addressProvider.address,
    abi: iAddressProviderV310Abi,
    functionName: "setAddress",
    args: [stringToHex("FAUCET", { size: 32 }), faucet, false],
    gas: request.gas ? (request.gas * 11n) / 10n : undefined,
  });
  const receipt = await anvil.waitForTransactionReceipt({ hash });
  await anvil.stopImpersonatingAccount({ address: owner });
  if (receipt.status === "reverted") {
    throw new Error("faucet migration reverted");
  }
}
