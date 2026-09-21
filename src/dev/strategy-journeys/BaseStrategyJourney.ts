import assert from "node:assert/strict";
import { isAddressEqual } from "viem";
import { assertJourneyStep } from "./assertions.js";
import type {
  JourneyAction,
  JourneyExecution,
  JourneyPhase,
  JourneyResult,
  JourneySession,
  JourneyState,
  JourneyStep,
} from "./types.js";

export interface JourneyRunContext {
  result: JourneyResult;
  valueToleranceBps?: number;
  onPhase(phase: JourneyPhase): void;
}

interface JourneyOperation {
  action: JourneyAction;
  /** Wallet prerequisites such as funding; not counted as a user operation. */
  setup?(): Promise<void>;
  /** The SDK operation under test, given the position state read right before it. */
  execute(
    before: JourneyState,
  ): Promise<JourneyExecution & Pick<JourneyStep, "amount">>;
  verify(step: JourneyStep, valueToleranceBps: number): void;
}

/** Shared lifecycle: establish prerequisites, then exercise and verify SDK actions. */
export abstract class BaseStrategyJourney {
  /** The actual behavior, also composable without repeating initial setup. */
  public abstract test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void>;

  protected async setup(
    session: JourneySession,
    result: JourneyResult,
  ): Promise<void> {
    const position = await session.setupPosition();
    result.setup.position = position;
    const { state } = position;
    assert(position.transactions.length > 0, "Setup did not open an account");
    assert(
      state.debt > 0n && state.targetBalance > 0n && state.value > state.debt,
      "Setup did not create a funded leveraged position",
    );
    assert(state.healthFactor >= 10_000, "Setup position is unsafe");
    assert.equal(
      state.pendingWithdrawals,
      0,
      "Setup has unfinished withdrawals",
    );
  }

  public async run(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    const { result, onPhase } = context;
    onPhase("setup");
    await this.setup(session, result);
    result.setup.status = "passed";
    await this.test(session, context);
  }

  /** Lifecycle/reporting only: SDK calls and behavioral assertions belong to the caller. */
  protected async perform(
    session: JourneySession,
    { result, valueToleranceBps = 100, onPhase }: JourneyRunContext,
    operation: JourneyOperation,
  ): Promise<void> {
    onPhase("setup");
    await operation.setup?.();
    result.setup.actions.push(operation.action);
    onPhase("action");
    const before = await session.stateOrEmpty();
    const execution = await operation.execute(before);
    const step: JourneyStep = {
      ...execution,
      action: operation.action,
      before,
      after: await session.state(),
      targetIsUnderlying: isAddressEqual(session.target, session.underlying),
    };
    result.steps.push(step);
    assertJourneyStep(step, valueToleranceBps);
    operation.verify(step, valueToleranceBps);
  }
}
