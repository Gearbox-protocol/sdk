import type { Address } from "viem";
import { parseEther } from "viem";

import { iCreditManagerV310Abi } from "../abi/v310";
import { iCreditConfiguratorV300Abi, type ILogger } from "../sdk";
import { iaclTraitAbi, iOwnableAbi } from "./abi";
import type { AnvilClient } from "./createAnvilClient";

export interface SetLTsCMSlice {
  creditConfigurator: Address;
  address: Address;
}
/**
 * Helper function to set liquidation thresholds on credit manager via anvil impersonation
 * @param sdk
 * @param cm
 * @param newLTs
 */
export async function setLTs(
  anvil: AnvilClient,
  cm: SetLTsCMSlice,
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
    abi: iOwnableAbi,
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
        abi: iCreditConfiguratorV300Abi,
        functionName: "setLiquidationThreshold",
        args: [t as Address, lt],
      });
      const newLT = await anvil.readContract({
        address: cm.address,
        abi: iCreditManagerV310Abi,
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
