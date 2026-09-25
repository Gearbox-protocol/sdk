import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import type { JourneySession } from "../types.js";
import { DepositJourney } from "./DepositJourney.js";
import { WithdrawJourney } from "./WithdrawJourney.js";

/**
 * Tests the deposit-then-exit sequence on one position.
 *
 * Starting state: the shared setup position.
 * Actions: a partial deposit, then a full withdrawal, each recorded and
 * verified as its own step by `DepositJourney` and `WithdrawJourney`.
 * Verifies: everything those journeys verify, in sequence, ending with a
 * closed position.
 */
export class ExitJourney extends BaseStrategyJourney {
  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    await new DepositJourney().test(session, context);
    await new WithdrawJourney({ all: true }).test(session, context);
  }
}
