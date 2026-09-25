import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import type { JourneySession } from "../types.js";
import { OpenJourney } from "./OpenJourney.js";
import { WithdrawJourney } from "./WithdrawJourney.js";

/**
 * Tests reopening on the same credit account after a full exit.
 *
 * Starting state: the shared setup position.
 * Actions: a full withdrawal, then an opening that passes the existing
 * `creditAccount` to `prepare.openNewStrategy`.
 * Verifies: the exit checks of `WithdrawJourney`; then that the reopening
 * emits no event for another account and the same account ends up holding
 * debt and strategy tokens again.
 */
export class ReuseAccountJourney extends BaseStrategyJourney {
  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    await new WithdrawJourney({ all: true }).test(session, context);
    await new OpenJourney({ reuse: true }).test(session, context);
  }
}
