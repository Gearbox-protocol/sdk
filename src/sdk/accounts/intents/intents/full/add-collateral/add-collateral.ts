import {
  type AccountCalculatorOperation,
  buildAddCollateralOperation,
} from "../../../operations/index.js";
import {
  type AddCollateralIntent,
  IntentPreviewError,
  type StartIntentProps,
} from "../types.js";

/**
 * Intent 5 — add collateral.
 *
 * Single-op flow: `addCollateral(amount, token)`. The trailing quota increase is
 * appended by the caller from the simulated post-state, so it is not built here.
 *
 * Only the position token is accepted, which is why there is no swap or RWA
 * wrap leg: the deposited token is exactly what ends up on the account. Debt is
 * unchanged, so leverage falls.
 */
export function buildAddCollateralOperations(
  props: StartIntentProps & { intent: AddCollateralIntent },
): Array<AccountCalculatorOperation> {
  const { intent, creditAccount, sdk } = props;

  if (intent.amount <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "addCollateral: amount must be positive",
    );
  }

  return [
    buildAddCollateralOperation({
      token: intent.token,
      amount: intent.amount,
      value: intent.value,
      creditAccount,
      sdk,
    }),
  ];
}
