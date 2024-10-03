import type { Address } from "viem";
import { parseEther } from "viem";

import {
  AP_ACL,
  createAnvilClient,
  type CreditFactory,
  type GearboxSDK,
} from "../sdk";
import { iaclAbi, iCreditConfiguratorV3Abi } from "./abi";

/**
 * Helper function to set liquidation thresholds on credit manager via anvil impersonation
 * @param sdk
 * @param cm
 * @param newLTs
 */
export async function setLTs(
  sdk: GearboxSDK,
  cm: CreditFactory,
  newLTs: Record<Address, number>,
): Promise<void> {
  const aclAddr = sdk.addressProvider.getLatestVersion(AP_ACL);
  const configuratorAddr = await sdk.provider.publicClient.readContract({
    address: aclAddr,
    abi: iaclAbi,
    functionName: "owner",
  });
  const anvil = createAnvilClient({
    transport: sdk.provider.transport,
    chain: sdk.provider.chain,
  });

  await anvil.impersonateAccount({
    address: configuratorAddr,
  });
  await anvil.setBalance({
    address: configuratorAddr,
    value: parseEther("100"),
  });
  for (const [t, lt] of Object.entries(newLTs)) {
    await anvil.writeContract({
      chain: anvil.chain,
      address: cm.creditConfigurator.address,
      account: configuratorAddr,
      abi: iCreditConfiguratorV3Abi,
      functionName: "setLiquidationThreshold",
      args: [t as Address, lt],
    });
    // const newLT = await anvil.readContract({
    //   address: cm.creditManager.address,
    //   abi: iCreditManagerV3Abi,
    //   functionName: "liquidationThresholds",
    //   args: [t as Address],
    // });
  }
  await anvil.stopImpersonatingAccount({
    address: configuratorAddr,
  });
}
