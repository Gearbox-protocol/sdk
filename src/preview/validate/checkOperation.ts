import type {
  AccountHoldings,
  AccountMetrics,
  AccountProjection,
  AdjustStrategyPositionPreview,
  Bps,
  OpenStrategyPositionPreview,
  OperationPreview,
  PoolPositionOperationPreview,
  Token,
} from "../../model/index.js";
import type {
  AddressMap,
  CreditSuite,
  MarketSuite,
  OnchainSDK,
  OperationCheckError,
} from "../../onchain/index.js";

import {
  checkBorrowLimit,
  checkCollateralised,
  checkCreditManagerPaused,
  checkDebtLimits,
  checkForbiddenToken,
  checkFunding,
  checkMarketExpired,
  checkPoolPaused,
  checkPoolPayout,
  checkPoolSunset,
  checkPreviewError,
  checkQuotaCount,
  checkQuotaLimit,
  toToken,
} from "../../onchain/index.js";

/** Omitting a threshold switches its check off — there is no single right one. */
export interface CheckOperationOptions {
  /** Lowest acceptable health factor at main prices, in bps. */
  minHealthFactor?: Bps;
  /** Lowest acceptable health factor at safe prices, in bps. */
  minSafeHealthFactor?: Bps;
  /**
   * Balances the operation is funded from, by token. Given, the wallet's side
   * is checked offline; omitted, funding is left to `checkPrerequisites`.
   */
  balances?: AddressMap<bigint>;
  /**
   * The factor the account stands at now. Given, an operation that raises it
   * passes even from under the required factor — the top-ups that rescue a
   * position would otherwise be refused by the very check meant to protect it.
   */
  currentHealthFactor?: Bps;
}

/**
 * Whether a parsed operation may be signed at all — the protocol state that
 * `checkPrerequisites` leaves out, since that one covers only what the sender
 * can fix themselves.
 *
 * Synchronous: the preview carries the numbers and the market is attached.
 * Reports the most fundamental issue it finds and stops there, which is the one
 * a caller acts on.
 */
export function checkOperation(
  input: { sdk: OnchainSDK; preview: OperationPreview },
  options: CheckOperationOptions = {},
): OperationCheckError | null {
  const { sdk, preview } = input;

  // Every check below reads fields this error declares untrustworthy.
  const malformed = first(
    checkPreviewError("warning" in preview ? preview.warning : undefined),
  );
  if (malformed) {
    return malformed;
  }

  switch (preview.operation) {
    case "Deposit":
    case "Mint":
      return poolIssues(sdk, preview, options, true);
    case "Withdraw":
    case "Redeem":
      return poolIssues(sdk, preview, options, false);
    case "DelayedCreditAccountOperation":
      // A delayed operation is judged on the half that executes now.
      return checkOperation({ sdk, preview: preview.instantPreview }, options);
    case "OpenCreditAccount":
    case "RWAOpenCreditAccount":
    case "AdjustCreditAccount":
      return creditIssues(sdk, preview, options);
    case "CloseCreditAccount":
    case "RepayCreditAccount":
      // They carry a projection of the wound-down account, but the loan is
      // gone (`totalDebt` is always 0), so the health-factor thresholds would
      // no-op.
      // Only the market's own state can refuse one.
      return marketIssues(
        sdk.marketRegister.findCreditManager(preview.creditManager),
      );
  }
}

function first<E>(errors: readonly E[]): E | null {
  return errors[0] ?? null;
}

