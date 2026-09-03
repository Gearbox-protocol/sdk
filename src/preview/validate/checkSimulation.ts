import type { OperationState, PreviewIssue } from "../../onchain/index.js";
import { checkDebtLimits, toToken } from "../../onchain/index.js";
import type { OnchainSDK } from "../../onchain/OnchainSDK.js";
import { firstIssue } from "../../onchain/validation/legacy-issue.js";
import type { CheckOperationOptions } from "./checkOperation.js";
import {
  collateralIssue,
  marketIssues,
  quotaCountIssue,
} from "./checkOperation.js";

/**
 * Whether a simulated operation clears the caller's own thresholds.
 *
 * The engine holds an account to the facade's `1.0`, because its guards answer
 * "would this revert". A form is wiser to ask for more, and the engine's own
 * note says so — a caller wanting the stricter threshold applies it itself.
 * This is that second opinion, over the numbers the engine already reported.
 *
 * Three of the checks below the engine does not make at all: both health-factor
 * thresholds are its own `1.0`, and the quota count it never weighs. The other
 * two run against the same numbers the engine used, and are here so that a
 * change in the engine cannot pass silently.
 *
 * What is deliberately absent: the forbidden-token, quota-limit and funding
 * checks all need the *delta* an operation applies, and `OperationState` reports
 * only the state after it. Weighing them against absolutes would refuse a
 * forbidden token the account merely holds, or a quota the operation never
 * touched. The engine performed all three during the walk, so a simulation that
 * came back `ok` has already passed them.
 */
export function checkSimulation(
  input: { sdk: OnchainSDK; state: OperationState },
  options: CheckOperationOptions = {},
): PreviewIssue | null {
  const { sdk, state } = input;
  const suite = sdk.marketRegister.findCreditManager(state.creditManager);

  return (
    marketIssues(suite) ||
    firstIssue(
      checkDebtLimits({
        debt: state.totalDebt.value,
        minDebt: suite.creditFacade.minDebt,
        maxDebt: suite.creditFacade.maxDebt,
        underlying: toToken(sdk, suite.market.pool.underlying),
        // A simulated adjustment may end owing nothing, as one being previewed may.
        allowZero: true,
      }),
    ) ||
    quotaCountIssue(suite, state) ||
    collateralIssue(state, options)
  );
}
