import { type Address, isAddressEqual } from "viem";
import type { Bps } from "../../../model/index.js";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import type { AccountSnapshot } from "./types.js";

const MAX_UINT16 = 65535;

/**
 * USD value of a token amount in the oracle's 8-decimal scale, or `0n` when
 * the feed is missing or unsuccessful — the same formula as
 * `priceOracle.convertToUSD`, with its throw swallowed so a preview can still
 * report a best-effort health factor.
 **/
function usdValue(
  oracle: { convertToUSD: (token: Address, amount: bigint) => bigint },
  token: Address,
  amount: bigint,
): bigint {
  try {
    return oracle.convertToUSD(token, amount);
  } catch {
    return 0n;
  }
}

/**
 * Health factor of an account state, in basis points (`10000` = 1.0).
 *
 * Collateral is valued under liquidation thresholds, with quoted tokens
 * capped by their quota, and compared against the debt's value. An account
 * with no debt reports `65535` (`MAX_UINT16`), the contract's own sentinel
 * scaled down. Formulas are in parity with the legacy `calcHealthFactor`.
 *
 * @param sdk - Market data source.
 * @param snapshot - Account state to evaluate.
 **/
export function healthFactor(sdk: OnchainSDK, snapshot: AccountSnapshot): Bps {
  const { creditManager, assets, quotas, debt } = snapshot;
  if (debt === 0n) {
    return MAX_UINT16;
  }

  const market = sdk.marketRegister.findByCreditManager(creditManager);
  const cm = sdk.marketRegister.findCreditManager(creditManager).creditManager;
  const { priceOracle } = market;
  const underlying = market.pool.underlying;

  const assetMoney = assets.reduce((acc, { token, balance }) => {
    if (balance <= DUST_THRESHOLD) {
      return acc;
    }

    const lt = BigInt(cm.liquidationThresholds.get(token) ?? 0);
    const tokenLtWeighted = usdValue(priceOracle, token, balance) * lt;

    const quota = quotas.find(q => isAddressEqual(q.token, token));
    const quotaBalance =
      quota && market.pool.pqk.hasActiveQuota(token) ? quota.balance : 0n;
    const quotaWeighted =
      usdValue(priceOracle, underlying, quotaBalance) * PERCENTAGE_FACTOR;

    // a token with no quota entry at all is not a quoted token
    const money = quota
      ? BigIntMath.min(quotaWeighted, tokenLtWeighted)
      : tokenLtWeighted;

    return acc + money;
  }, 0n);

  const borrowedMoney = usdValue(priceOracle, underlying, debt);
  const hf = borrowedMoney > 0n ? assetMoney / borrowedMoney : 0n;

  return Number(hf);
}
