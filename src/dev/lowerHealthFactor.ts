import type { Address } from "viem";

import type {
  CreditAccountData,
  ILogger,
  OnchainSDK,
} from "../onchain/index.js";
import { TypedObjectUtils } from "../onchain/index.js";
import { calcLiquidatableLTs } from "./calcLiquidatableLTs.js";
import type { AnvilClient } from "./createAnvilClient.js";
import { setLTs } from "./ltUtils.js";

export interface LowerHealthFactorOptions {
  /**
   * Target health factor in bps, defaults to 9990
   */
  hf?: bigint;
  logger?: ILogger;
}

/**
 * Result of {@link lowerHealthFactor}
 */
export interface LoweredHealthFactor {
  /**
   * Credit account re-read after LTs were lowered
   */
  account: CreditAccountData;
  /**
   * LTs before the change, same keys as `newLTs`
   */
  oldLTs: Record<Address, number>;
  newLTs: Record<Address, number>;
}

/**
 * Lowers liquidation thresholds of credit account's credit manager on anvil, so that account's health factor drops to `hf`.
 * Does not update LTs held in sdk's cached credit manager state.
 */
export async function lowerHealthFactor(
  anvil: AnvilClient,
  sdk: OnchainSDK,
  ca: CreditAccountData,
  options: LowerHealthFactorOptions = {},
): Promise<LoweredHealthFactor> {
  const { hf, logger } = options;
  if (ca.debt === 0n) {
    throw new Error("warning: zero-debt account");
  }
  const cm = sdk.marketRegister.findCreditManager(ca.creditManager);
  const newLTs = await calcLiquidatableLTs(sdk, ca, hf, logger);
  const oldLTs: Record<Address, number> = {};
  for (const t of TypedObjectUtils.keys(newLTs)) {
    oldLTs[t] = cm.creditManager.liquidationThresholds.mustGet(t);
  }

  await setLTs(anvil, cm.state, newLTs, logger);
  const account = await sdk.accounts.getCreditAccountData(ca.creditAccount);
  if (!account) {
    throw new Error(`cannot find credit account ${ca.creditAccount}`);
  }
  logger?.debug({
    hfNew: account.healthFactor.toString(),
    hfOld: ca.healthFactor.toString(),
  });
  return { account, oldLTs, newLTs };
}
