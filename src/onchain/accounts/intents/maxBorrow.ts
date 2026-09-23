import type { Address } from "viem";
import { DUST_THRESHOLD } from "../../constants/math.js";
import type { Asset, OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/index.js";
import { borrowCollateralQuota } from "./borrow.js";
import { collateralValuation, type Holding } from "./collateral-valuation.js";
import { eq, resolveCreditManager, toTargetDecimals } from "./utils/common.js";
import { unopenedAccountSlice } from "./utils/index.js";

export interface MaxBorrowProps {
  sdk: OnchainSDK;
  /** Credit manager the loan would be taken in. */
  creditManager: Address;
  /** Token the wallet puts up, in the manager's collateral list. */
  collateralToken: Address;
  /** Amount of {@link collateralToken}, in its own units. */
  collateralAmount: bigint;
  /** Token the loan is paid out in; the answer is in its units. */
  borrowToken: Address;
  /** Health factor the loan has to leave the account at, in basis points. */
  targetHF: bigint;
  /** Extra quota headroom in PERCENTAGE_FORMAT, as the borrow itself takes. */
  quotaReserve: number | undefined;
}

/**
 * Largest loan this collateral supports at `targetHF` — the ceiling a borrow
 * form should offer, in the payout token's units.
 *
 * The inverse of a borrow rather than a search for one: the loan leaves the
 * account entirely, so the collateral is the whole of what backs the debt, and
 * the health factor is one division away from the amount. Solving it the other
 * way round costs a division too, and no iteration.
 *
 * Collateral is valued the way the transaction will be judged — at safe
 * prices, under its liquidation threshold, capped by the quota the borrow
 * buys for it, all of which is {@link collateralValuation}'s business. The ceiling
 * is then held to what the market will actually lend: the pool's free
 * liquidity, the manager's own allowance, the facade's `maxDebt` and the
 * remaining quota of the strategy target collateral, whichever binds first.
 *
 * The facade's `minDebt` is not applied to the collateral's own ceiling. It
 * is a floor, and a ceiling answered as `0n` because the collateral is too
 * small for this market would tell a form nothing about what it is holding —
 * the number a user needs to see is the one they are short of. Collateral
 * that carries something therefore answers with it, whether or not the market
 * would lend that little; a loan under the floor is refused by `borrow`
 * itself, with `debtOutOfRange` naming both ends. A market whose own capacity
 * is under `minDebt` is different: `maxBorrowAmount` answers `0n`, because no
 * loan of any size exists there.
 *
 * Nothing is fetched or simulated — the account does not exist yet and every
 * input is loaded market state, so a form can call this on each keystroke.
 *
 * @param props - {@link MaxBorrowProps}
 * @returns Amount in the payout token's units; `0n` where no loan of this
 * shape exists at any size — a collateral that backs nothing at safe prices, a
 * market with nothing left to lend, and a manager the SDK does not hold yet
 **/
export function maxBorrow(props: MaxBorrowProps): bigint {
  const { sdk, creditManager, collateralAmount, targetHF, quotaReserve } =
    props;

  // A form asks this on every keystroke, including before the SDK has
  // finished attaching. A market it cannot weigh yet funds nothing, which is
  // the same answer as a market that funds nothing.
  const found = resolveCreditManager(sdk, creditManager);
  if (!found) {
    return 0n;
  }
  const { suite, market } = found;
  const { priceOracle } = market;

  const underlying = market.pool.underlying.toLowerCase() as Address;
  const collateralToken = props.collateralToken.toLowerCase() as Address;
  const borrowToken = props.borrowToken.toLowerCase() as Address;

  // The shapes `buildBorrowState` refuses outright: borrowing the collateral
  // token, a payout in the wrapper an RWA market cannot let leave the account,
  // and a deposit too small to be counted as one.
  const rwaAsset = sdk.tokensMeta.rwaUnderlyings
    .get(underlying)
    ?.asset?.toLowerCase() as Address | undefined;
  if (eq(collateralToken, borrowToken)) {
    return 0n;
  }
  if (rwaAsset && eq(borrowToken, underlying)) {
    return 0n;
  }
  if (collateralAmount <= DUST_THRESHOLD || targetHF <= 0n) {
    return 0n;
  }

  const assets: Asset[] = [
    { token: collateralToken, balance: collateralAmount },
  ];
  const quotas = borrowCollateralQuota({
    sdk,
    creditManager,
    assets,
    quotaReserve,
  });
  const holding: Holding = {
    token: collateralToken,
    balance: collateralAmount,
    quota: quotas.find(q => eq(q.token, collateralToken))?.balance ?? 0n,
    mask: 0n,
    success: true,
  };
  const valuation = collateralValuation(
    {
      ...unopenedAccountSlice({
        creditManager,
        creditFacade: suite.creditFacade.address,
        underlying,
      }),
      tokens: [holding],
    },
    sdk,
  );

  // Not `valuation.weigh`: the collateral check reads a token with no quota
  // entry as unquoted, where a zero entry caps it at nothing. `quotas` is the
  // very list the borrow will send, so which of the two this is comes from
  // there.
  const weighted =
    valuation.checkedUsd(holding) * valuation.lt(collateralToken);
  const backed = quotas.some(q => eq(q.token, collateralToken))
    ? BigIntMath.min(valuation.quotaValue(holding), weighted)
    : weighted;
  if (backed <= 0n) {
    return 0n;
  }

  // `backed` is USD × PERCENTAGE_FACTOR against a health factor in basis
  // points, so the quotient is plain USD: the most the debt may be worth.
  // Truncating is what keeps the answer under the check rather than at it.
  const ceiling = BigIntMath.min(
    priceOracle.safeConvertFromUSD(underlying, backed / targetHF).value,
    suite.maxBorrowAmount().amount.value,
  );

  // Into the units the caller asked in, by the same three branches the borrow
  // itself pays out through: the underlying as it stands, an RWA asset by
  // decimals alone, anything else at the oracle's price.
  const unwrapsPayout = !!rwaAsset && eq(borrowToken, rwaAsset);
  return eq(borrowToken, underlying)
    ? ceiling
    : unwrapsPayout
      ? toTargetDecimals(ceiling, underlying, borrowToken, sdk)
      : priceOracle.safeConvert(underlying, borrowToken, ceiling).value;
}