function poolIssues(
  sdk: OnchainSDK,
  preview: PoolPositionOperationPreview,
  options: CheckOperationOptions,
  isDeposit: boolean,
): OperationCheckError | null {
  const market = sdk.marketRegister.findByPool(preview.pool);
  return (
    first(
      checkPoolPaused({
        isPaused: market.pool.pool.isPaused,
        pool: preview.pool,
      }),
    ) ||
    first(
      checkPoolSunset({
        isSunset: market.sunset,
        isDeposit,
        pool: preview.pool,
      }),
    ) ||
    // A payout is served out of what the pool actually holds.
    (isDeposit
      ? null
      : first(
          checkPoolPayout({
            requested: preview.tokenOut.value,
            available: market.pool.pool.availableLiquidity,
            underlying: preview.tokenOut.token,
          }),
        )) ||
    fundingIssue(options, [preview.tokenIn])
  );
}

/** What the market itself stops, whatever the operation does. */
export function marketIssues(suite: CreditSuite): OperationCheckError | null {
  const creditManager = suite.creditManager.address;
  return (
    first(
      checkCreditManagerPaused({ isPaused: suite.isPaused, creditManager }),
    ) ||
    first(
      checkMarketExpired({
        isExpired: suite.isExpired,
        creditManager,
        expirationDate: suite.creditFacade.expirationDate,
      }),
    )
  );
}

function creditIssues(
  sdk: OnchainSDK,
  preview: CreditPreview,
  options: CheckOperationOptions,
): OperationCheckError | null {
  const suite = sdk.marketRegister.findCreditManager(preview.creditManager);
  const market = suite.market;
  const underlying = toToken(sdk, market.pool.underlying);
  const isOpening =
    preview.operation === "OpenCreditAccount" ||
    preview.operation === "RWAOpenCreditAccount";

  return (
    marketIssues(suite) ||
    // An account being opened has to carry a real loan; one being adjusted may
    // end owing nothing at all.
    first(
      checkDebtLimits({
        debt: preview.totalDebt.value,
        minDebt: suite.creditFacade.minDebt,
        maxDebt: suite.creditFacade.maxDebt,
        underlying,
        allowZero: !isOpening,
      }),
    ) ||
    borrowIssue(suite, preview, underlying) ||
    forbiddenIssue(suite, preview) ||
    quotaCountIssue(suite, preview) ||
    quotaIssue(market, preview, underlying) ||
    // The floor branch, since that is the only one a parsed transaction carries.
    collateralIssue(
      {
        totalDebt: preview.totalDebt,
        healthFactor: preview.estHealthFactor,
        safeHealthFactor: preview.estSafeHealthFactor,
      },
      options,
    ) ||
    fundingIssue(options, preview.collateralAdded)
  );
}

/**
 * A check that reads nothing but the projected account, so a parsed transaction
 * and a simulated one are held to it by the same code.
 *
 * These stay separate functions rather than one block because the order the
 * checks run in is the answer: `checkOperation` interleaves the checks that
 * need an operation's *delta* between them, and the caller acts on the first
 * issue reported.
 */
export function quotaCountIssue(
  suite: CreditSuite,
  account: Pick<AccountProjection, "quotas">,
): OperationCheckError | null {
  return first(
    checkQuotaCount({
      count: account.quotas.filter(q => q.value > 0n).length,
      max: suite.creditManager.maxEnabledTokens,
    }),
  );
}

/**
 * What the transaction draws, against what the market can lend right now.
 *
 * Only a draw is weighed: repaying, or leaving the debt alone, can never exceed
 * a ceiling. Opening borrows the whole debt; adjusting borrows
 * `totalDebtChange`.
 *
 * The engine holds every simulation to this already (`assertCanBorrow`), so
 * this is here for the transactions it never saw — a pasted calldata reaches
 * the confirm screen with nothing else standing between it and a revert.
 */
function borrowIssue(
  suite: CreditSuite,
  preview: CreditPreview,
  underlying: Token,
): OperationCheckError | null {
  const drawn =
    preview.operation === "AdjustCreditAccount"
      ? preview.totalDebtChange.value
      : preview.totalDebt.value;
  if (drawn <= 0n) {
    return null;
  }
  const { value, limit } = suite.maxBorrowAmount();
  return first(
    checkBorrowLimit({
      requested: drawn,
      available: value,
      limit,
      underlying,
    }),
  );
}

