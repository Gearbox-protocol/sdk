import type { Address } from "viem";
import type {
  DebtOutOfRangeError,
  InsufficientCollateralError,
  QuotaCountExceededError,
} from "../../model/index.js";
import type { OperationState } from "../accounts/intents/types.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { PoolSimulation } from "../pools/types.js";
import { checkAccountQuotas } from "./bundles/checkAccountQuotas.js";
import type { HealthFactorThresholds } from "./bundles/checkHealthFactors.js";
import { checkHealthFactors } from "./bundles/checkHealthFactors.js";
import type { MarketStateError } from "./bundles/checkMarket.js";
import { checkMarket } from "./bundles/checkMarket.js";
import type { PoolOperationError } from "./bundles/checkPoolOperation.js";
import { checkPoolOperation } from "./bundles/checkPoolOperation.js";
import { checkDebtLimits } from "./checks/index.js";
import { toToken } from "./helpers/index.js";

/** A simulated credit operation, as the intents engine reports one. */
export interface CreditSimulationInput {
  sdk: OnchainSDK;
  state: OperationState;
}

/**
 * A simulated pool operation. The pool comes alongside the state, which names
 * the tokens moving through it but not the market they belong to.
 */
export interface PoolSimulationInput {
  sdk: OnchainSDK;
  pool: Address;
  state: PoolSimulation;
  /** Whether the operation puts liquidity in rather than taking it out. */
  isDeposit: boolean;
}

export type CheckSimulationInput = CreditSimulationInput | PoolSimulationInput;

/** {@inheritDoc checkSimulation} */
export type SimulationValidationError =
  | MarketStateError
  | DebtOutOfRangeError
  | QuotaCountExceededError
  | InsufficientCollateralError
  | PoolOperationError;

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
 * A pool operation has no account to weigh, so what is left is the pool's own
 * state — which the engine does not read either.
 */
export function checkSimulation(
  input: CheckSimulationInput,
  options: HealthFactorThresholds = {},
): SimulationValidationError[] {
  if ("pool" in input) {
    const { sdk, pool, state, isDeposit } = input;
    return checkPoolOperation({
      sdk,
      pool,
      isDeposit,
      tokenOut: state.tokenOut,
    });
  }

  const { sdk, state } = input;
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
    }),
    ...checkAccountQuotas(suite, state),
    ...checkHealthFactors(state, options),
  ];
}
