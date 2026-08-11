import {
  type DelayedCloseAccountIntent,
  type DelayedDecreaseLeverageIntent,
  type DelayedIntent,
  type DelayedWithdrawCollateralIntent,
  type OnchainSDK,
  SDKConstruct,
} from "../../index.js";
import {
  buildResumeAddCollateralOperations,
  buildResumeCloseOperations,
  buildResumeDecreaseLeverageOperations,
  buildResumeDepositOperations,
  buildResumeIncreaseLeverageOperations,
  buildResumeWithdrawOperations,
} from "./intents/resume/index.js";
import type {
  AccountCalculatorOperation,
  ClaimDelayedOption,
  OffchainOption,
  OnchainOption,
} from "./operations/index.js";
import {
  createCloseOracleQuoter,
  createOracleSwapQuoter,
  createRouterCloseQuoter,
  createRouterSwapQuoter,
} from "./quoters/index.js";
import type { CreditAccountSlice, IntentPreviewResult } from "./types.js";
import {
  assembleOperationCalls,
  getOperationsWithQuotaUpdate,
  simulateState,
} from "./utils/index.js";

type ResumeGenericProps<T extends DelayedIntent> = {
  intent: T;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  quotaReserve: number | undefined;
  options: ClaimDelayedOption;
  slippage: number | undefined;
};

type ResumeProps = ResumeGenericProps<DelayedIntent>;
type ResumeShortProps = Omit<ResumeGenericProps<DelayedIntent>, "options">;

type ResumeCloseAccountProps = ResumeGenericProps<DelayedCloseAccountIntent>;
type ResumeWithdrawCollateralProps =
  ResumeGenericProps<DelayedWithdrawCollateralIntent>;
type ResumeDecreaseLeverageProps =
  ResumeGenericProps<DelayedDecreaseLeverageIntent>;

type BuildResumeOperations = (
  creditAccount: CreditAccountSlice,
  options: ClaimDelayedOption,
  sdk: OnchainSDK,
) => Array<AccountCalculatorOperation>;

