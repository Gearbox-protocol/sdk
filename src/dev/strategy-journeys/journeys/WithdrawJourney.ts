import assert from "node:assert/strict";
import { MAX_UINT256 } from "../../../onchain/index.js";
import { leverageNear, near } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { partialAmount } from "../planning.js";
import { prepared } from "../prepared.js";
import type { JourneySession } from "../types.js";

/**
 * Tests withdrawing funding tokens to the wallet.
 *
 * Starting state: the shared setup position; nothing is funded.
 * Action: `prepare.withdrawStrategy` for a quarter of the safe partial limit,
 * or `MAX_UINT256` for a full exit (`all`), through the configured route;
 * delayed redemptions are fulfilled on the fork and finalized.
 * Verifies: the wallet is paid and debt decreases. A partial withdrawal pays
 * out the requested amount and preserves leverage; a full exit leaves zero
 * debt, zero quotas and at most one raw unit of dust.
 */
export class WithdrawJourney extends BaseStrategyJourney {
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
    let amount: bigint;
    await this.perform(session, context, {
      action: { kind: "withdraw", all },
      execute: async () => {
        amount = all
          ? MAX_UINT256
          : partialAmount(
              session.fundingAmount(
                (
                  await session.prepare.maxWithdraw(
                    session.position,
                    session.target,
                  )
                ).safePartial,
              ),
              "partial withdrawal",
            );
        const routes = prepared(
          await session.prepare.withdrawStrategy(session.position, {
            amount,
            tokenOut: session.underlying,
            sourceToken: session.target,
            to: session.owner,
            slippage: session.options.slippage,
          }),
        );
        const label = all ? "exit" : "withdraw";
        return { ...(await session.routed(routes, label)), amount };
      },
      verify: ({ before, after }, tolerance) => {
        assert(
          after.walletUnderlying > before.walletUnderlying,
          "Withdrawal did not pay the wallet",
        );
        assert(after.debt < before.debt, "Withdrawal did not repay debt");
        if (all) {
          assert.equal(after.debt, 0n, "Exit left debt");
          assert.equal(after.quota, 0n, "Exit left quotas");
          assert(
            after.targetBalance <= 1n,
            "Exit left strategy tokens above dust",
          );
          assert(after.value <= 2n, "Exit left account value");
        } else {
          near(
            after.walletUnderlying - before.walletUnderlying,
            amount,
            tolerance,
            "Withdrawal received by wallet",
          );
          leverageNear(
            after.leverage,
            before.leverage,
            tolerance,
            "Withdrawal did not preserve leverage",
            0.05,
          );
        }
      },
    });
  }
}
