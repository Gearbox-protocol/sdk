import type { Address } from "viem";
import { parseEther } from "viem";

import type { CreditManagerState, ILogger } from "../sdk";
import {
  iaclAbi,
  iaclTraitAbi,
  iCreditConfiguratorV3Abi,
  iCreditManagerV3Abi,
} from "./abi";
import type { AnvilClient } from "./createAnvilClient";

/**
 * Helper function to set liquidation thresholds on credit manager via anvil impersonation
 * @param sdk
 * @param cm
 * @param newLTs
 */
export async function setLTs(
  anvil: AnvilClient,
  cm: CreditManagerState & { address: Address },
  newLTs: Record<Address, number>,
  logger?: ILogger,
): Promise<void> {
  const aclAddr = await anvil.readContract({
    address: cm.creditConfigurator,
    abi: iaclTraitAbi,
    functionName: "acl",
  });
  const configuratorAddr = await anvil.readContract({
    address: aclAddr,
    abi: iaclAbi,
    functionName: "owner",
  });

  await anvil.impersonateAccount({
    address: configuratorAddr,
  });
  await anvil.setBalance({
    address: configuratorAddr,
    value: parseEther("100"),
  });
  for (const [t, lt] of Object.entries(newLTs)) {
    try {
      await anvil.writeContract({
        chain: anvil.chain,
        address: cm.creditConfigurator,
        account: configuratorAddr,
        abi: iCreditConfiguratorV3Abi,
        functionName: "setLiquidationThreshold",
        args: [t as Address, lt],
      });
      const newLT = await anvil.readContract({
        address: cm.address,
        abi: iCreditManagerV3Abi,
        functionName: "liquidationThresholds",
        args: [t as Address],
      });
      logger?.debug(`set ${t} LT to ${newLT}`);
    } catch {
      // in case when we try to set token that's not present
    }
  }
  await anvil.stopImpersonatingAccount({
    address: configuratorAddr,
  });
}
