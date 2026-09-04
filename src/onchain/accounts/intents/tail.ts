import type { Address } from "viem";
import type { OnchainSDK } from "../../index.js";
import { IntentPreviewError } from "../../validation/refusal.js";
import { toTokenAmount } from "../../validation/token.js";
import type {
  ClaimableWithdrawal,
  WithdrawalOutput,
} from "../withdrawal-compressor/types.js";
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
  ClaimRemainder,
  CreditAccountSlice,
  DelayedStart,
  OperationState,
  ResumableIntent,
} from "./types.js";
import { toTargetDecimals } from "./utils/common.js";
import { createOraclePaths } from "./utils/router-path.js";
import { accountView } from "./view.js";

/** The steps a claim leads to, and what it left behind for a later one. */
export interface TailPlan {
  steps: Step[];
  /** {@inheritDoc ClaimRemainder} */
  remainder: ClaimRemainder | undefined;
}

/**
 * The second half of a delayed intent: the claim, then whatever the intent
 * still owes.
 *
 * Shared by the two callers that need it and must not disagree — the tail as
 * it is previewed days later against the account that really exists, and the
 * tail as it is projected the moment the request is made.
 *
 * A claim that brought only part of what was queued is served in proportion,
 * see {@link partialTail}: the intent's payout and its repayment are cut to the
 * share that arrived, and the rest of both is handed to the next claim.
 */
export function planTail(args: {
  intent: ResumableIntent;
  claimable: ClaimableWithdrawal;
  view: AccountView;
}): TailPlan {
  const { intent, claimable, view } = args;

  // What the claim credits on the spot, which is what the tail spends.
  const claimed = (): { token: Address; amount: bigint } => {
    const output = instantOutput(claimable.outputs);
    if (!output) {
      throw new IntentPreviewError(
        "insufficientSourceBalance",
        undefined,
        "finishIntent: the claim credits nothing to spend",
      );
    }
    return output;
  };

  const queued = claimable.outputs.find(o => o.isDelayed && o.amount > 0n);
  if (queued) {
    return partialTail({ intent, claimable, queued, view });
  }

  switch (intent.type) {
    case "WITHDRAW_COLLATERAL":
      return whole(planFinishWithdraw(intent, claimable, claimed(), view));
    case "DECREASE_LEVERAGE":
      return whole(planFinishDecreaseLeverage(claimable, claimed(), view));
    case "CLOSE_ACCOUNT":
      return whole(planFinishCloseAccount(intent, claimable, claimed(), view));
    case "ADD_COLLATERAL":
    case "INCREASE_LEVERAGE":
    case "DEPOSIT":
    case "DEPOSIT_AND_INCREASE_LEVERAGE":
      return whole(planFinishClaimOnly(claimable));
    default: {
      // disposition(D1-S6): kept — unreachable invariant; decodeDelayedIntent
      // already refuses unknown intent types before a ResumableIntent exists.
      const _exhaustive: never = intent;
      void _exhaustive;
      throw new Error(`${(intent as ResumableIntent).type} - not implemented`);
    }
  }
}

const whole = (steps: Step[]): TailPlan => ({ steps, remainder: undefined });

/**
 * The tail of a claim that settled only part of the withdrawal it matured.
 *
 * Only a legacy Mellow multivault answers one this way — it pays out what its
 * subvaults hold liquid and queues the rest — and the engine cannot finish an
 * intent it has been given a fraction of the funds for. So the fraction is what
 * it serves: the payout and the repayment are cut in the proportion that
 * arrived, which keeps the withdrawal at the fixed leverage it was asked for
 * instead of paying the wallet out first and deleveraging a claim later, and
 * the untouched half of each is carried to the next claim by the remainder.
 *
 * Two intents cannot be served in part at all. An exit sells the account whole,
 * and it cannot while a withdrawal is in flight — the phantom is neither
 * sellable nor transferable — so a partial claim only repays what it brought
 * and the account is emptied by the claim that brings the last of it. A claim
 * that credited nothing at all leaves nothing to spend, so it is taken alone:
 * it is still worth sending, since it is what moves the queue.
 */
