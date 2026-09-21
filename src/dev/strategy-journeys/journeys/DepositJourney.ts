import assert from "node:assert/strict";
import { leverageNear, near } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { partialAmount, pickLeverage } from "../planning.js";
import { prepared } from "../prepared.js";
import type { JourneySession } from "../types.js";

/**
 * Tests adding wallet funds to an existing position.
 *
 * Starting state: the shared setup position, with the wallet funded with a
 * quarter of the opening collateral.
 * Action: `prepare.depositStrategy` for that amount; with `raiseLeverage` a
 * higher target leverage is picked inside the range the new equity allows.
 * Verifies: value and debt both grow; the wallet balance drops by exactly the
 * deposit; leverage is preserved, or raised when requested.
 */
export class DepositJourney extends BaseStrategyJourney {
  readonly #raiseLeverage: boolean;

  constructor({ raiseLeverage = false }: { raiseLeverage?: boolean } = {}) {
    super();
    this.#raiseLeverage = raiseLeverage;
  }

  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    const raiseLeverage = this.#raiseLeverage;
    const amount = partialAmount(session.options.collateral, "deposit");
    await this.perform(session, context, {
      action: { kind: "deposit", raiseLeverage },
      setup: () => session.fund(session.underlying, amount),
      execute: async before => {
        const data = prepared(
          await session.prepare.depositStrategy(session.position, {
            token: session.underlying,
            amount,
            ...(raiseLeverage
              ? { targetLeverage: pickLeverage(session, before, "up", amount) }
              : {}),
            positionToken: session.target,
            slippage: session.options.slippage,
          }),
        );
        const label = raiseLeverage ? "deposit and leverage" : "deposit";
        return { ...(await session.direct(data, label)), amount };
      },
      verify: ({ before, after }, tolerance) => {
        assert(
          after.value > before.value && after.debt > before.debt,
          "Deposit did not grow exposure and debt",
        );
        near(
          before.walletUnderlying - after.walletUnderlying,
          amount,
          1,
          "Deposit wallet debit",
        );
        if (raiseLeverage) {
          assert(
            after.leverage > before.leverage,
            "Deposit did not raise leverage",
          );
        } else {
          leverageNear(
            after.leverage,
            before.leverage,
            tolerance,
            "Deposit did not preserve leverage",
            0.05,
          );
        }
      },
    });
  }
}
