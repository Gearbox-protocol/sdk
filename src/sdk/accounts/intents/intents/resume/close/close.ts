import type { DelayedCloseAccountIntent } from "../../../../../index.js";
import {
  type AccountCalculatorOperation,
  buildCloseCreditAccountOperation,
  type CloseCreditAccountOperation,
} from "../../../operations/index.js";
import { toRouterCaSlice } from "../../../utils/index.js";
import type { ResumeContext } from "../types.js";

/**
 * Resume close — `claim → closeCreditAccount`.
 *
 * Debt settlement, quota zeroing and the payout all happen inside
 * `assembleCloseCreditAccountCalls`, so the tail adds no `changeQuota` or
 * `decreaseDebt` of its own: it only has to convert the post-claim balances,
 * the claimed token included, into the underlying.
 */
export async function buildResumeCloseOperations(
  ctx: ResumeContext<DelayedCloseAccountIntent>,
): Promise<{
  operations: AccountCalculatorOperation[];
  close: CloseCreditAccountOperation;
}> {
  const { creditAccount, sdk, intent, ledger, push, paths } = ctx;

  const { assets } = ledger.snapshot();
  const leg = await paths.close({ assets });

  const close = await buildCloseCreditAccountOperation({
    leg,
    underlyingBalance: leg.underlyingBalance,
    to: intent.to,
    creditAccount: toRouterCaSlice(creditAccount, assets),
    sdk,
  });

  return { operations: push(close), close };
}
