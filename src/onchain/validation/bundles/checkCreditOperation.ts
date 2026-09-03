import type {
  AdjustStrategyPositionPreview,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  OpenStrategyPositionPreview,
  QuotaCountExceededError,
  QuotaLimitReachedError,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { checkDebtLimits } from "../checks/index.js";
import { toToken } from "../helpers/index.js";
import { checkAccountQuotas } from "./checkAccountQuotas.js";
import { checkDraw } from "./checkDraw.js";
import type { HealthFactorThresholds } from "./checkHealthFactors.js";
import { checkHealthFactors } from "./checkHealthFactors.js";
import type { MarketStateError } from "./checkMarket.js";
import { checkMarket } from "./checkMarket.js";
import { checkObtained } from "./checkObtained.js";
import { checkQuotasAsked } from "./checkQuotasAsked.js";

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
