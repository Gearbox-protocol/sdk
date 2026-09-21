import assert from "node:assert/strict";
import { MAX_UINT256 } from "../../../onchain/index.js";
import { near } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { partialAmount } from "../planning.js";
import { prepared } from "../prepared.js";
import type { JourneySession } from "../types.js";

/**
 * Tests repaying debt from the wallet.
 *
 * Starting state: the shared setup position, with the wallet funded to cover
 * the whole debt plus interest.
 * Action: `prepare.repayStrategy` for a quarter of what can be repaid while
 * staying above minDebt, or `MAX_UINT256` to repay everything (`all`).
 * Verifies: debt and wallet balance both decrease; strategy holdings are not
 * sold to repay; a full repayment leaves zero debt and zero quotas.
 */
export class RepayJourney extends BaseStrategyJourney {
  readonly #all: boolean;

  constructor({ all = false }: { all?: boolean } = {}) {
    super();
    this.#all = all;
  }

  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    const all = this.#all;
    await this.perform(session, context, {
      action: { kind: "repay", all },
      setup: async () => {
        const { debt } = await session.state();
        await session.fund(session.underlying, (debt * 101n) / 100n + 2n);
      },
      execute: async () => {
        const amount = all
          ? MAX_UINT256
          : partialAmount(
              session.fundingAmount(
                await session.prepare.maxRepay(session.position),
              ) -
                (session.options.strategy.minDebt.value * 102n) / 100n,
              "partial repayment",
            );
        const data = prepared(
          await session.prepare.repayStrategy(session.position, {
            token: session.underlying,
            amount,
            slippage: session.options.slippage,
          }),
        );
        const label = all ? "repay all" : "repay";
        return { ...(await session.direct(data, label)), amount };
      },
      verify: ({ before, after, targetIsUnderlying }) => {
        assert(
          after.debt < before.debt &&
            after.walletUnderlying < before.walletUnderlying,
          "Repayment did not use wallet funds to reduce debt",
        );
        if (!targetIsUnderlying)
          near(
            after.targetBalance,
            before.targetBalance,
            1,
            "Repayment sold strategy holdings",
          );
        if (all) {
          assert.equal(after.debt, 0n, "Full repayment left debt");
          assert.equal(after.quota, 0n, "Full repayment left active quotas");
        }
      },
    });
  }
}
