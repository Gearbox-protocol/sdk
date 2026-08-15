import { SDKConstruct } from "../../base/SDKConstruct.js";
import type { ClaimableWithdrawal } from "../../index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { DelayedIntent } from "../withdrawal-compressor/types.js";
import {
  buildAddCollateralOperations,
  buildAdjustLeverageOperations,
  buildDepositOperations,
  buildWithdrawAssetOperations,
  buildWithdrawOperations,
  IntentPreviewError,
  type OpenStrategyPreview,
  type OpenStrategyProps,
  previewOpenStrategy,
  type StartIntent,
  type StartIntentProps,
} from "./intents/full/index.js";
import {
  buildResumeCloseOperations,
  buildResumeDecreaseLeverageOperations,
  buildResumeWithdrawOperations,
  type ResumeContext,
} from "./intents/resume/index.js";
import {
  type AccountCalculatorOperation,
  buildClaimDelayedWithdrawalOperation,
  primaryInstantOutput,
} from "./operations/index.js";
import type {
  CreditAccountSlice,
  IntentPreviewResult,
  OperationState,
  PreviewErrorReason,
} from "./types.js";
import {
  assembleOperationCalls,
  convertAmount,
  createRouterPaths,
  getOperationsWithQuotaUpdate,
  OperationLedger,
  simulateState,
} from "./utils/index.js";

export {
  type AddCollateralIntent,
  type AdjustLeverageIntent,
  type DepositStrategyIntent,
  IntentPreviewError,
  type OpenStrategyPreview,
  type StartIntent,
  type WithdrawAssetIntent,
  type WithdrawStrategyIntent,
} from "./intents/full/index.js";
export { primaryInstantOutput } from "./operations/index.js";
export type {
  AdjustState,
  CloseState,
  OperationState,
  PreviewErrorReason,
} from "./types.js";
export {
  fetchCreditAccountSlice,
  toCreditAccountSlice,
} from "./utils/credit-account-slice.js";
export type {
  AccountCalculatorOperation,
  CreditAccountSlice,
  IntentPreviewResult,
};

/**
 * Open-strategy preview outcome.
 *
 * Shaped like {@link IntentPreviewResult} in its error half so all previews fail
 * the same way, but the payload is its own: opening has no existing account, so
 * there is no operation chain and no delayed branch to report.
 */
export type OpenStrategyPreviewResult =
  | { ok: true; preview: OpenStrategyPreview }
  | { ok: false; reason: PreviewErrorReason };

/** Everything a preview needs besides the intent itself. */
interface PreviewProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  quotaReserve: number | undefined;
  slippage: number | undefined;
}

type StartProps<T extends StartIntent = StartIntent> = StartIntentProps & {
  intent: T;
};

/** Second half of a delayed intent: the matured withdrawal plus its tail. */
export type ResumeProps<T extends DelayedIntent = DelayedIntent> =
  PreviewProps & {
    intent: T;
    claimable: ClaimableWithdrawal;
  };

/**
 * Previews of everything a wallet can do to an existing credit account.
 *
 * Router-only: every swap leg is resolved through the pathfinder, so a preview
 * always carries the calldata that would realise the amounts it reports.
 */
