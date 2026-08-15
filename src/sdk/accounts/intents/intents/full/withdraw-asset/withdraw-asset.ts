import {
  type AccountCalculatorOperation,
  buildWithdrawCollateralOperation,
} from "../../../operations/index.js";
import {
  balanceOf,
  IntentPreviewError,
  type StartIntentProps,
  type WithdrawAssetIntent,
} from "../types.js";

/**
 * Intent 4 — withdraw one asset that already sits on the account.
 *
 * `withdrawCollateral(amount, token) → to`, plus a forced RWA unwrap when the
 * token is the wrapped underlying of an RWA market. The trailing quota decrease
 * is appended by the caller from the simulated post-state.
 *
 * Debt is untouched, so leverage rises and the health factor falls. The token
 * must already be on the account — this flow never routes or swaps to obtain it.
 */
export async function buildWithdrawAssetOperations(
  props: StartIntentProps & { intent: WithdrawAssetIntent },
): Promise<Array<AccountCalculatorOperation>> {
  const { intent, creditAccount, sdk } = props;

  if (intent.amount <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "withdrawAsset: amount must be positive",
    );
  }

  const available = balanceOf(creditAccount, intent.token);
  if (available < intent.amount) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdrawAsset: account holds ${available} of ${intent.token}, needs ${intent.amount}`,
    );
  }

  return buildWithdrawCollateralOperation({
    token: intent.token,
    amount: intent.amount,
    to: intent.to,
    underlying: creditAccount.underlying,
    creditAccount,
    sdk,
  });
}
