import type { Address } from "viem";
import { MAX_UINT256 } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

export interface IsDustOptions {
  sdk: GearboxSDK;
  token: Address;
  balance: bigint;
  creditManager: Address;
  /**
   * Dust threshold in USD, without decimals
   */
  minBalanceUSD?: bigint;
}

/**
 * Checks if balance of token is dust, by checking getting usd prices from oracle
 * @param opts
 * @returns
 */
export function isDust(opts: IsDustOptions): boolean {
  const { sdk, token, balance, creditManager } = opts;
  if (balance <= 1n) {
    return true;
  }
  const minBalanceUSD = (opts.minBalanceUSD ?? 10n) * 10n ** 8n;
  const { priceOracle } = sdk.marketRegister.findByCreditManager(creditManager);
  let balanceUSD = MAX_UINT256;
  try {
    balanceUSD = priceOracle.convertToUSD(token, balance);
  } catch {
    try {
      balanceUSD = priceOracle.convertToUSD(token, balance, true);
    } catch {
      return false;
    }
  }
  return balanceUSD < minBalanceUSD;
}
