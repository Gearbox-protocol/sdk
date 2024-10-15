import { parseEther } from "viem";

import type { CreditManagerState, ILogger } from "../sdk";
import { PERCENTAGE_FACTOR } from "../sdk";
import {
  iaclAbi,
  iaclTraitAbi,
  iCreditConfiguratorV3Abi,
  iCreditManagerV3Abi,
} from "./abi";
import type { AnvilClient } from "./createAnvilClient";

export async function setLTZero(
  anvil: AnvilClient,
  cm: CreditManagerState,
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

  let hash = await anvil.writeContract({
    chain: anvil.chain,
    address: cm.creditConfigurator,
    account: configuratorAddr,
    abi: iCreditConfiguratorV3Abi,
    functionName: "setFees",
    args: [
      cm.feeInterest,
      cm.liquidationDiscount - 1,
      Number(PERCENTAGE_FACTOR) - cm.liquidationDiscount,
      cm.feeLiquidationExpired,
      cm.liquidationDiscountExpired,
    ],
  });
  await anvil.waitForTransactionReceipt({ hash });

  logger?.debug(`[${cm.name}] setFees part 2`);
  hash = await anvil.writeContract({
    chain: anvil.chain,
    address: cm.creditConfigurator,
    account: configuratorAddr,
    abi: iCreditConfiguratorV3Abi,
    functionName: "setFees",
    args: [
      cm.feeInterest,
      cm.feeLiquidation,
      Number(PERCENTAGE_FACTOR) - cm.liquidationDiscount,
      cm.feeLiquidationExpired,
      cm.liquidationDiscountExpired,
    ],
  });
  await anvil.waitForTransactionReceipt({ hash });

  logger?.debug(`[${cm.name}] setFees done`);

  await anvil.impersonateAccount({
    address: cm.creditConfigurator,
  });
  await anvil.setBalance({
    address: cm.creditConfigurator,
    value: parseEther("100"),
  });
  logger?.debug(
    `[${cm.name}] impresonating creditConfigurator ${cm.creditConfigurator}`,
  );

  logger?.debug(`[${cm.name}] setting liquidation threshold`);
  hash = await anvil.writeContract({
    chain: anvil.chain,
    address: cm.baseParams.addr,
    account: cm.creditConfigurator,
    abi: iCreditManagerV3Abi,
    functionName: "setCollateralTokenData",
    args: [cm.underlying, 1, 1, Number(2n ** 40n - 1n), 0],
  });
  await anvil.waitForTransactionReceipt({ hash });

  logger?.debug(`[${cm.name}] setting configurator ${cm.creditConfigurator}`);
  hash = await anvil.writeContract({
    chain: anvil.chain,
    address: cm.baseParams.addr,
    account: cm.creditConfigurator,
    abi: iCreditManagerV3Abi,
    functionName: "setCreditConfigurator",
    args: [cm.creditConfigurator],
  });
  await anvil.waitForTransactionReceipt({ hash });

  logger?.debug(`[${cm.name}] done`);
  await anvil.stopImpersonatingAccount({
    address: cm.creditConfigurator,
  });
  await anvil.stopImpersonatingAccount({ address: configuratorAddr });

  /// Testing that LT is 1
  // logger?.debug(`[${cm.name}] zero lt self-checking`);
  // const cm2 = await dc300.read.getCreditManagerData([cm.addr]);
  // if (cm2.liquidationThresholds.some(lt => lt > 1n)) {
  //   throw new Error("LT is not 1");
  // }
  // logger?.info(`[${cm.name}] zero lt OK`);
}
