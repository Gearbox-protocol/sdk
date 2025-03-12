import { formatEther, parseEther, stringToHex } from "viem";

import { iAddressProviderV300Abi } from "../abi/v300.js";
import { iAddressProviderV310Abi } from "../abi/v310.js";
import type { GearboxSDK } from "../sdk/index.js";
import { ADDRESS_PROVIDER } from "../sdk/index.js";
import { createAnvilClient } from "./createAnvilClient.js";

async function unsafeMigrateFaucet(sdk: GearboxSDK): Promise<void> {
  const anvil = createAnvilClient({
    chain: sdk.provider.chain,
    transport: sdk.provider.transport,
  });

  const [faucetAddr, owner] = await anvil.multicall({
    contracts: [
      {
        abi: iAddressProviderV300Abi,
        address: ADDRESS_PROVIDER[sdk.provider.networkType],
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
  });
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
 * Migrates faucet from address provider v3.0 [from constants in SDK] to v3.1 [from attached SDK]
 * @param
 */
export async function migrateFaucet(sdk: GearboxSDK): Promise<void> {
  try {
    await unsafeMigrateFaucet(sdk);
    sdk.logger?.info("faucet migrated successfully");
  } catch (e) {
    sdk.logger?.error(`faucet migration failed: ${e}`);
  }
}