/**
 * An account's factors, in whichever branch of a routed leg the caller means to
 * be held to: `prepare` reports the outcome the router expects, `preview` the
 * floor its calldata guarantees. The check is indifferent — it weighs the
 * numbers it is handed — and passing them one by one is what makes the choice
 * visible where it is made.
 */
export interface WeighedFactors
  extends Pick<AccountHoldings, "totalDebt">,
    Pick<AccountMetrics, "healthFactor" | "safeHealthFactor"> {}

/**
 * The account against whichever threshold the caller holds it to.
 *
 * A loan-free account is nothing to weigh: the health factor reports its
 * zero-debt sentinel and no threshold applies.
 *
 * {@inheritDoc quotaCountIssue}
 */
export function collateralIssue(
  account: WeighedFactors,
  options: CheckOperationOptions,
): OperationCheckError | null {
  const { minHealthFactor, minSafeHealthFactor, currentHealthFactor } = options;
  if (account.totalDebt.value === 0n) {
    return null;
  }
  return (
    (minHealthFactor === undefined
      ? null
      : first(
          checkCollateralised({
            healthFactor: account.healthFactor,
            healthFactorThreshold: minHealthFactor,
            safePrices: false,
            improvesFrom: currentHealthFactor,
          }),
        )) ||
    // The safe-price threshold is only weighed when the caller names one: it
    // is what the credit manager holds a call that hands funds over to, and a
    // transaction that hands nothing over is not judged at those prices.
    (minSafeHealthFactor === undefined
      ? null
      : first(
          checkCollateralised({
            healthFactor: account.safeHealthFactor,
            healthFactorThreshold: minSafeHealthFactor,
            safePrices: true,
          }),
        ))
  );
}

/** The two previews that carry a position for the thresholds to weigh. */
type CreditPreview =
  | OpenStrategyPositionPreview
  | AdjustStrategyPositionPreview;

/** The wallet's side of the operation, against the balances it was given. */
function fundingIssue(
  options: CheckOperationOptions,
  puts: ReadonlyArray<{ token: Token; value: bigint }>,
): OperationCheckError | null {
  const { balances } = options;
  if (!balances) {
    return null;
  }
  for (const { token, value } of puts) {
    const issue = first(
      checkFunding({
        token,
        required: value,
        held: balances.get(token.address) ?? 0n,
        holderKind: "wallet",
      }),
    );
    if (issue) {
      return issue;
    }
  }
  return null;
}

function forbiddenIssue(
  suite: CreditSuite,
  preview: CreditPreview,
): OperationCheckError | null {
  const obtained =
    preview.operation === "AdjustCreditAccount"
      ? preview.assetsChange
      : preview.estAssets;

  for (const asset of obtained) {
    if (asset.value <= 0n) {
      continue;
    }
    const issue = first(
      checkForbiddenToken({
        token: asset.token,
        isForbidden: suite.isForbidden(asset.token.address),
      }),
    );
    if (issue) {
      return issue;
    }
  }
  return null;
}

function quotaIssue(
  market: MarketSuite,
  preview: CreditPreview,
  underlying: Token,
): OperationCheckError | null {
  const increases =
    preview.operation === "AdjustCreditAccount"
      ? preview.quotasChange
      : preview.quotas;

  const { pqk } = market.pool;

  for (const q of increases) {
    if (q.value <= 0n) {
      continue;
    }
    // A token the market quotes nothing for has no ceiling to weigh against and
    // counts as no collateral — the same reading the engine's guard takes.
    const quoted = pqk.hasActiveQuota(q.token.address);
    const issue = first(
      checkQuotaLimit({
        token: q.token,
        requested: quoted ? q.value : undefined,
        available: quoted ? pqk.quotaAvailable(q.token.address) : 0n,
        underlying,
      }),
    );
    if (issue) {
      return issue;
    }
  }
  return null;
}
