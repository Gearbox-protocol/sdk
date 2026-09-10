import type {
  ChainId,
  DebtOutOfRangeError,
  InsufficientCollateralError,
  QuotaCountExceededError,
} from "../../model/index.js";
import type { OperationState } from "../accounts/intents/types.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { checkAccountQuotas } from "./bundles/checkAccountQuotas.js";
import type { HealthFactorThresholds } from "./bundles/checkHealthFactors.js";
import { checkHealthFactors } from "./bundles/checkHealthFactors.js";
import type { MarketStateError } from "./bundles/checkMarket.js";
import { checkMarket } from "./bundles/checkMarket.js";
import { checkDebtLimits } from "./checks/index.js";
import { toToken } from "./helpers/index.js";

/** A simulated credit operation, as the intents engine reports one. */
export interface CreditSimulationInput {
  chainId: ChainId;
  state: OperationState;
}

export type CheckSimulationInput = CreditSimulationInput;

/** {@inheritDoc checkSimulation} */
export type SimulationValidationError =
  | MarketStateError
  | DebtOutOfRangeError
  | QuotaCountExceededError
  | InsufficientCollateralError;

/**
 * Whether a simulated operation clears the caller's own thresholds.
 *
 * The engine holds an account to the facade's `1.0`, because its guards answer
 * "would this revert". A form is wiser to ask for more, and the engine's own
 * note says so — a caller wanting the stricter threshold applies it itself.
 * This is that second opinion, over the numbers the engine already reported.
 *
 * Three of the checks on a credit account the engine does not make at all:
 * both health-factor thresholds are its own `1.0`, and the quota count it never
 * weighs. The other two run against the same numbers the engine used, and are
 * here so that a change in the engine cannot pass silently.
 *
 * What is deliberately absent: the forbidden-token, quota-limit and funding
 * checks all need the *delta* an operation applies, and `OperationState` reports
 * only the state after it. Weighing them against absolutes would stop a
 * forbidden token the account merely holds, or a quota the operation never
 * touched. The engine performed all three during the walk, so a simulation that
 * came back `ok` has already passed them.
 *
 * A credit account only: a pool operation has no account to weigh, and the
 * three things its own state decides are read by `prepare` before it answers.
 */
export function checkSimulation(
  sdk: OnchainSDK,
  input: CheckSimulationInput,
  options: HealthFactorThresholds = {},
): SimulationValidationError[] {
  const { state } = input;
  const suite = sdk.marketRegister.findCreditManager(state.creditManager);

  return [
    ...checkMarket(suite),
    ...checkDebtLimits({
      debt: state.totalDebt.value,
      minDebt: suite.creditFacade.minDebt,
      maxDebt: suite.creditFacade.maxDebt,
      underlying: toToken(sdk, suite.market.pool.underlying),
      // A simulated adjustment may end owing nothing, as one being previewed may.
      allowZero: true,
      ceiling: suite.maxBorrowAmount(),
    }),
    ...checkAccountQuotas(suite, state),
    ...checkHealthFactors(state, options),
  ];
}
