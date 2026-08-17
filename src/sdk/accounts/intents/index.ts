import { SDKConstruct } from "../../base/SDKConstruct.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import {
  type OpenStrategyPreview,
  type OpenStrategyProps,
  previewOpenStrategy,
} from "./open-strategy.js";
import type { AccountCalculatorOperation } from "./operations.js";
import {
  planAddCollateral,
  planAdjustLeverage,
  planDeposit,
  planWithdraw,
  planWithdrawAsset,
  type Step,
} from "./plan.js";
import { realize } from "./realize.js";
import {
  type CreditAccountSlice,
  IntentPreviewError,
  type IntentPreviewResult,
  type PreviewErrorReason,
  type StartIntent,
  type StartIntentProps,
} from "./types.js";
import { accountView } from "./view.js";

export type {
  OpenStrategyPreview,
  OpenStrategyProps,
} from "./open-strategy.js";
export {
  type AddCollateralIntent,
  type AdjustLeverageIntent,
  type DepositStrategyIntent,
  IntentPreviewError,
  type OperationState,
  type PreviewErrorReason,
  type StartIntent,
  type WithdrawAssetIntent,
  type WithdrawStrategyIntent,
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
 * there is no operation chain to report.
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

/**
 * Previews of everything a wallet can do to an existing credit account.
 *
 * Two halves, deliberately kept apart: `plan.ts` turns an intent into a few
 * steps with pure arithmetic, `realize.ts` turns the steps into router-backed
 * operations. This class only picks the planner and wraps the outcome.
 */
export class CreditAccountOperationsService extends SDKConstruct {
  /**
   * Previews an operation on an existing account.
   *
   * @param props - Intent plus account slice, quota reserve and slippage
   * @returns Operations, projected state and calldata, or `{ ok: false, reason }`
   * when the intent cannot be satisfied (e.g. the account lacks the source
   * balance)
   */
  async startIntent(props: StartProps): Promise<IntentPreviewResult> {
    return this.#preview(props, () => {
      const { intent } = props;
      const view = accountView(props.creditAccount, props.sdk);
      switch (intent.type) {
        case "ADD_COLLATERAL":
          return planAddCollateral(intent);
        case "WITHDRAW_ASSET":
          return planWithdrawAsset(intent, view);
        case "ADJUST_LEVERAGE":
          return planAdjustLeverage(intent, view);
        case "DEPOSIT":
          return planDeposit(intent, view);
        case "WITHDRAW":
          return planWithdraw(intent, view);
        default: {
          const _exhaustive: never = intent;
          void _exhaustive;
          throw new Error(`${(intent as StartIntent).type} - not implemented`);
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
      return asFailure(e);
    }
  }

  /** Plan → realise → wrap. Unviable requests become `{ ok: false }`. */
  async #preview(
    props: PreviewProps,
    plan: () => Step[],
  ): Promise<IntentPreviewResult> {
    try {
      const { operations, state, calls } = await realize(plan(), {
        creditAccount: props.creditAccount,
        sdk: props.sdk,
        slippage: props.slippage ?? 0,
        quotaReserve: props.quotaReserve,
      });
      return { ok: true, operations, preview: state, calls };
    } catch (e) {
      return asFailure(e);
    }
  }
}

/** Unviable requests are values; anything else is a genuine failure. */
function asFailure(e: unknown): { ok: false; reason: PreviewErrorReason } {
  if (e instanceof IntentPreviewError) {
    return { ok: false, reason: e.reason };
  }
  throw e;
}
