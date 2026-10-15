import { isAddressEqual } from "viem";
import type {
  DebtOutOfRangeError,
  ForbiddenTokenError,
  QuotaAboveMaxError,
  Token,
} from "../../../model/index.js";
import { debtOutOfRange } from "../../../model/index.js";
import { MAX_QUOTA_MULTIPLIER } from "../../constants/math.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { checkForbiddenToken, checkMaxQuota } from "../checks/index.js";
import { amountOf } from "../helpers/index.js";
import type { CreditOperationPreview } from "./checkCreditOperation.js";

/** {@inheritDoc checkQuotaUpdates} */
export type QuotaUpdateError =
  | ForbiddenTokenError
  | DebtOutOfRangeError
  | QuotaAboveMaxError;

/**
 * What the facade reverts on in each quota the operation touches: an increase
 * on a forbidden token, an increase on an account that ends with zero debt, and
 * a resulting quota above `MAX_QUOTA_MULTIPLIER × maxDebt`.
 */
export function checkQuotaUpdates(
  suite: CreditSuite,
  preview: CreditOperationPreview,
  underlying: Token,
): QuotaUpdateError[] {
  const isAdjust = preview.operation === "AdjustCreditAccount";
  const changes = (isAdjust ? preview.quotasChange : preview.quotas).filter(
    q => q.value !== 0n,
  );
  const increases = changes.filter(q => q.value > 0n);
  const { minDebt, maxDebt } = suite.creditFacade;
  const maxQuota = MAX_QUOTA_MULTIPLIER * maxDebt;

  const forbidden = increases.flatMap(q =>
    checkForbiddenToken({
      token: q.token,
      isForbidden: suite.isForbidden(q.token.address),
    }),
  );
  // An opening with zero debt is already refused by `checkDebtLimits`.
  const isZeroDebt =
    isAdjust && increases.length > 0 && preview.totalDebt.value === 0n
      ? [
          debtOutOfRange({
            requested: amountOf(underlying, 0n),
            minDebt: amountOf(underlying, minDebt),
            maxDebt: amountOf(underlying, maxDebt),
          }),
        ]
      : [];
  const aboveMax = changes.flatMap(q =>
    checkMaxQuota({
      token: q.token,
      requested:
        preview.quotas.find(r =>
          isAddressEqual(r.token.address, q.token.address),
        )?.value ?? 0n,
      maxQuota,
      underlying,
    }),
  );
  return [...forbidden, ...isZeroDebt, ...aboveMax];
}
