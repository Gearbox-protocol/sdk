import assert from "node:assert/strict";
import { isAddressEqual } from "viem";
import { near, unchangedDebt } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { partialAmount } from "../planning.js";
import { prepared } from "../prepared.js";
import { type JourneySession, JourneyUnavailable } from "../types.js";

/**
 * Tests taking strategy tokens out of the account without changing debt.
 *
 * Starting state: the shared setup position; nothing is funded.
 * Action: `prepare.withdrawCollateral` for a quarter of the maximum
 * withdrawable strategy-token amount. Reported as unsupported when the
 * strategy token is not transferable collateral.
 * Verifies: debt is unchanged beyond interest accrual; the account holds
 * fewer strategy tokens; leverage rises; the wallet receives exactly the
 * withdrawn amount.
 */
export class WithdrawCollateralJourney extends BaseStrategyJourney {
  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    let amount: bigint;
    await this.perform(session, context, {
      action: { kind: "withdrawCollateral" },
      execute: async () => {
        const positions = await session.sdk.positions.list(session.owner);
        const position = positions.data.find(
          p =>
            p.kind === "strategy" &&
            p.chainId === session.options.key.chainId &&
            isAddressEqual(p.creditAccount, session.position.creditAccount),
        );
        assert(
          position?.kind === "strategy",
          "Missing position for collateral withdrawal",
        );
        if (
          !session.prepare
            .withdrawableCollaterals(position)
            .some(c =>
              isAddressEqual(c.collateral.token.address, session.target),
            )
        ) {
          throw new JourneyUnavailable(
            "unsupported",
            "The strategy token is not transferable collateral",
          );
        }
        amount = partialAmount(
          await session.prepare.maxWithdrawCollateral(
            session.position,
            session.target,
          ),
          "collateral withdrawal",
        );
        const data = prepared(
          await session.prepare.withdrawCollateral(session.position, {
            token: session.target,
            amount,
            to: session.owner,
            slippage: session.options.slippage,
          }),
        );
        return {
          ...(await session.direct(data, "withdraw collateral")),
          amount,
        };
      },
      verify: ({ before, after }) => {
        unchangedDebt(before, after);
        assert(
          after.targetBalance < before.targetBalance &&
            after.leverage > before.leverage,
          "Collateral withdrawal did not reduce collateral and raise leverage",
        );
        near(
          after.walletTarget - before.walletTarget,
          amount,
          1,
          "Collateral received by wallet",
        );
      },
    });
  }
}
