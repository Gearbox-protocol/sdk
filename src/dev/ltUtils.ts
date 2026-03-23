import type { Address } from "viem";
import { erc20Abi, parseEther } from "viem";
import {
  iCreditConfiguratorV310Abi,
  iCreditManagerV310Abi,
} from "../abi/310/generated.js";
import type { CreditSuiteState, ILogger } from "../sdk/index.js";
import { hexEq, isV310, TypedObjectUtils } from "../sdk/index.js";
import { iaclTraitAbi, iOwnableAbi } from "./abi.js";
import type { AnvilClient } from "./createAnvilClient.js";

/**
 * Helper function to set liquidation thresholds on credit manager via anvil impersonation
 * @param sdk
 * @param cm
 * @param newLTs
 */
export async function setLTs(
  anvil: AnvilClient,
  cm: CreditSuiteState,
  newLTs: Record<Address, number>,
  logger?: ILogger,
): Promise<void> {
  const configuratorAddr = await impresonateCCOwner(anvil, cm);
  for (const [t, lt] of Object.entries(newLTs)) {
    await anvil.writeContract({
      chain: anvil.chain,
      address: cm.creditConfigurator.baseParams.addr,
      account: configuratorAddr,
      abi: iCreditConfiguratorV310Abi,
      functionName: "setLiquidationThreshold",
      args: [t as Address, lt],
    });
  }
  await anvil.stopImpersonatingAccount({
    address: configuratorAddr,
  });
  await logLTs(anvil, cm, TypedObjectUtils.keys(newLTs), logger);
}

export async function setLTZero(
  anvil: AnvilClient,
  cm: CreditSuiteState,
  logger?: ILogger,
): Promise<void> {
  const v = Number(cm.creditConfigurator.baseParams.version);
  if (isV310(v)) {
    await setLTZeroV310(anvil, cm, logger);
  } else {
    throw new Error(
      `zero LT is not implemented for credit configurator version: ${v}`,
    );
  }
}

async function setLTZeroV310(
  anvil: AnvilClient,
  cm: CreditSuiteState,
  logger?: ILogger,
): Promise<void> {
  const newLTs: Record<Address, number> = {};
  for (const { token } of cm.creditManager.collateralTokens) {
    if (!hexEq(token, cm.creditManager.underlying)) {
      newLTs[token] = 0;
    }
  }
  await setLTs(anvil, cm, newLTs, logger);
}

async function impresonateCCOwner(
  anvil: AnvilClient,
  cm: CreditSuiteState,
): Promise<Address> {
  const aclAddr = await anvil.readContract({
    address: cm.creditConfigurator.baseParams.addr,
    abi: iaclTraitAbi,
    functionName: "acl",
  });
  const owner = await anvil.readContract({
    address: aclAddr,
    abi: iOwnableAbi,
    functionName: "owner",
  });

  await anvil.impersonateAccount({
    address: owner,
  });
  await anvil.setBalance({
    address: owner,
    value: parseEther("100"),
  });
  return owner;
}

async function logLTs(
  anvil: AnvilClient,
  cm: CreditSuiteState,
  tokens: Address[],
  logger?: ILogger,
): Promise<void> {
  const resp = await anvil.multicall({
    allowFailure: true,
    contracts: tokens.flatMap(t => [
      {
        abi: iCreditManagerV310Abi,
        functionName: "liquidationThresholds",
        address: cm.creditManager.baseParams.addr,
        args: [t],
      } as const,
      {
        abi: erc20Abi,
        functionName: "symbol",
        address: t,
        args: [],
      } as const,
    ]),
    batchSize: 0,
  });
  for (let i = 0; i < tokens.length; i++) {
    const lt = resp[i * 2]?.result ?? "error";
    const symbol = resp[i * 2 + 1]?.result ?? tokens[i];
    logger?.debug(`new LT for ${symbol}: ${lt}`);
  }
}
