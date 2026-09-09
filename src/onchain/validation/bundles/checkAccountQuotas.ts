import type {
  AccountProjection,
  QuotaCountExceededError,
} from "../../../model/index.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { checkQuotaCount } from "../checks/index.js";

/**
 * How many quoted tokens the account would end up holding, against the number
 * the facade enables at once.
 *
 * Reads nothing but the projected account, so a parsed transaction and a
 * simulated one are held to it by the same code — including the reading that a
 * quota the operation zeroed out is no longer held.
 */
export function checkAccountQuotas(
  suite: CreditSuite,
  account: Pick<AccountProjection, "quotas">,
): QuotaCountExceededError[] {
  return checkQuotaCount({
    count: account.quotas.filter(q => q.value > 0n).length,
    max: suite.creditManager.maxEnabledTokens,
  });
}
