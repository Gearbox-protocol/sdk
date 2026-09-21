import assert from "node:assert/strict";
import { LEVERAGE_DECIMALS } from "../../../onchain/constants/math.js";
import { near } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { pickLeverage } from "../planning.js";
import { prepared } from "../prepared.js";
import type { JourneySession, LeverageDirection } from "../types.js";

const LABELS: Record<LeverageDirection, string> = {
  up: "increase leverage",
  down: "decrease leverage",
  debtFree: "delever to one",
};

/**
 * Tests changing leverage without touching the wallet.
 *
 * Starting state: the shared setup position; nothing is funded.
 * Action: `prepare.adjustLeverage` towards a target inside the current
 * leverage band (`up`, `down`) or exactly 1x (`debtFree`). Increasing borrows
 * more and always uses the instant route; decreasing sells part of the
 * position through the configured route, settling delayed redemptions.
 * Verifies: the wallet balance is unchanged; debt and leverage move in the
 * requested direction; `debtFree` leaves zero debt.
 */
export class AdjustLeverageJourney extends BaseStrategyJourney {
  readonly #direction: LeverageDirection;

  constructor(direction: LeverageDirection) {
    super();
    this.#direction = direction;
  }

  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    const direction = this.#direction;
    await this.perform(session, context, {
      action: { kind: "adjustLeverage", direction },
      execute: async before => {
        const targetLeverage =
          direction === "debtFree"
            ? LEVERAGE_DECIMALS
            : pickLeverage(session, before, direction);
        const routes = prepared(
          await session.prepare.adjustLeverage(session.position, {
            targetLeverage,
            token: session.target,
            slippage: session.options.slippage,
          }),
        );
        // Increasing debt has no delayed-redemption leg.
        return session.routed(routes, LABELS[direction], direction !== "up");
      },
      verify: ({ before, after }) => {
        near(
          after.walletUnderlying,
          before.walletUnderlying,
          1,
          "Leverage adjustment used wallet funds",
        );
        if (direction === "up") {
          assert(
            after.debt > before.debt && after.leverage > before.leverage,
            "Leverage did not increase",
          );
        } else {
          assert(
            after.debt < before.debt && after.leverage < before.leverage,
            "Leverage did not decrease",
          );
        }
        if (direction === "debtFree")
          assert.equal(after.debt, 0n, "Deleveraging left debt");
      },
    });
  }
}
