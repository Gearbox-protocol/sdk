import type { Address } from "viem";
import { DUST_THRESHOLD, PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/index.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";

/** One balance on the account, as the slice carries it. */
export type Holding = CreditAccountSlice["tokens"][number];

/**
 * The collateral check's own valuation of an account, as a handful of lookups.
 *
 * Shared by every ceiling that solves that check for an amount, so the rules it
 * encodes are written once: a holding backed by a quota counts the lesser of the
 * quota and its threshold-weighted value, an unquoted one its weighted value
 * alone, and dust or a disabled balance nothing at all. Collateral is valued at
 * the protocol safe price — `min` of the two feeds, 0 where there is no reserve
 * — the way the facade values a call that hands funds over; the underlying is
 * exempt and stays on the main feed, as `CreditManagerV3._safeConvertToUSD`
 * does.
 *
 * Money is carried in USD × `PERCENTAGE_FACTOR`, the units the check compares
 * in, so a threshold never has to be divided back out.
 */
export interface CollateralMoney {
  /** Market underlying, the one token safe pricing does not touch. */
  underlying: Address;
  /** Whether the holding is weighed at all. */
  counts(holding: Holding): boolean;
  /** What the holding backs, in USD × `PERCENTAGE_FACTOR`. */
  weigh(holding: Holding): bigint;
  /** What the holding's quota backs, in the same units; 0 on a closed market. */
  quotaMoney(holding: Holding): bigint;
  /** USD at the main feed; `undefined` when the token has no price at all. */
  mainUsd(token: Address, amount: bigint): bigint | undefined;
  /** USD the check counts the holding at, before its threshold. */
  checkedUsd(holding: Holding): bigint;
  /** Liquidation threshold in basis points; 0 for a token the manager refuses. */
  lt(token: Address): bigint;
}

/** {@inheritDoc CollateralMoney} */
export function collateralMoney(
  creditAccount: CreditAccountSlice,
  sdk: OnchainSDK,
): CollateralMoney {
  const { market, creditManager } = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const { priceOracle } = market;
  const { pqk } = market.pool;
  const underlying = market.pool.underlying;

  // A slice assembled for a `prepare` call carries no mask, and that means
  // "unknown" rather than "everything disabled".
  const masked = creditAccount.enabledTokensMask !== 0n;

  const mainUsd = (token: Address, amount: bigint): bigint | undefined => {
    try {
      return priceOracle.convertToUSD(token, amount);
    } catch {
      return undefined;
    }
  };

  const lt = (token: Address): bigint =>
    BigInt(creditManager.liquidationThresholds.get(token) ?? 0);

  const checkedUsd = (holding: Holding): bigint =>
    eq(holding.token, underlying)
      ? (mainUsd(holding.token, holding.balance) ?? 0n)
      : priceOracle.safeConvertMinUSD(holding.token, holding.balance).value;

  /** A quota is underlying-denominated, and a closed market backs nothing. */
  const quotaMoney = (holding: Holding): bigint =>
    pqk.hasActiveQuota(holding.token)
      ? (mainUsd(underlying, holding.quota) ?? 0n) * PERCENTAGE_FACTOR
      : 0n;

  const weigh = (holding: Holding): bigint => {
    const weighted = checkedUsd(holding) * lt(holding.token);
    // no quota bought is how an unquoted token reads, and the underlying is
    // the one every account holds
    if (holding.quota === 0n) {
      return weighted;
    }
    return BigIntMath.min(quotaMoney(holding), weighted);
  };

  return {
    underlying,
    counts: holding =>
      holding.balance > DUST_THRESHOLD &&
      (!masked || (holding.mask & creditAccount.enabledTokensMask) !== 0n),
    weigh,
    quotaMoney,
    mainUsd,
    checkedUsd,
    lt,
  };
}