export class CreditAccountOperationsService extends SDKConstruct {
  async finishIntent(props: ResumeProps) {
    const intent = props.intent;

    switch (intent.type) {
      case "ADD_COLLATERAL": {
        return this.#finishAddCollateralIntent({ ...props, intent });
      }
      case "INCREASE_LEVERAGE": {
        return this.#finishIncreaseLeverageIntent({ ...props, intent });
      }
      case "DEPOSIT": {
        return this.#finishDepositIntent({ ...props, intent });
      }
      case "DEPOSIT_AND_INCREASE_LEVERAGE": {
        return this.#finishDepositAndIncreaseLeverageIntent({
          ...props,
          intent,
        });
      }
      case "CLOSE_ACCOUNT": {
        return this.#finishCloseAccountIntent({ ...props, intent });
      }
      case "WITHDRAW_COLLATERAL": {
        return this.#finishWithdrawCollateralIntent({ ...props, intent });
      }
      case "DECREASE_LEVERAGE": {
        return this.#finishDecreaseLeverageIntent({ ...props, intent });
      }
      default: {
        throw new Error(`${props.intent.type} - not implemented`);
      }
    }
  }

  /**
   * Shared resume flow for claim-only intents (add collateral, increase
   * leverage, deposit, deposit+increase): claim op + trailing changeQuota.
   * If any implementations change, respective handler should be implemented separately
   */
  #finishClaimOnlyIntent =
    (buildOperations: BuildResumeOperations) =>
    async (props: ResumeProps): Promise<IntentPreviewResult> => {
      switch (props.options.kind) {
        case "offchain": {
          return this.#finishClaimOnlyIntentOffchain(
            props,
            props.options,
            buildOperations,
          );
        }

        default: {
          return this.#finishClaimOnlyIntentOnchain(
            props,
            props.options,
            buildOperations,
          );
        }
      }
    };

  #finishClaimOnlyIntentOffchain(
    props: ResumeShortProps,
    options: OffchainOption,
    buildOperations: BuildResumeOperations,
  ): IntentPreviewResult {
    const baseOperations = buildOperations(
      props.creditAccount,
      options,
      this.sdk,
    );

    const state = simulateState({
      ...props,
      operations: baseOperations,
    });

    const operations = getOperationsWithQuotaUpdate({
      operations: baseOperations,
      state,
      creditAccount: props.creditAccount,
      sdk: this.sdk,
      options,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: state.state,
        },
        calls: [],
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }
  async #finishClaimOnlyIntentOnchain(
    props: ResumeShortProps,
    options: OnchainOption,
    buildOperations: BuildResumeOperations,
  ): Promise<IntentPreviewResult> {
    const baseOperations = buildOperations(
      props.creditAccount,
      options,
      this.sdk,
    );

    const state = simulateState({
      ...props,
      operations: baseOperations,
    });

    const operations = getOperationsWithQuotaUpdate({
      operations: baseOperations,
      state,
      creditAccount: props.creditAccount,
      sdk: this.sdk,
      options,
    });

    const calls = await assembleOperationCalls({
      ...props,
      operations,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: state.state,
        },
        calls,
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }

  #finishAddCollateralIntent = this.#finishClaimOnlyIntent(
    buildResumeAddCollateralOperations,
  );
  #finishIncreaseLeverageIntent = this.#finishClaimOnlyIntent(
    buildResumeIncreaseLeverageOperations,
  );
  #finishDepositIntent = this.#finishClaimOnlyIntent(
    buildResumeDepositOperations,
  );
  #finishDepositAndIncreaseLeverageIntent = this.#finishClaimOnlyIntent(
    buildResumeDepositOperations,
  );

  /**
   * Resume close: claim, then close against quoted post-claim balances.
   * Offchain quotes equity by oracle prices, onchain — router close path.
   * Router miss soft-fails to the oracle quote with `calls: []` (legacy parity).
   */
  async #finishCloseAccountIntent({
    options,
    ...props
  }: ResumeCloseAccountProps): Promise<IntentPreviewResult> {
    switch (options.kind) {
      case "offchain": {
        return this.#finishCloseAccountIntentOffchain({
          ...props,
          options,
        });
      }

      default: {
        try {
          const r = await this.#finishCloseAccountIntentOnchain({
            ...props,
            options,
          });

          return r;
        } catch {
          const r = this.#finishCloseAccountIntentOffchain({
            ...props,
            options,
          });

          return r;
        }
      }
    }
  }
  async #finishCloseAccountIntentOffchain({
    options,
    ...props
  }: ResumeCloseAccountProps): Promise<IntentPreviewResult> {
    const quoter = createCloseOracleQuoter({
      sdk: this.sdk,
      creditAccount: props.creditAccount,
    });

    const { operations, quote } = await buildResumeCloseOperations(
      { ...props, options },
      quoter,
    );

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: {
            kind: "close",
            amount: quote.amount,
            minAmount: quote.minAmount,
            underlyingBalance: quote.underlyingBalance,
          },
        },
        calls: [],
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }
  async #finishCloseAccountIntentOnchain({
    options,
    slippage = 0,
    ...props
  }: ResumeCloseAccountProps): Promise<IntentPreviewResult> {
    const quoter = createRouterCloseQuoter({
      sdk: this.sdk,
      creditAccount: props.creditAccount,
      slippage,
    });

    const { operations, quote } = await buildResumeCloseOperations(
      { ...props, options },
      quoter,
    );

    const calls = await assembleOperationCalls({
      ...props,
      operations,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: {
            kind: "close",
            amount: quote.amount,
            minAmount: quote.minAmount,
            underlyingBalance: quote.underlyingBalance,
          },
        },
        calls,
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }

  /**
   * Resume withdraw: claim → (swap?) → decreaseDebt? → (unwrapRwa?) →
   * withdrawCollateral + trailing changeQuota. Offchain prices swaps by
   * oracle, onchain — router swap paths (leftover-aware).
   */
  async #finishWithdrawCollateralIntent({
    options,
    ...props
  }: ResumeWithdrawCollateralProps): Promise<IntentPreviewResult> {
    switch (options.kind) {
      case "offchain": {
        return this.#finishWithdrawCollateralIntentOffchain({
          ...props,
          options,
        });
      }

      default: {
        try {
          const r = await this.#finishWithdrawCollateralIntentOnchain({
            ...props,
            options,
          });
          return r;
        } catch {
          return this.#finishWithdrawCollateralIntentOffchain({
            ...props,
            options,
          });
        }
      }
    }
  }
  async #finishWithdrawCollateralIntentOffchain({
    options,
    ...props
  }: ResumeWithdrawCollateralProps): Promise<IntentPreviewResult> {
    const quoter = createOracleSwapQuoter({
      sdk: this.sdk,
      creditAccount: props.creditAccount,
    });

    const baseOperations = await buildResumeWithdrawOperations(
      { ...props, options },
      quoter,
    );

    const state = simulateState({
      ...props,
      operations: baseOperations,
    });

    const operations = getOperationsWithQuotaUpdate({
      operations: baseOperations,
      state,
      creditAccount: props.creditAccount,
      sdk: this.sdk,
      options,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: state.state,
        },
        calls: [],
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }
  async #finishWithdrawCollateralIntentOnchain({
    options,
    slippage = 0,
    ...props
  }: ResumeWithdrawCollateralProps): Promise<IntentPreviewResult> {
    const quoter = createRouterSwapQuoter({
      sdk: this.sdk,
      creditAccount: props.creditAccount,
      slippage,
    });

    const baseOperations = await buildResumeWithdrawOperations(
      { ...props, options },
      quoter,
    );

    const state = simulateState({
      ...props,
      operations: baseOperations,
    });

    const operations = getOperationsWithQuotaUpdate({
      operations: baseOperations,
      state,
      creditAccount: props.creditAccount,
      sdk: this.sdk,
      options,
    });

    const calls = await assembleOperationCalls({
      ...props,
      operations,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: state.state,
        },
        calls,
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }

  /**
   * Resume decrease leverage: claim → (wrapRwa | swap)? → decreaseDebt +
   * trailing changeQuota. Offchain prices swaps by oracle, onchain — router
   * swap paths. Router miss soft-fails to the oracle quote (legacy parity).
   */
  async #finishDecreaseLeverageIntent({
    options,
    ...props
  }: ResumeDecreaseLeverageProps): Promise<IntentPreviewResult> {
    switch (options.kind) {
      case "offchain": {
        return this.#finishDecreaseLeverageIntentOffchain({
          ...props,
          options,
        });
      }

      default: {
        try {
          const r = await this.#finishDecreaseLeverageIntentOnchain({
            ...props,
            options,
          });
          return r;
        } catch {
          return this.#finishDecreaseLeverageIntentOffchain({
            ...props,
            options,
          });
        }
      }
    }
  }
  async #finishDecreaseLeverageIntentOffchain({
    options,
    ...props
  }: ResumeDecreaseLeverageProps): Promise<IntentPreviewResult> {
    const quoter = createOracleSwapQuoter({
      sdk: this.sdk,
      creditAccount: props.creditAccount,
    });

    const baseOperations = await buildResumeDecreaseLeverageOperations(
      { ...props, options },
      quoter,
    );

    const state = simulateState({
      ...props,
      operations: baseOperations,
    });

    const operations = getOperationsWithQuotaUpdate({
      operations: baseOperations,
      state,
      creditAccount: props.creditAccount,
      sdk: this.sdk,
      options,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: state.state,
        },
        calls: [],
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }
  async #finishDecreaseLeverageIntentOnchain({
    options,
    slippage = 0,
    ...props
  }: ResumeDecreaseLeverageProps): Promise<IntentPreviewResult> {
    const quoter = createRouterSwapQuoter({
      sdk: this.sdk,
      creditAccount: props.creditAccount,
      slippage,
    });

    const baseOperations = await buildResumeDecreaseLeverageOperations(
      { ...props, options },
      quoter,
    );

    const state = simulateState({
      ...props,
      operations: baseOperations,
    });

    const operations = getOperationsWithQuotaUpdate({
      operations: baseOperations,
      state,
      creditAccount: props.creditAccount,
      sdk: this.sdk,
      options,
    });

    const calls = await assembleOperationCalls({
      ...props,
      operations,
    });

    return {
      ok: true,

      instant: {
        operations,
        preview: {
          min: state.state,
        },
        calls,
      },
      instantError: undefined,

      delayedBranch: undefined,
      delayedError: undefined,
    };
  }
}
