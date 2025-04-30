import { parseEther } from "viem";

import {
  iCreditConfiguratorV300Abi,
  iCreditManagerV300Abi,
} from "../abi/v300.js";
import type { CreditManagerState, ILogger } from "../sdk/index.js";
import { PERCENTAGE_FACTOR } from "../sdk/index.js";
import { iaclTraitAbi, iOwnableAbi } from "./abi.js";
import type { AnvilClient } from "./createAnvilClient.js";

type ZeroLTCMSlice = Pick<
  CreditManagerState,
  | "creditConfigurator"
  | "feeInterest"
  | "liquidationDiscount"
  | "feeLiquidationExpired"
  | "liquidationDiscountExpired"
  | "feeLiquidation"
  | "name"
  | "underlying"
  | "baseParams"
>;

export async function setLTZero(
  anvil: AnvilClient,
  cm: ZeroLTCMSlice,
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

  let hash = await anvil.writeContract({
    chain: anvil.chain,
    address: cm.creditConfigurator,
    account: configuratorAddr,
    abi: iCreditConfiguratorV300Abi,
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
    abi: iCreditConfiguratorV300Abi,
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
    abi: iCreditManagerV300Abi,
    functionName: "setCollateralTokenData",
    args: [cm.underlying, 1, 1, Number(2n ** 40n - 1n), 0],
  });
  await anvil.waitForTransactionReceipt({ hash });

  logger?.debug(`[${cm.name}] setting configurator ${cm.creditConfigurator}`);
  hash = await anvil.writeContract({
    chain: anvil.chain,
    address: cm.baseParams.addr,
    account: cm.creditConfigurator,
    abi: iCreditManagerV300Abi,
    functionName: "setCreditConfigurator",
    args: [cm.creditConfigurator],
  });
  await anvil.waitForTransactionReceipt({ hash });

  logger?.debug(`[${cm.name}] done`);
  await anvil.stopImpersonatingAccount({
    address: cm.creditConfigurator,
  });
  await anvil.stopImpersonatingAccount({ address: configuratorAddr });

  const lt = await anvil.readContract({
    address: cm.baseParams.addr,
    abi: iCreditManagerV300Abi,
    functionName: "liquidationThresholds",
    args: [cm.underlying],
  });
  logger?.debug(`[${cm.name}] underlying lt: ${lt}`);
}
