import type { Address } from "viem";
import {
  insufficientBalance,
  type TokenAmount,
  unsupportedCollateralToken,
} from "../../../model/index.js";
import type { Asset, MultiCall, OnchainSDK } from "../../index.js";
import type { ConvertFn } from "../../market/oracle/types.js";
import type { AccountSnapshot } from "../../positions/types.js";
import { toToken } from "../../validation/index.js";
import { IntentPreviewError } from "../../validation/raise.js";
import {
  assertCanBorrow,
  assertCollateralised,
  assertGrowthAllowed,
  assertMarketOperable,
  assertQuotaAvailable,
} from "./guards.js";
import { assertDebtLimits } from "./math.js";
import type { CreditAccountSlice, OperationState } from "./types.js";
import {
  collectPriceImpact,
  createRouterPaths,
  eq,
  getQuotasForUpdate,
  toTargetDecimals,
  unopenedAccountSlice,
} from "./utils/index.js";

/**
 * Taking a loan against collateral, in one transaction that opens the account.
 *
 * The plainest thing a credit account can do, and the one shape of it the
 * leveraged flows cannot express: the borrowed funds do not stay on the
 * account to be traded, they go to the wallet. What is left behind is the
 * collateral and the debt it backs.
 */
export interface BorrowProps {
  sdk: OnchainSDK;
  /** Credit manager to open the account in. */
  creditManager: Address;
  /** Token the wallet puts up, in the manager's collateral list. */
  collateralToken: Address;
  /** Amount of {@link collateralToken}, in its own units. */
  collateralAmount: bigint;
  /**
   * Token the loan is paid out in. The market underlying needs no trade;
   * anything else is bought with the borrowed underlying on the way out.
   *
   * On an RWA market the underlying is a compliance wrapper that cannot leave
   * the account, so the payout there is the asset behind it — USDC rather than
   * dcUSDC — and the wrapper itself is refused.
   */
  borrowToken: Address;
  /** Amount of {@link borrowToken} the wallet asks for, in its own units. */
  borrowAmount: bigint;
  /** Router slippage in PERCENTAGE_FORMAT (100% = 10_000). */
  slippage: number | undefined;
  /** Extra quota headroom in PERCENTAGE_FORMAT. */
  quotaReserve: number | undefined;
  /**
   * Existing credit account to draw the loan on, instead of opening one.
   *
   * Must carry no debt and no quotas, as a reused opening must. Borrowing on
   * an account that already owes is what the `ADJUST_LEVERAGE` intent is for.
   **/
  creditAccount?: CreditAccountSlice;
}

/**
 * Where a borrow leaves the wallet and the account it opens.
 *
 * A whole {@link OperationState}, holdings included: unlike an opening, a
 * borrow has no second branch of balances to choose between — the collateral
 * is the only thing left on the account and its amount is known exactly.
 * Slippage lands on the payout instead, which is why that one is reported
 * twice.
 *
 * Being that state rather than merely resembling it is what lets a borrow
 * result go straight to `checkSimulation`, which weighs whatever the engine
 * projected: the market, the debt, the quotas and the two factors, all of
 * which a borrow reports where an operation on an existing account does.
 */
export interface BorrowState extends OperationState {
  /** What the wallet puts up, as it will sit on the account. */
  collateral: TokenAmount;
  /**
   * What the wallet is expected to receive, in the token it asked for. Equal
   * to the debt when that token is the market underlying, and to the debt
   * rescaled where an RWA payout unwraps it one for one; in neither case is
   * anything traded.
   */
  borrowed: TokenAmount;
  /**
   * The floor under {@link borrowed} once slippage is allowed for — what the
   * transaction is signed against. Equal to `borrowed` when nothing is traded.
   */
  minBorrowed: TokenAmount;
  /**
   * Router slippage the payout leg was quoted at, in PERCENTAGE_FORMAT
   * (100% = 10_000). The SDK's own default where the caller named none.
   */
  slippage: number;
  /**
   * Quota to buy for the collateral; feeds `openCA.averageQuota` and
   * `openCA.minQuota` alike, both branches being the same here.
   *
   * Transport for the transaction rather than something to display, like
   * {@link calls} below.
   */
  quotaIncrease: Asset[];
  /**
   * The leg that turns the borrowed underlying into the payout: a router path
   * where it is bought, the vault redemption where an RWA market unwraps it,
   * empty where the payout is the underlying itself. Feeds `openCA.calls`,
   * which places it before the withdrawal.
   */
  calls: MultiCall[];
  /**
   * The account this loan was simulated against and must be executed on, when
   * it reuses one; `undefined` for a borrow that opens its own.
   *
   * Carried here rather than asked of the caller again at `buildTx`, so the
   * transaction cannot be built against an account the numbers were not
   * computed for.
   **/
  creditAccount?: Address;
}

