import assert from "node:assert/strict";
import { isAddressEqual, parseEventLogs } from "viem";
import { iCreditFacadeV310Abi } from "../../../abi/310/generated.js";
import { near } from "../assertions.js";
import {
  BaseStrategyJourney,
  type JourneyRunContext,
} from "../BaseStrategyJourney.js";
import { prepared, projection } from "../prepared.js";
import type { JourneySession } from "../types.js";

/**
 * Tests opening a leveraged strategy position through the public SDK.
 *
 * Starting state: no position, since this journey skips the shared setup
 * opening; with `reuse`, the journey's existing account after a full exit.
 * Action: fund the wallet with the planned collateral, then
 * `prepare.openNewStrategy` and `execute.buildTx({ kind: "open" })` with the
 * fork's opening hooks and any RWA signatures.
 * Verifies: exactly one `OpenCreditAccount` event, or none for another
 * account when reusing; the account is adopted for later steps; the new
 * position holds debt and strategy tokens; the wallet balance dropped by
 * exactly the collateral amount.
 */
export class OpenJourney extends BaseStrategyJourney {
  readonly #reuse: boolean;

  constructor({ reuse = false }: { reuse?: boolean } = {}) {
    super();
    this.#reuse = reuse;
  }

  // Opening is the behavior under test, not a prerequisite.
  protected override async setup(): Promise<void> {}

  public async test(
    session: JourneySession,
    context: JourneyRunContext,
  ): Promise<void> {
    const reuse = this.#reuse;
    const { collateral: amount, leverage, key, slippage } = session.options;
    await this.perform(session, context, {
      action: { kind: "open", reuse },
      setup: () => session.fund(session.underlying, amount),
      execute: async before => {
        if (reuse)
          assert(
            before.debt === 0n && before.quota === 0n,
            "Account is not reusable",
          );
        const collateral = [{ token: session.underlying, balance: amount }];
        const data = prepared(
          await session.prepare.openNewStrategy(key, {
            collateral,
            leverage,
            slippage,
            targetToken: session.target,
            creditAccount: reuse ? session.position.creditAccount : undefined,
          }),
        );
        const calls = await session.environment.decorateOpenCalls(
          key.creditManager,
          data.state.calls,
        );
        const tx = await session.sdk.opportunities.execute.buildTx({
          kind: "open",
          ...key,
          wallet: session.owner,
          sim: { ok: true, data: { ...data, state: { ...data.state, calls } } },
          collateral,
          ethAmount: 0n,
          targetToken: session.target,
          signaturesToCache: await session.environment.signRwaRequirements(
            key.creditManager,
            session.target,
          ),
        });
        const { hash, receipt } = await session.sendTx(
          tx,
          reuse ? "reuse account" : "open strategy",
        );
        const logs = parseEventLogs({
          abi: iCreditFacadeV310Abi,
          logs: receipt.logs,
          eventName: "OpenCreditAccount",
        });
        if (reuse) {
          assert(
            logs.every(log =>
              isAddressEqual(
                log.args.creditAccount,
                session.position.creditAccount,
              ),
            ),
            "Reuse opened another account",
          );
        } else {
          assert.equal(
            logs.length,
            1,
            "Opening must emit exactly one account event",
          );
          session.adoptCreditAccount(logs[0].args.creditAccount);
        }
        return {
          transactions: [hash],
          route: "direct",
          expected: projection(data.state),
          amount,
        };
      },
      verify: ({ before, after }) => {
        assert(
          after.debt > 0n && after.targetBalance > 0n,
          "Opening did not create a leveraged strategy position",
        );
        near(
          before.walletUnderlying - after.walletUnderlying,
          amount,
          1,
          "Opening wallet debit",
        );
      },
    });
  }
}
