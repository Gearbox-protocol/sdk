import { type Address, isAddressEqual } from "viem";
import type { Bps } from "../../../model/index.js";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import type { AccountSnapshot } from "./types.js";

const MAX_UINT16 = 65535;

interface Oracle {
  convertToUSD: (token: Address, amount: bigint, reserve?: boolean) => bigint;
}

export interface HealthFactorOptions {
  /**
   * Value collateral at safe prices — the lower of the token's main and
   * reserve feeds — which is what the credit manager does when the call takes
   * funds off the account. A token with no reserve feed keeps its main price.
   **/
  safePrices?: boolean;
}

function convert(
  oracle: Oracle,
  token: Address,
  amount: bigint,
  reserve: boolean,
): bigint | undefined {
  try {
    return oracle.convertToUSD(token, amount, reserve);
  } catch {
    return undefined;
  }
}

/**
 * USD value of a token amount in the oracle's 8-decimal scale, or `0n` when no
 * feed answers — the same formula as `priceOracle.convertToUSD`, with its throw
 * swallowed so a preview can still report a best-effort health factor.
 *
 * At safe prices a feed that answers alone carries the valuation, rather than
 * dropping it to zero the way the contract does for an untrusted main feed: the
 * SDK cannot see which feeds are trusted, and refusing a sound transaction is
 * the worse of the two mistakes here.
 **/
function usdValue(
  oracle: Oracle,
  token: Address,
  amount: bigint,
  safe = false,
): bigint {
  const main = convert(oracle, token, amount, false);
  if (!safe) {
    return main ?? 0n;
  }
  const reserve = convert(oracle, token, amount, true);
  if (main === undefined || reserve === undefined) {
    return main ?? reserve ?? 0n;
  }
  return BigIntMath.min(main, reserve);
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
 * @param options - Pricing to value the collateral at.
 **/
export function healthFactor(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
  options?: HealthFactorOptions,
): Bps {
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
    const tokenLtWeighted =
      usdValue(priceOracle, token, balance, options?.safePrices) * lt;

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
