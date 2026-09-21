import assert from "node:assert/strict";
import { near, unchangedDebt } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { partialAmount } from "../planning.js";
import { prepared } from "../prepared.js";
import type { JourneySession } from "../types.js";

/**
 * Tests adding strategy tokens as collateral without changing debt.
 *
 * Starting state: the shared setup position, with the wallet funded with a
 * quarter of the account's strategy-token balance.
 * Action: `prepare.addCollateral` with the strategy token.
 * Verifies: debt is unchanged beyond interest accrual; the account holds more
 * strategy tokens; leverage falls and health does not worsen; the wallet is
 * debited by exactly the added amount.
 */
export class AddCollateralJourney extends BaseStrategyJourney {
  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    let amount: bigint;
    await this.perform(session, context, {
      action: { kind: "addCollateral" },
      setup: async () => {
        amount = partialAmount(
          (await session.state()).targetBalance,
          "collateral addition",
        );
        await session.fund(session.target, amount);
      },
      execute: async () => {
        const data = prepared(
          await session.prepare.addCollateral(session.position, {
            token: session.target,
            amount,
            slippage: session.options.slippage,
          }),
        );
        return { ...(await session.direct(data, "add collateral")), amount };
      },
      verify: ({ before, after }) => {
        unchangedDebt(before, after);
        assert(
          after.targetBalance > before.targetBalance,
          "Collateral was not added",
        );
        assert(
          after.leverage < before.leverage &&
            after.healthFactor >= before.healthFactor,
          "Adding collateral did not improve safety",
        );
        near(
          before.walletTarget - after.walletTarget,
          amount,
          1,
          "Collateral wallet debit",
        );
      },
    });
  }
}
