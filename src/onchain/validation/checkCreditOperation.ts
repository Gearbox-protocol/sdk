import type {
  AdjustStrategyPositionPreview,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  OpenStrategyPositionPreview,
  QuotaCountExceededError,
  QuotaLimitReachedError,
  Token,
} from "../../model/index.js";
import type { CreditSuite } from "../market/credit/CreditSuite.js";
import type { MarketSuite } from "../market/MarketSuite.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { checkAccountQuotas } from "./checkAccountQuotas.js";
import type { HealthFactorThresholds } from "./checkHealthFactors.js";
import { checkHealthFactors } from "./checkHealthFactors.js";
import type { MarketStateError } from "./checkMarket.js";
import { checkMarket } from "./checkMarket.js";
import {
  checkBorrowLimit,
  checkDebtLimits,
  checkForbiddenToken,
  checkQuotaLimit,
} from "./checks/index.js";
import { toToken } from "./token.js";

/** {@inheritDoc checkCreditOperation} */
export type CreditOperationError =
  | MarketStateError
  | DebtOutOfRangeError
  | InsufficientPoolLiquidityError
  | ForbiddenTokenError
  | QuotaCountExceededError
  | QuotaLimitReachedError
  | InsufficientCollateralError;

/** The two previews that carry a position for the thresholds to weigh. */
export type CreditOperationPreview =
  | OpenStrategyPositionPreview
  | AdjustStrategyPositionPreview;

export interface CreditOperationArgs extends HealthFactorThresholds {
  sdk: OnchainSDK;
  preview: CreditOperationPreview;
}

/**
 * What the protocol stops a credit operation for, read off the preview alone.
 *
 * The array is in check order, most fundamental first: the market's own state,
 * then what the facade would revert on, then what the operation asks the
 * market for, and last the account it leaves behind.
 */
export function checkCreditOperation(
  args: CreditOperationArgs,
): CreditOperationError[] {
  const { sdk, preview, ...thresholds } = args;
  const suite = sdk.marketRegister.findCreditManager(preview.creditManager);
  const market = suite.market;
  const underlying = toToken(sdk, market.pool.underlying);
  const isOpening =
    preview.operation === "OpenCreditAccount" ||
    preview.operation === "RWAOpenCreditAccount";

  return [
    ...checkMarket(suite),
    // An account being opened has to carry a real loan; one being adjusted may
    // end owing nothing at all.
    ...checkDebtLimits({
      debt: preview.totalDebt.value,
      minDebt: suite.creditFacade.minDebt,
      maxDebt: suite.creditFacade.maxDebt,
      underlying,
      allowZero: !isOpening,
    }),
    ...checkDraw(suite, preview, underlying),
    ...checkObtained(suite, preview),
    ...checkAccountQuotas(suite, preview),
    ...checkQuotasAsked(market, preview, underlying),
    // The floor branch, since that is the only one a parsed transaction carries.
    ...checkHealthFactors(
      {
        totalDebt: preview.totalDebt,
        healthFactor: preview.estHealthFactor,
        safeHealthFactor: preview.estSafeHealthFactor,
      },
      thresholds,
    ),
  ];
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
function checkDraw(
  suite: CreditSuite,
  preview: CreditOperationPreview,
  underlying: Token,
): InsufficientPoolLiquidityError[] {
  const drawn =
    preview.operation === "AdjustCreditAccount"
      ? preview.totalDebtChange.value
      : preview.totalDebt.value;
  if (drawn <= 0n) {
    return [];
  }
  const { value, limit } = suite.maxBorrowAmount();
  return checkBorrowLimit({
    requested: drawn,
    available: value,
    limit,
    underlying,
  });
}

/** Every token the operation buys more of, against what the market forbids. */
function checkObtained(
  suite: CreditSuite,
  preview: CreditOperationPreview,
): ForbiddenTokenError[] {
  const obtained =
    preview.operation === "AdjustCreditAccount"
      ? preview.assetsChange
      : preview.estAssets;

  return obtained
    .filter(asset => asset.value > 0n)
    .flatMap(asset =>
      checkForbiddenToken({
        token: asset.token,
        isForbidden: suite.isForbidden(asset.token.address),
      }),
    );
}

/** Every quota the operation raises, against the room the keeper has left. */
function checkQuotasAsked(
  market: MarketSuite,
  preview: CreditOperationPreview,
  underlying: Token,
): QuotaLimitReachedError[] {
  const increases =
    preview.operation === "AdjustCreditAccount"
      ? preview.quotasChange
      : preview.quotas;

  const { pqk } = market.pool;

  return increases
    .filter(q => q.value > 0n)
    .flatMap(q => {
      // A token the market quotes nothing for has no ceiling to weigh against
      // and counts as no collateral — the same reading the engine's guard takes.
      const quoted = pqk.hasActiveQuota(q.token.address);
      return checkQuotaLimit({
        token: q.token,
        requested: quoted ? q.value : undefined,
        available: quoted ? pqk.quotaAvailable(q.token.address) : 0n,
        underlying,
      });
    });
}
