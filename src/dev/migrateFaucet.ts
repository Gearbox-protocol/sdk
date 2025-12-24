import type { Address } from "viem";
import { formatEther, parseEther, stringToHex } from "viem";

import { iAddressProviderV310Abi } from "../abi/310/generated.js";
import { iAddressProviderV300Abi } from "../abi/v300.js";
import type { GearboxSDK } from "../sdk/index.js";
import { ADDRESS_PROVIDER } from "../sdk/index.js";
import { extendAnvilClient } from "./createAnvilClient.js";

export async function unsafeMigrateFaucet(
  sdk: GearboxSDK,
  faucet?: Address,
): Promise<void> {
  const anvil = extendAnvilClient(sdk.client);

  let faucetAddr: Address;
  let owner: Address;
  if (faucet) {
    faucetAddr = faucet;
    owner = await anvil.readContract({
      abi: iAddressProviderV310Abi,
      address: sdk.addressProvider.address,
      functionName: "owner",
      args: [],
    });
  } else {
    [faucetAddr, owner] = await anvil.multicall({
      contracts: [
        {
          abi: iAddressProviderV300Abi,
          address: ADDRESS_PROVIDER[sdk.networkType],
          functionName: "getAddressOrRevert",
          args: [stringToHex("FAUCET", { size: 32 }), 0n],
        },
        {
          abi: iAddressProviderV310Abi,
          address: sdk.addressProvider.address,
          functionName: "owner",
          args: [],
        },
      ],
      allowFailure: false,
      batchSize: 0,
    });
  }

  sdk.logger?.debug(`faucet address: ${faucetAddr}, owner: ${owner}`);
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
    args: [stringToHex("FAUCET", { size: 32 }), faucetAddr, false],
  });
  sdk.logger?.debug("estimated setAddress call");
  const hash = await anvil.writeContract({
    chain: anvil.chain,
    account: owner,
    address: sdk.addressProvider.address,
    abi: iAddressProviderV310Abi,
    functionName: "setAddress",
    args: [stringToHex("FAUCET", { size: 32 }), faucetAddr, false],
    gas: request.gas ? (request.gas * 11n) / 10n : undefined,
  });
  const receipt = await anvil.waitForTransactionReceipt({ hash });
  await anvil.stopImpersonatingAccount({ address: owner });
  if (receipt.status === "reverted") {
    throw new Error("faucet migration reverted");
  }
}

/**
 * Sets new faucet address on v3.1 address provider
 * @param sdk
 * @param faucet - new faucet address. If not provided, will try to get one from v3.0 address provider
 * @returns faucet address as read from v3.1 address provider
 */
export async function migrateFaucet(
  sdk: GearboxSDK,
  faucet?: Address,
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