/**
 * Builds the state a borrow would leave behind.
 *
 * The debt is named rather than derived: a borrow asks for an amount, where an
 * opening asks for a leverage and lets the collateral decide. Everything the
 * loan pays out leaves the account, so the collateral alone backs it — which
 * is what makes the health factor here a straight function of the two amounts.
 *
 * Produces no operation list, as opening never does: the caller hands the
 * numbers and the calls to `sdk.accounts.openCA`, with `withdrawToken` set to
 * the payout.
 */
export async function buildBorrowState(
  props: BorrowProps,
): Promise<BorrowState> {
  const {
    sdk,
    creditManager,
    collateralAmount,
    borrowAmount,
    slippage = 0,
    quotaReserve,
    creditAccount: existing,
  } = props;

  const suite = sdk.marketRegister.findCreditManager(creditManager);
  const market = sdk.marketRegister.findByCreditManager(creditManager);
  assertMarketOperable(suite);

  const underlying = market.pool.underlying.toLowerCase() as Address;
  const collateralToken = props.collateralToken.toLowerCase() as Address;
  const borrowToken = props.borrowToken.toLowerCase() as Address;
  const convert: ConvertFn = (from, to, amount) =>
    market.priceOracle.safeConvert(from, to, amount).value;

  // The payout is swept with `MAX_UINT256` — the facade hands over whatever
  // balance it finds, which is the only way a trade that beat its floor
  // strands nothing. Borrowing the collateral token would put the collateral
  // in that sweep, so it is refused here rather than reverted on arrival.
  if (eq(collateralToken, borrowToken)) {
    throw new IntentPreviewError(
      unsupportedCollateralToken(toToken(sdk, collateralToken)),
      "borrow: the payout token cannot also be the collateral",
    );
  }

  // An RWA market lends a compliance wrapper (dcUSDC) that cannot leave the
  // account, so a loan paid out of one is paid in the asset behind it (USDC).
  // The leg between them is not a trade: the two convert one for one and the
  // vault adapter is what does it, which is why nothing is quoted and there is
  // no floor to report. `plan.ts` withdraws by the same rule and `realize`
  // rescales with the same helper.
  const rwaAsset = sdk.tokensMeta.rwaUnderlyings
    .get(underlying)
    ?.asset?.toLowerCase() as Address | undefined;
  const unwrapsPayout = !!rwaAsset && eq(borrowToken, rwaAsset);
  if (rwaAsset && eq(borrowToken, underlying)) {
    throw new IntentPreviewError(
      unsupportedCollateralToken(toToken(sdk, borrowToken)),
      `borrow: ${underlying} cannot leave the account, ask for the payout in ${rwaAsset}`,
    );
  }
  if (collateralAmount <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      "borrow: no collateral supplied",
    );
  }
  if (borrowAmount <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      "borrow: nothing to borrow",
    );
  }

  const margin = convert(collateralToken, underlying, collateralAmount);
  if (margin <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      "borrow: collateral is worth nothing in underlying",
    );
  }

  // A loan is denominated in the pool underlying whatever the wallet is paid
  // in, so a payout in another token is priced back into it. The oracle is
  // what sizes the debt; the router then says what that debt actually buys.
  // The wrapper's own asset is the exception: it converts by decimals alone,
  // which is the arithmetic the vault will do on chain.
  const debt = eq(borrowToken, underlying)
    ? borrowAmount
    : unwrapsPayout
      ? toTargetDecimals(borrowAmount, borrowToken, underlying, sdk)
      : convert(borrowToken, underlying, borrowAmount);
  assertDebtLimits(sdk, debt, suite.creditFacade, underlying);
  assertCanBorrow(sdk, suite, debt);

  // Synthetic slice so the router helper can be reused even though no account
  // exists yet. A reused one is handed over as it stands.
  const account: CreditAccountSlice =
    existing ??
    unopenedAccountSlice({
      creditManager,
      creditFacade: suite.creditFacade.address,
      underlying,
    });
  const leg =
    eq(borrowToken, underlying) || unwrapsPayout
      ? undefined
      : await createRouterPaths({ sdk, creditAccount: account, slippage }).swap(
          {
            tokenIn: underlying,
            tokenOut: borrowToken,
            amount: debt,
            // Underlying collateral sits beside the loan and must survive the
            // trade; anything else is untouched by it anyway.
            keep: eq(collateralToken, underlying) ? collateralAmount : 0n,
          },
        );

  // The vault call the payout leaves through, sized to the debt just drawn
  // rather than to the balance — collateral put up in the wrapper stays
  // wrapped and backs the loan, where a diff redemption would take it too.
  const unwrap = unwrapsPayout
    ? await sdk.accounts.assembleRWAUnwrapCalls(debt, creditManager)
    : undefined;
  if (unwrapsPayout && !unwrap) {
    // The market says its underlying is RWA-gated, so the only way here is a
    // vault with no adapter configured: nothing a caller can answer for.
    throw new Error(`borrow: no unwrap calls found for ${borrowToken}`);
  }

  const assets: Asset[] = [
    { token: collateralToken, balance: collateralAmount },
  ];
  const quotaIncrease = borrowCollateralQuota({
    sdk,
    creditManager,
    assets,
    quotaReserve,
  });

  assertGrowthAllowed({ sdk, suite, market, before: [], after: assets });
  assertQuotaAvailable(sdk, market, quotaIncrease);

  // The loan is gone by the end of the multicall, so the collateral is the
  // whole of what the account is worth.
  const snapshot: AccountSnapshot = {
    creditManager,
    assets,
    quotas: quotaIncrease,
    totalDebt: debt,
    totalValue: margin,
  };
  const projection = sdk.positions.projection(snapshot, {
    availableLiquidityChange: -debt,
  });
  // The transaction hands funds to the wallet, so the facade weighs what is
  // left at safe prices — the factor that decides it, not the one beside it.
  assertCollateralised(projection.safeHealthFactor, true);

  const priced = (token: Address, balance: bigint): TokenAmount =>
    market.priceOracle.toTokenAmount(token, balance);

  // What the wallet ends up holding: the route's quote, the rescale the unwrap
  // performs, or the debt itself where the payout is the underlying.
  const payout = unwrapsPayout
    ? toTargetDecimals(debt, underlying, borrowToken, sdk)
    : leg
      ? leg.amount
      : debt;

  return {
    ...projection,
    currentPrice: sdk.positions.currentPrice(snapshot),
    // Not measured here. The field answers what an operation gave up on its
    // way between two states of the same account, which a borrow has no
    // second of: the payout leaves, and what it cost on the way out is
    // `borrowed` against `totalDebt` — reported in the tokens themselves
    // rather than as a rate, with `priceImpact` beside them for the depth.
    executionCost: undefined,
    priceImpact: await collectPriceImpact(leg?.probe ? [leg.probe] : [], {
      totalValue: margin,
      // Nothing of the loan stays behind, so the collateral is the equity.
      netValue: margin - debt,
      toUnderlying: (from, amount) => convert(from, underlying, amount),
      toUnderlyingAmount: market.toUnderlyingAmount,
    }),
    collateral: priced(collateralToken, collateralAmount),
    borrowed: priced(borrowToken, payout),
    minBorrowed: priced(borrowToken, leg ? leg.minAmount : payout),
    slippage,
    quotaIncrease,
    calls: leg ? [...leg.calls] : (unwrap ?? []),
    creditAccount: existing?.creditAccount,
  };
}

