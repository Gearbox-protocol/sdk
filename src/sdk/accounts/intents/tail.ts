import type { Address } from "viem";
import type { OnchainSDK } from "../../index.js";
import type { ClaimableWithdrawal } from "../withdrawal-compressor/types.js";
import {
  type AccountCalculatorOperation,
  instantOutput,
  type StartDelayedWithdrawalOperation,
} from "./operations.js";
import {
  type AccountView,
  planFinishClaimOnly,
  planFinishCloseAccount,
  planFinishDecreaseLeverage,
  planFinishWithdraw,
  type Step,
} from "./plan.js";
import { realize } from "./realize.js";
import type {
  CreditAccountSlice,
  DelayedStart,
  OperationState,
  ResumableIntent,
} from "./types.js";
import { IntentPreviewError } from "./types.js";
import { createOraclePaths } from "./utils/router-path.js";
import { accountView } from "./view.js";

/**
 * The second half of a delayed intent: the claim, then whatever the intent
 * still owes.
 *
 * Shared by the two callers that need it and must not disagree — the tail as
 * it is previewed days later against the account that really exists, and the
 * tail as it is projected the moment the request is made.
 */
export function planTail(args: {
  intent: ResumableIntent;
  claimable: ClaimableWithdrawal;
  view: AccountView;
}): Step[] {
  const { intent, claimable, view } = args;

  // What the claim credits on the spot, which is what the tail spends.
  const claimed = (): { token: Address; amount: bigint } => {
    const output = instantOutput(claimable.outputs);
    if (!output) {
      throw new IntentPreviewError(
        "insufficientSourceBalance",
        "finishIntent: the claim credits nothing to spend",
      );
    }
    return output;
  };

  switch (intent.type) {
    case "WITHDRAW_COLLATERAL":
      return planFinishWithdraw(intent, claimable, claimed(), view);
    case "DECREASE_LEVERAGE":
      return planFinishDecreaseLeverage(claimable, claimed(), view);
    case "CLOSE_ACCOUNT":
      return planFinishCloseAccount(intent, claimable, claimed(), view);
    case "ADD_COLLATERAL":
    case "INCREASE_LEVERAGE":
    case "DEPOSIT":
    case "DEPOSIT_AND_INCREASE_LEVERAGE":
      return planFinishClaimOnly(claimable);
    default: {
      const _exhaustive: never = intent;
      void _exhaustive;
      throw new Error(`${(intent as ResumableIntent).type} - not implemented`);
    }
  }
}

/**
 * Where a delayed intent ends up, worked out at the moment it is started.
 *
 * A request is only half a withdrawal, so the state it lands in is not the
 * answer to "what does this do to my position": the debt is still there, the
 * payout has not been made, and the position sits in a phantom token. What the
 * caller means is the far side — and that side can be walked now, because the
 * request already fixes the claim it will be finished from.
 *
 * So the same tail {@link planTail} builds at claim time is built here against
 * the account as the request leaves it, with the claim it is expected to bring,
 * and walked by the same realiser — with one substitution: routed legs are
 * priced by the oracle rather than the pathfinder, since the funds they trade
 * do not exist yet and no calldata is being produced. The result is an
 * estimate that the engine's guards are nevertheless applied to, so a request
 * that would strand the account is refused before it is sent rather than
 * discovered days later.
 */
export async function projectTail(args: {
  /** The request as realised: the source spent, the phantom it produced. */
  request: StartDelayedWithdrawalOperation;
  delayed: DelayedStart;
  /** The account the request was previewed against, for masks and market. */
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  quotaReserve: number | undefined;
}): Promise<{
  state: OperationState;
  operations: AccountCalculatorOperation[];
}> {
  const { request, delayed, creditAccount, sdk, quotaReserve } = args;
  const { claim } = delayed;

  const queued = request.outputs.find(o => o.isDelayed);
  if (!queued || !claim) {
    throw new Error("projectTail: the request queued nothing to claim");
  }

  const next = sliceAfter(creditAccount, delayed.afterRequest);
  const steps = planTail({
    intent: delayed.record,
    claimable: projectedClaimable(request, queued.token, queued.amount, claim),
    view: accountView(next, sdk),
  });

  const { state, operations } = await realize(steps, {
    creditAccount: next,
    sdk,
    slippage: 0,
    quotaReserve,
    paths: createOraclePaths({ sdk, creditAccount: next }),
  });
  return { state, operations };
}

/**
 * The matured withdrawal the tail will be built from, as the request implies
 * it: the phantom it created is burned and the venue's payout takes its place.
 * It carries no claim calls — those are read from the chain when the claim is
 * real, and nothing here is going to be sent.
 */
function projectedClaimable(
  request: StartDelayedWithdrawalOperation,
  phantom: Address,
  phantomAmount: bigint,
  claim: { token: Address; amount: bigint },
): ClaimableWithdrawal {
  return {
    token: request.token,
    withdrawalPhantomToken: phantom,
    withdrawalTokenSpent: phantomAmount,
    outputs: [{ token: claim.token, amount: claim.amount, isDelayed: false }],
    claimCalls: [],
  };
}

/**
 * The account as one walk left it, shaped as the slice the next walk reads.
 * Masks are carried over from the tokens the account already held; one it
 * picked up along the way has none to carry, which only the router slice
 * would have used.
 */
function sliceAfter(
  creditAccount: CreditAccountSlice,
  after: OperationState,
): CreditAccountSlice {
  const masks = new Map(
    creditAccount.tokens.map(t => [t.token.toLowerCase() as Address, t.mask]),
  );

  return {
    ...creditAccount,
    accountDebt: after.accountDebt,
    tokens: after.assets.map(a => ({
      token: a.token,
      balance: a.balance,
      quota: after.quotas[a.token]?.balance ?? 0n,
      mask: masks.get(a.token) ?? 0n,
      success: true,
    })),
  };
}
