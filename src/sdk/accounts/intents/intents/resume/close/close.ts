import type {
  DelayedCloseAccountIntent,
  OnchainSDK,
} from "../../../../../index.js";
import {
  type AccountCalculatorOperation,
  buildClaimDelayedWithdrawalOperation,
  buildCloseCreditAccountOperation,
  type ClaimDelayedOption,
} from "../../../operations/index.js";
import type { CloseQuote, CloseQuoter } from "../../../quoters/index.js";
import type { CreditAccountSlice } from "../../../types.js";
import {
  convertAmount,
  simulateOperationAssets,
  toRouterCaSlice,
} from "../../../utils/index.js";

/**
 * Resume close — linear op chain: claim, then close against the quoted
 * post-claim balances. Quota zeroing and debt/withdraw live inside
 * assembleCloseCreditAccountCalls — no separate changeQuota / wrap ops.
 */
export async function buildResumeCloseOperations(
  props: {
    intent: DelayedCloseAccountIntent;
    options: ClaimDelayedOption;
    creditAccount: CreditAccountSlice;
    sdk: OnchainSDK;
  },
  quoter: CloseQuoter,
): Promise<{ operations: AccountCalculatorOperation[]; quote: CloseQuote }> {
  const { options, creditAccount, sdk, intent } = props;

  const operations: Array<AccountCalculatorOperation> = [
    buildClaimDelayedWithdrawalOperation(creditAccount, options, sdk),
  ];

  const convert = convertAmount(sdk, creditAccount.creditManager);

  const { assets: assetsAfterClaim, debt } = simulateOperationAssets({
    initialAssets: creditAccount.tokens,
    operations,
    underlyingToken: creditAccount.underlying,
    debt: creditAccount.accountDebt,
    convert,
  });

  const quote = await quoter({
    assets: assetsAfterClaim,
    debt,
  });

  if (options.kind === "onchain") {
    operations.push(
      await buildCloseCreditAccountOperation(quote, {
        ...options,
        to: intent.to,
        creditAccount: toRouterCaSlice(creditAccount, assetsAfterClaim),
        sdk,
      }),
    );
  } else {
    operations.push(await buildCloseCreditAccountOperation(quote, options));
  }

  return { operations, quote };
}