/** Inputs of {@link borrowCollateralQuota}. */
export interface BorrowCollateralQuotaProps {
  sdk: OnchainSDK;
  creditManager: Address;
  /** Collateral the fresh account will hold. */
  assets: Asset[];
  /** Extra quota headroom in PERCENTAGE_FORMAT. */
  quotaReserve: number | undefined;
}

/**
 * Quota a borrow buys for its collateral on an account that holds none yet.
 *
 * Shared with `maxBorrow`, because a quota short of the collateral's weighted
 * value is what caps the loan: the two have to read the same number or the
 * ceiling one offers is one the other refuses.
 *
 * @param props - {@link BorrowCollateralQuotaProps}
 **/
export function borrowCollateralQuota({
  sdk,
  creditManager,
  assets,
  quotaReserve,
}: BorrowCollateralQuotaProps): Asset[] {
  const suite = sdk.marketRegister.findCreditManager(creditManager);
  const market = sdk.marketRegister.findByCreditManager(creditManager);

  return getQuotasForUpdate({
    assetsBefore: [],
    assetsAfter: assets,
    initialQuotas: [],
    quotaReserve,
    underlyingToken: market.pool.underlying,
    liquidationThresholds: suite.creditManager.liquidationThresholds,
    quotas: market.pool.pqk.quotas,
    maxDebt: suite.creditFacade.maxDebt,
    convert: (from, to, amount) =>
      market.priceOracle.safeConvert(from, to, amount).value,
  }).quotaIncrease;
}