export class CreditAccountOperationsService extends SDKConstruct {
  /**
   * Previews an operation, or its leading half when the assets involved settle
   * with a delay: builds the logical op chain, projects the post-operation
   * state, appends the quota update that state implies, and encodes the
   * multicall.
   *
   * @param props - Intent plus account slice, quota reserve and slippage
   * @returns Preview with `instant` populated, or `{ ok: false, reason }` when
   * the intent cannot be satisfied (e.g. the account lacks the source balance)
   */
  async startIntent(props: StartProps): Promise<IntentPreviewResult> {
    const intent = props.intent;

    return this.#preview(props, () => {
      switch (intent.type) {
        case "ADD_COLLATERAL":
          return buildAddCollateralOperations({ ...props, intent });
        case "WITHDRAW_ASSET":
          return buildWithdrawAssetOperations({ ...props, intent });
        case "ADJUST_LEVERAGE":
          return buildAdjustLeverageOperations({ ...props, intent });
        case "DEPOSIT":
          return buildDepositOperations({ ...props, intent });
        case "WITHDRAW":
          return buildWithdrawOperations({ ...props, intent });
        default: {
          const _exhaustive: never = intent;
          void _exhaustive;
          throw new Error(`${(intent as StartIntent).type} - not implemented`);
        }
      }
    });
  }

  /**
   * Previews the tail of a delayed intent, run once the withdrawal it started
   * has matured: the claim, then whatever the original intent still owes.
   *
   * @param props - Delayed intent, account slice as it stands now, and the
   * matured claimable
   * @returns Preview shaped exactly like {@link startIntent}'s, so both halves
   * of an operation are consumed the same way
   */
  async finishIntent(props: ResumeProps): Promise<IntentPreviewResult> {
    const intent = props.intent;

    if (intent.type === "CLOSE_ACCOUNT") {
      return this.#finishCloseAccountIntent({ ...props, intent });
    }

    return this.#preview(props, () => {
      const ctx = this.#resumeContext(props);

      switch (intent.type) {
        // Nothing is owed beyond the claim itself: the tokens land on the
        // account and only their quota has to catch up.
        case "ADD_COLLATERAL":
        case "INCREASE_LEVERAGE":
        case "DEPOSIT":
        case "DEPOSIT_AND_INCREASE_LEVERAGE":
          return ctx.operations;
        case "WITHDRAW_COLLATERAL":
          return buildResumeWithdrawOperations({ ...ctx, intent });
        case "DECREASE_LEVERAGE":
          return buildResumeDecreaseLeverageOperations({ ...ctx, intent });
        default: {
          const _exhaustive: never = intent;
          void _exhaustive;
          throw new Error(
            `${(intent as DelayedIntent).type} - not implemented`,
          );
        }
      }
    });
  }

  /**
   * Previews opening a brand-new leveraged position.
   *
   * Sits apart from {@link startIntent} because there is no account yet: nothing
   * can be projected from existing balances, and the output feeds
   * `sdk.accounts.openCA` rather than a facade multicall assembled here.
   *
   * @param props - Credit manager, wallet collateral, target token and leverage
   * @returns Debt, position size, projected balances and quotas for both the
   * expected and the floor branch, or `{ ok: false, reason }` when the requested
   * leverage or the resulting debt is not viable
   */
  async openStrategyIntent(
    props: OpenStrategyProps,
  ): Promise<OpenStrategyPreviewResult> {
    try {
      return { ok: true, preview: await previewOpenStrategy(props) };
    } catch (e) {
      return this.#asFailure(e);
    }
  }

  /**
   * The one preview pipeline: build the ops → project the post-state → append
   * the quota update it implies → encode.
   *
   * Shared by both halves of every intent so that a resumed operation derives
   * its quotas and its state exactly as the leading half did.
   */
  async #preview(
    props: PreviewProps,
    buildOperations: () =>
      | Array<AccountCalculatorOperation>
      | Promise<Array<AccountCalculatorOperation>>,
  ): Promise<IntentPreviewResult> {
    try {
      const baseOperations = await buildOperations();

      const state = simulateState({
        operations: baseOperations,
        creditAccount: props.creditAccount,
        sdk: props.sdk,
        quotaReserve: props.quotaReserve,
      });

      const operations = getOperationsWithQuotaUpdate({
        operations: baseOperations,
        state,
        creditAccount: props.creditAccount,
        sdk: props.sdk,
      });

      return this.#instantOnly(operations, state.state);
    } catch (e) {
      return this.#asFailure(e);
    }
  }

  /**
   * Resume close, which cannot share {@link #preview}: closing settles debt and
   * quotas inside its own assembler, so there is no quota update to append and
   * the reported state is the close quote rather than a projected balance sheet.
   */
  async #finishCloseAccountIntent(
    props: ResumeProps<Extract<DelayedIntent, { type: "CLOSE_ACCOUNT" }>>,
  ): Promise<IntentPreviewResult> {
    try {
      const { operations, close } = await buildResumeCloseOperations(
        this.#resumeContext(props),
      );

      return this.#instantOnly(operations, {
        kind: "close",
        amount: close.amount,
        minAmount: close.minAmount,
        underlyingBalance: close.underlyingBalance,
      });
    } catch (e) {
      return this.#asFailure(e);
    }
  }

  /**
   * The claim, applied, plus the handles a tail builder needs to continue from
   * there: a ledger holding the post-claim state, and the pathfinder.
   */
  #resumeContext<T extends DelayedIntent>(
    props: ResumeProps<T>,
  ): ResumeContext<T> & { operations: Array<AccountCalculatorOperation> } {
    const { creditAccount, sdk, claimable, slippage = 0 } = props;

    const ledger = new OperationLedger({
      initialAssets: creditAccount.tokens,
      underlying: creditAccount.underlying,
      debt: creditAccount.accountDebt,
      convert: convertAmount(sdk, creditAccount.creditManager),
    });

    const operations: Array<AccountCalculatorOperation> = [];
    const push = (...ops: Array<AccountCalculatorOperation>) => {
      for (const op of ops) {
        operations.push(op);
        ledger.apply(op);
      }
      return operations;
    };

    push(
      buildClaimDelayedWithdrawalOperation({ claimable, creditAccount, sdk }),
    );

    return {
      intent: props.intent,
      creditAccount,
      sdk,
      claimable,
      claimed: primaryInstantOutput(claimable.outputs),
      paths: createRouterPaths({ sdk, creditAccount, slippage }),
      ledger,
      push,
      operations,
    };
  }

  /**
   * A preview with no delayed branch, which is all the SDK produces today: the
   * delayed half is started by the caller from the compressor's own preview.
   */
  #instantOnly(
    operations: Array<AccountCalculatorOperation>,
    preview: OperationState,
  ): IntentPreviewResult {
    return {
      ok: true,

      instant: {
        operations,
        preview: { min: preview },
        calls: assembleOperationCalls({ operations }),
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }

  /** Unviable requests are values; anything else is a genuine failure. */
  #asFailure(e: unknown): { ok: false; reason: PreviewErrorReason } {
    if (e instanceof IntentPreviewError) {
      return { ok: false, reason: e.reason };
    }
    throw e;
  }
}