function partialTail(args: {
  intent: ResumableIntent;
  claimable: ClaimableWithdrawal;
  queued: WithdrawalOutput;
  view: AccountView;
}): TailPlan {
  const { intent, claimable, queued, view } = args;
  const inFlight = toTokenAmount(view.sdk, queued.token, queued.amount);
  const claimed = instantOutput(claimable.outputs);

  if (!claimed) {
    return {
      steps: planFinishClaimOnly(claimable),
      remainder: { inFlight, intent },
    };
  }

  switch (intent.type) {
    case "WITHDRAW_COLLATERAL": {
      const served = arrivedShare(claimed, queued, view.sdk);
      const withdrawAmount = part(intent.withdrawAmount, served);
      const debtRepaid = part(intent.debtRepaid, served);
      return {
        steps: planFinishWithdraw(
          { ...intent, withdrawAmount, debtRepaid },
          claimable,
          claimed,
          view,
        ),
        remainder: {
          inFlight,
          intent: {
            ...intent,
            withdrawAmount: intent.withdrawAmount - withdrawAmount,
            debtRepaid: intent.debtRepaid - debtRepaid,
          },
        },
      };
    }
    // Both put everything the claim brought into the debt, which needs no
    // adjusting to be done a claim at a time.
    case "DECREASE_LEVERAGE":
    case "CLOSE_ACCOUNT":
      return {
        steps: planFinishDecreaseLeverage(claimable, claimed, view),
        remainder: { inFlight, intent },
      };
    case "ADD_COLLATERAL":
    case "INCREASE_LEVERAGE":
    case "DEPOSIT":
    case "DEPOSIT_AND_INCREASE_LEVERAGE":
      return {
        steps: planFinishClaimOnly(claimable),
        remainder: { inFlight, intent },
      };
    default: {
      // disposition(D1-S6): kept — the same unreachable invariant planTail's
      // own switch guards, on the same typed ResumableIntent union.
      const _exhaustive: never = intent;
      void _exhaustive;
      throw new Error(`${(intent as ResumableIntent).type} - not implemented`);
    }
  }
}

/**
 * How much of the redemption this claim was: what it credited, over that plus
 * what it left queued.
 *
 * The phantom stands for its payout one for one — the same reading the request
 * side takes when it names the claim it expects — so only the decimals of the
 * two have to be reconciled before they can be added up.
 */
function arrivedShare(
  claimed: { token: Address; amount: bigint },
  queued: WithdrawalOutput,
  sdk: OnchainSDK,
): { got: bigint; of: bigint } {
  const rest = toTargetDecimals(
    queued.amount,
    queued.token,
    claimed.token,
    sdk,
  );
  return { got: claimed.amount, of: claimed.amount + rest };
}

/** A share of an amount, rounded down: a tail never promises more than it has. */
function part(amount: bigint, share: { got: bigint; of: bigint }): bigint {
  return share.of > 0n ? (amount * share.got) / share.of : 0n;
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
    // disposition(D1-S6): converted — the claimable is caller input (a
    // foreign or malformed claim can name a request that queued nothing),
    // so it refuses as noRecordedIntent instead of crashing the boundary.
    throw new IntentPreviewError(
      "noRecordedIntent",
      undefined,
      "projectTail: the request queued nothing to claim",
    );
  }

  const next = sliceAfter(creditAccount, delayed.afterRequest);
  // The projected claim brings the whole queue by construction, so this walk
  // never leaves a remainder — what a venue that pays in instalments does to a
  // real claim is discovered by the claim, not predicted here.
  const { steps } = planTail({
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
  const quotas = new Map(
    after.quotas.map(q => [q.token.address.toLowerCase() as Address, q.value]),
  );

  return {
    ...creditAccount,
    totalDebt: after.totalDebt.value,
    // the state prices its holdings; a slice names them, and both the masks
    // above and the quota lookup are keyed in lower case
    tokens: after.assets.map(a => {
      const token = a.token.address.toLowerCase() as Address;
      return {
        token,
        balance: a.value,
        quota: quotas.get(token) ?? 0n,
        mask: masks.get(token) ?? 0n,
        success: true,
      };
    }),
  };
}
