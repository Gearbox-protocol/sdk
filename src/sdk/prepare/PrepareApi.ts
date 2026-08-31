import type { Address } from "viem";
import type {
  Bps,
  ChainId,
  IGearboxError,
  PositionClaimableWithdrawal,
  PositionCollateral,
  SDKError,
  SDKReturn,
  StrategyPosition,
  Timestamp,
} from "../../model/index.js";
import { sdkErr, sdkOk } from "../../model/index.js";
import type {
  Asset,
  ClaimableWithdrawal,
  CreditAccountSlice,
  DelayableIntent,
  DelayedIntentExtended,
  FinishIntentResult,
  IntentPreviewResult,
  IntentRoutesResult,
  LeverageBand,
  OnchainSDK,
  OpenStrategyPreviewResult,
  PoolSimulation,
  PreviewIssue,
  ResumableIntent,
  StartIntent,
  WithdrawCeilings,
} from "../../onchain/index.js";
import {
  CreditAccountOperationsService,
  hexEq,
  MultichainConstruct,
  type MultichainSDK,
  toCreditAccountSlice,
  toToken,
} from "../../onchain/index.js";
import type { EnsureFreshChains } from "../types.js";
import type {
  AccountFlowError,
  DebtOutOfRangeError,
  InsufficientPoolLiquidityError,
  LeverageOutOfRangeError,
  MultipleDelayedWithdrawalsError,
  NoDelayedRouteError,
  NoRecordedIntentError,
  NoStrategyTargetCollateralError,
  OpenFlowError,
  UnexpectedFailureError,
  UnsupportedCollateralTokenError,
  UnsupportedTokenPairError,
  WithdrawalInProgressError,
  WithRouteRefusals,
} from "./errors.js";
import {
  creditAccountNotFound,
  noStrategyTargetCollateral,
  toRefusalError,
  unexpectedFailure,
} from "./errors.js";
import type {
  AddCollateralParams,
  AdjustLeverageParams,
  DepositStrategyParams,
  FinalizeParams,
  FinalizeResult,
  IOpportunitiesPrepare,
  LpParams,
  LpRedeemParams,
  LpResult,
  LpState,
  OpenStrategyParams,
  OpenStrategyResult,
  PoolInput,
  PositionInput,
  PrepareOptions,
  RepayStrategyParams,
  StrategyInput,
  StrategyResult,
  StrategyRoutesResult,
  WithdrawCollateralParams,
  WithdrawStrategyParams,
} from "./types.js";
import { withdrawableCollaterals } from "./withdrawable-collaterals.js";

/**
 * The chain's SDK, resolved on the spot.
 *
 * The LP methods need it synchronously, because they only do arithmetic on
 * loaded state and have nothing to await; the execute namespace resolves its
 * chain the same way.
 **/
export type ChainOf = (chainId: ChainId) => OnchainSDK;

/**
 * The block half of every result: the chain state the answer was computed
 * from, and therefore the state its numbers hold at.
 **/
interface PreparedAt {
  blockNumber: number;
  timestamp: Timestamp;
}

/**
 * {@inheritDoc IOpportunitiesPrepare}
 *
 * Holds no state of its own: it owns the mapping from the public,
 * read-model-shaped request to the engine's intent, and nothing else. All
 * protocol knowledge stays in `CreditAccountOperationsService` and
 * `PoolService`.
 *
 * A prepared operation names one chain and reads it directly: there is no
 * second source to fall back to, so a chain the SDK does not cover, or one
 * that fails the read, is a failure of the whole request rather than a thinner
 * answer.
 *
 * No refusable async method here throws. Every way such a preparation can
 * fail — the market's own refusals, the ones the namespace decides itself, and
 * anything the chain or the engine raises — comes back in the failure half of
 * its `SDKReturn`, under the codes that method's signature names. A caller
 * writes one branch, not a branch and a `try`. The synchronous LP methods and
 * the bare `max*` reads throw on bugs and lifecycle errors instead, see
 * {@link IOpportunitiesPrepare}.
 **/
export class PrepareApi
  extends MultichainConstruct
  implements IOpportunitiesPrepare
{
  readonly #ensureFresh?: EnsureFreshChains;

  constructor(sdk: MultichainSDK, ensureFresh?: EnsureFreshChains) {
    super(sdk);
    this.#ensureFresh = ensureFresh;
  }

  /**
   * The chain an async method reads, revalidated first so the state it is
   * about to weigh is no older than the SDK's freshness bar.
   **/
  async #chain(chainId: ChainId): Promise<OnchainSDK> {
    await this.#ensureFresh?.([this.sdk.chain(chainId).chainId]);
    return this.sdk.chain(chainId);
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.finalize}
   **/
  public async finalize(
    position: PositionInput,
    params: FinalizeParams,
  ): Promise<
    SDKReturn<
      FinalizeResult,
      | AccountFlowError
      | NoRecordedIntentError
      | NoDelayedRouteError
      | WithdrawalInProgressError
      | UnsupportedTokenPairError
    >
  > {
    try {
      const sdk = await this.#chain(position.chainId);
      const at = stateBlock(sdk);
      const intent = resumable(params.intent ?? params.claimable.intent);
      if (!intent) {
        return sdkErr(
          toRefusalError({ reason: "noRecordedIntent", detail: undefined }),
        );
      }
      const creditAccount = await slice(sdk, position.creditAccount);
      if (!creditAccount) {
        return sdkErr(creditAccountNotFound(position.creditAccount));
      }
      return finalized(
        await service(sdk).finishIntent({
          intent,
          claimable: toClaimableWithdrawal(params.claimable),
          creditAccount,
          sdk,
          slippage: params.slippage,
          quotaReserve: params.quotaReserve,
        }),
        at,
      );
    } catch (e) {
      return sdkErr(unexpectedFailure(e));
    }
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.deposit}
   **/
  public async deposit(
    pool: PoolInput,
    params: LpParams,
  ): Promise<
    SDKReturn<LpResult, UnsupportedTokenPairError | UnexpectedFailureError>
  > {
    try {
      const chain = await this.#chain(pool.chainId);
      const { marketRegister, pools } = chain;
      const tokenIn =
        params.tokenIn ?? marketRegister.findByPool(pool.pool).pool.underlying;
      const tokenOut = lpRoute(params.tokenOut, () =>
        pools.getDepositTokensOut(pool.pool, tokenIn),
      );
      if (!tokenOut) {
        return unroutable(chain, tokenIn, undefined);
      }

      const state = pools.simulateDeposit({
        pool: pool.pool,
        amount: params.amount,
        tokenIn,
        tokenOut,
      });
      const call = pools.addLiquidity({
        collateral: {
          token: state.tokenIn.token.address,
          balance: state.tokenIn.value,
        },
        pool: pool.pool,
        wallet: params.wallet,
        meta: pools.getDepositMetadata(pool.pool, tokenIn, tokenOut),
      });
      // An on-demand RWA market takes deposits through its liquidity provider
      // rather than a transaction of ours, so there is nothing to prepare.
      if (!call) {
        return unroutable(chain, tokenIn, tokenOut);
      }

      return sdkOk<LpResult>({
        operations: [],
        // a deposit mints the shares it reports as its output
        state: await lpState(chain, pool.pool, params.wallet, state, {
          mints: state.tokenOut.value,
        }),
        calls: call.calls,
        ...stateBlock(chain),
      });
    } catch (e) {
      return sdkErr(unexpectedFailure(e));
    }
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.withdraw}
   **/
  public async withdraw(
    pool: PoolInput,
    params: LpParams,
  ): Promise<
    SDKReturn<LpResult, UnsupportedTokenPairError | UnexpectedFailureError>
  > {
    // {@inheritDoc PrepareApi.deposit} — same footing.
    try {
      const chain = await this.#chain(pool.chainId);
      const { pools } = chain;
      // Withdrawals are paid in shares, and the share token *is* the pool.
      const tokenIn = params.tokenIn ?? pool.pool;
      const tokenOut = lpRoute(params.tokenOut, () =>
        pools.getWithdrawalTokensOut(pool.pool, tokenIn),
      );
      if (!tokenOut) {
        return unroutable(chain, tokenIn, undefined);
      }

      // Amount is the tokenOut the wallet wants back, which is what the pool's
      // own `withdraw` takes: the share conversion is the pool's to make.
      const state = pools.simulateWithdraw({
        pool: pool.pool,
        amount: params.amount,
        tokenIn,
        tokenOut,
      });
      const { calls } = pools.removeLiquidity({
        pool: pool.pool,
        amount: params.amount,
        wallet: params.wallet,
        permit: undefined,
        meta: pools.getWithdrawalMetadata(pool.pool, tokenIn, tokenOut),
        mode: "withdraw",
      });

      return sdkOk<LpResult>({
        operations: [],
        // a withdrawal burns the shares its payout costs
        state: await lpState(chain, pool.pool, params.wallet, state, {
          burns: state.tokenIn.value,
        }),
        calls,
        ...stateBlock(chain),
      });
    } catch (e) {
      return sdkErr(unexpectedFailure(e));
    }
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.redeem}
   **/
  public async redeem(
    pool: PoolInput,
    params: LpRedeemParams,
  ): Promise<
    SDKReturn<LpResult, UnsupportedTokenPairError | UnexpectedFailureError>
  > {
    // {@inheritDoc PrepareApi.deposit} — same footing.
    try {
      const chain = await this.#chain(pool.chainId);
      const { pools } = chain;
      const tokenIn = params.tokenIn ?? pool.pool;
      const tokenOut = lpRoute(params.tokenOut, () =>
        pools.getWithdrawalTokensOut(pool.pool, tokenIn),
      );
      if (!tokenOut) {
        return unroutable(chain, tokenIn, undefined);
      }

      const state = pools.simulateRedeem({
        pool: pool.pool,
        amount: params.amount,
        tokenIn,
        tokenOut,
      });
      const { calls } = pools.removeLiquidity({
        pool: pool.pool,
        amount: params.amount,
        wallet: params.wallet,
        permit: undefined,
        meta: pools.getWithdrawalMetadata(pool.pool, tokenIn, tokenOut),
        mode: "redeem",
      });

      return sdkOk<LpResult>({
        operations: [],
        // a redemption burns exactly the shares it was asked for
        state: await lpState(chain, pool.pool, params.wallet, state, {
          burns: state.tokenIn.value,
        }),
        calls,
        ...stateBlock(chain),
      });
    } catch (e) {
      return sdkErr(unexpectedFailure(e));
    }
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.openNewStrategy}
   **/
  public async openNewStrategy(
    strategy: StrategyInput,
    params: OpenStrategyParams,
  ): Promise<
    SDKReturn<
      OpenStrategyResult,
      | OpenFlowError
      | DebtOutOfRangeError
      | LeverageOutOfRangeError
      | UnsupportedTokenPairError
      | InsufficientPoolLiquidityError
      | NoStrategyTargetCollateralError
    >
  > {
    try {
      const sdk = await this.#chain(strategy.chainId);
      const at = stateBlock(sdk);
      const targetToken =
        params.targetToken ??
        sdk.marketRegister.findCreditManager(strategy.creditManager)
          .strategyTargetCollateral;
      if (!targetToken) {
        return sdkErr(noStrategyTargetCollateral(strategy.creditManager));
      }
      return opened(
        await service(sdk).openStrategyIntent({
          sdk,
          creditManager: strategy.creditManager,
          collateral: params.collateral,
          targetToken,
          leverage: params.leverage,
          leftoverBalances: params.leftoverBalances,
          slippage: params.slippage,
          quotaReserve: params.quotaReserve,
        }),
        at,
      );
    } catch (e) {
      return sdkErr(unexpectedFailure(e));
    }
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.depositStrategy}
   **/
  public async depositStrategy(
    position: PositionInput,
    params: DepositStrategyParams,
  ): Promise<
    SDKReturn<
      StrategyResult,
      | AccountFlowError
      | DebtOutOfRangeError
      | LeverageOutOfRangeError
      | UnsupportedCollateralTokenError
      | UnsupportedTokenPairError
      | InsufficientPoolLiquidityError
    >
  > {
    return this.#startIntent<
      | DebtOutOfRangeError
      | LeverageOutOfRangeError
      | UnsupportedCollateralTokenError
      | UnsupportedTokenPairError
      | InsufficientPoolLiquidityError
    >(position, params, {
      type: "DEPOSIT",
      token: params.token,
      amount: params.amount,
      value: params.value,
      positionToken: params.positionToken,
      targetLeverage: params.targetLeverage,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.withdrawStrategy}
   **/
  public async withdrawStrategy(
    position: PositionInput,
    params: WithdrawStrategyParams,
  ): Promise<
    SDKReturn<
      StrategyRoutesResult,
      (
        | AccountFlowError
        | DebtOutOfRangeError
        | UnsupportedTokenPairError
        | NoDelayedRouteError
        | MultipleDelayedWithdrawalsError
        | WithdrawalInProgressError
      ) &
        WithRouteRefusals
    >
  > {
    return this.#startRoutes(position, params, {
      type: "WITHDRAW",
      amount: params.amount,
      to: params.to,
      tokenOut: params.tokenOut,
      sourceToken: params.sourceToken,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.maxWithdraw}
   **/
  public async maxWithdraw(position: PositionInput): Promise<WithdrawCeilings> {
    const sdk = await this.#chain(position.chainId);
    const creditAccount = await this.#account(sdk, position);
    return service(sdk).maxWithdraw({ creditAccount, sdk });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.repayStrategy}
   **/
  public async repayStrategy(
    position: PositionInput,
    params: RepayStrategyParams,
  ): Promise<
    SDKReturn<
      StrategyResult,
      AccountFlowError | DebtOutOfRangeError | UnsupportedCollateralTokenError
    >
  > {
    return this.#startIntent<
      DebtOutOfRangeError | UnsupportedCollateralTokenError
    >(position, params, {
      type: "REPAY",
      token: params.token,
      amount: params.amount,
      value: params.value,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.maxRepay}
   **/
  public async maxRepay(position: PositionInput): Promise<bigint> {
    const sdk = await this.#chain(position.chainId);
    const creditAccount = await this.#account(sdk, position);
    return service(sdk).maxRepay({ creditAccount, sdk });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.adjustLeverage}
   **/
  public async adjustLeverage(
    position: PositionInput,
    params: AdjustLeverageParams,
  ): Promise<
    SDKReturn<
      StrategyRoutesResult,
      (
        | AccountFlowError
        | DebtOutOfRangeError
        | UnsupportedTokenPairError
        | NoDelayedRouteError
        | MultipleDelayedWithdrawalsError
        | WithdrawalInProgressError
        | InsufficientPoolLiquidityError
        | LeverageOutOfRangeError
      ) &
        WithRouteRefusals
    >
  > {
    return this.#startRoutes<
      InsufficientPoolLiquidityError | LeverageOutOfRangeError
    >(position, params, {
      type: "ADJUST_LEVERAGE",
      targetLeverage: params.targetLeverage,
      token: params.token,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.addCollateral}
   **/
  public async addCollateral(
    position: PositionInput,
    params: AddCollateralParams,
  ): Promise<SDKReturn<StrategyResult, AccountFlowError>> {
    return this.#startIntent(position, params, {
      type: "ADD_COLLATERAL",
      token: params.token,
      amount: params.amount,
      value: params.value,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.withdrawCollateral}
   **/
  public async withdrawCollateral(
    position: PositionInput,
    params: WithdrawCollateralParams,
  ): Promise<SDKReturn<StrategyResult, AccountFlowError>> {
    return this.#startIntent(position, params, {
      type: "WITHDRAW_ASSET",
      token: params.token,
      amount: params.amount,
      to: params.to,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.leverageBand}
   **/
  public leverageBand(
    strategy: StrategyInput,
    collateral: readonly Asset[],
    targetHF?: Bps,
  ): LeverageBand | undefined {
    // Bare: there is nothing to read and nothing to await, and wrapping
    // arithmetic in an envelope would cost the caller the very immediacy this
    // answer exists to give.
    const sdk = this.sdk.chain(strategy.chainId);
    return service(sdk).leverageBand({
      sdk,
      creditManager: strategy.creditManager,
      collateral,
      targetHF,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.withdrawableCollaterals}
   **/
  public withdrawableCollaterals(
    position: StrategyPosition,
  ): PositionCollateral[] {
    // Bare, as with `leverageBand`: everything needed is on the position and
    // in loaded token metadata, and wrapping a filter in an envelope would
    // cost the caller the immediacy this answer exists for.
    return withdrawableCollaterals(this.sdk.chain(position.chainId), position);
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.maxWithdrawCollateral}
   **/
  public async maxWithdrawCollateral(
    position: PositionInput,
    token: Address,
    targetHF?: bigint,
  ): Promise<bigint> {
    const sdk = await this.#chain(position.chainId);
    const creditAccount = await this.#account(sdk, position);
    return service(sdk).maxWithdrawCollateral({
      creditAccount,
      sdk,
      token,
      targetHF,
    });
  }

  /**
   * The account a bare `max*` read weighs. These reads answer a number, not
   * an envelope, so an account the markets do not hold is thrown rather than
   * described, see {@link IOpportunitiesPrepare.maxWithdraw}.
   **/
  async #account(
    sdk: OnchainSDK,
    position: PositionInput,
  ): Promise<CreditAccountSlice> {
    const creditAccount = await slice(sdk, position.creditAccount);
    if (!creditAccount) {
      throw new Error(creditAccountNotFound(position.creditAccount).message);
    }
    return creditAccount;
  }

  /**
   * Shared path of the two flows that sell a position asset, and therefore
   * have two routes to offer: one account read, one intent, both routes
   * quoted. Every refusal, the crash wrap included, carries `refused` so a
   * form can say which routes were ruled out and why.
   *
   * @typeParam X - The codes the calling flow can raise beyond the shared
   * ones, per the engine trace its signature spells out.
   **/
  async #startRoutes<X extends IGearboxError = never>(
    position: PositionInput,
    options: PrepareOptions,
    intent: DelayableIntent,
  ): Promise<
    SDKReturn<
      StrategyRoutesResult,
      (
        | AccountFlowError
        | DebtOutOfRangeError
        | UnsupportedTokenPairError
        | NoDelayedRouteError
        | MultipleDelayedWithdrawalsError
        | WithdrawalInProgressError
        | X
      ) &
        WithRouteRefusals
    >
  > {
    try {
      const sdk = await this.#chain(position.chainId);
      const at = stateBlock(sdk);
      const creditAccount = await slice(sdk, position.creditAccount);
      if (!creditAccount) {
        return neitherRoute(creditAccountNotFound(position.creditAccount));
      }
      return routed(
        await service(sdk).intentRoutes({
          intent,
          creditAccount,
          sdk,
          slippage: options.slippage,
          quotaReserve: options.quotaReserve,
        }),
        at,
      );
    } catch (e) {
      return neitherRoute(unexpectedFailure(e));
    }
  }

  /**
   * Shared path of the five flows that act on an existing account: read the
   * account, then run the intent through the engine. Whatever the chain or
   * the engine throws on the way is described as `unexpectedFailure` instead
   * of escaping, so the flow always answers.
   *
   * @typeParam X - The codes the calling flow can raise beyond the shared
   * ones, per the engine trace its signature spells out.
   **/
  async #startIntent<X extends IGearboxError = never>(
    position: PositionInput,
    options: PrepareOptions,
    intent: StartIntent,
  ): Promise<SDKReturn<StrategyResult, AccountFlowError | X>> {
    try {
      const sdk = await this.#chain(position.chainId);
      const at = stateBlock(sdk);
      const creditAccount = await slice(sdk, position.creditAccount);
      if (!creditAccount) {
        return sdkErr(creditAccountNotFound(position.creditAccount));
      }
      return planned(
        await service(sdk).startIntent({
          intent,
          creditAccount,
          sdk,
          slippage: options.slippage,
          quotaReserve: options.quotaReserve,
        }),
        at,
      );
    } catch (e) {
      return sdkErr(unexpectedFailure(e));
    }
  }
}

function service(sdk: OnchainSDK): CreditAccountOperationsService {
  return new CreditAccountOperationsService(sdk);
}

/**
 * Reads the block the SDK's loaded state stands at — the same state every
 * preparation below is computed from, so it is the block the result reports.
 **/
function stateBlock(sdk: OnchainSDK): PreparedAt {
  return {
    blockNumber: Number(sdk.currentBlock),
    timestamp: Number(sdk.timestamp),
  };
}

/**
 * The account the request names, or nothing where the markets this SDK is
 * connected to hold no such account — closed since it was listed, or named on
 * the wrong chain. Read rather than thrown, so the caller gets a code for it.
 **/
async function slice(
  sdk: OnchainSDK,
  creditAccount: Address,
): Promise<CreditAccountSlice | undefined> {
  const data = await sdk.accounts.getCreditAccountData(creditAccount);
  return data && toCreditAccountSlice(data);
}

/**
 * The operation a claim resumes, or `undefined` when there is none to resume:
 * a withdrawal requested without an intent, or one read through a compressor
 * too old to report it. Every intent the engine records can be finished,
 * `CLOSE_ACCOUNT` included.
 **/
function resumable(
  intent: DelayedIntentExtended | ResumableIntent | undefined,
): ResumableIntent | undefined {
  return intent ?? undefined;
}

/**
 * Unwraps a read-model claimable withdrawal into the compressor shape the
 * intents engine plans from.
 **/
function toClaimableWithdrawal(
  claimable: PositionClaimableWithdrawal,
): ClaimableWithdrawal {
  return {
    token: claimable.sourceToken.address,
    withdrawalPhantomToken: claimable.withdrawalPhantomToken.token.address,
    withdrawalTokenSpent: claimable.withdrawalPhantomToken.value,
    outputs: claimable.outputs.map(o => ({
      token: o.token.address,
      amount: o.value,
      isDelayed: o.isDelayed,
    })),
    claimCalls: [
      {
        target: claimable.claimCall.to,
        callData: claimable.claimCall.callData,
      },
    ],
    redeemer: claimable.redeemer,
  };
}

/**
 * The engine's refusal as one flow's failure half.
 *
 * The engine answers with the open union of every reason it can raise
 * anywhere; which of them a given flow actually reaches is the engine trace
 * written into the public signatures. This cast is the one place the open
 * union is narrowed onto them — a code added to or removed from a flow has to
 * move its signature, which `types.test-d.ts` pins.
 **/
function refusal<E extends IGearboxError>(issue: PreviewIssue): SDKError<E> {
  return sdkErr(toRefusalError(issue) as unknown as E);
}

/**
 * A flow with two routes, refused before either could be quoted: the error is
 * the same one any other flow would report, with nothing to say about the
 * routes because neither was reached.
 **/
function neitherRoute<E extends IGearboxError>(
  error: E,
): SDKError<E & WithRouteRefusals> {
  return sdkErr({
    ...error,
    refused: { instant: undefined, delayed: undefined },
  });
}

/**
 * The engine's answer, as the envelope the namespace speaks in: what the
 * operation comes to under `data`, stamped with the block it was computed
 * from, or the refusal as an error carrying its own numbers, see
 * {@link refusal}.
 *
 * The engine keeps its `ok` union — it is the shape the planners, the guards
 * and their tests are written against — and the boundary is the one place the
 * two vocabularies meet.
 **/
function planned<E extends IGearboxError>(
  result: IntentPreviewResult,
  at: PreparedAt,
): SDKReturn<StrategyResult, E> {
  if (!result.ok) {
    return refusal<E>(result);
  }
  const { operations, state, calls } = result;
  return sdkOk({ operations, state, calls, ...at });
}

/**
 * {@inheritDoc planned}
 *
 * A tail carries one thing the other results do not: whether the claim it was
 * built on finished the withdrawal, or left part of it queued for another one.
 **/
function finalized<E extends IGearboxError>(
  result: FinishIntentResult,
  at: PreparedAt,
): SDKReturn<FinalizeResult, E> {
  if (!result.ok) {
    return refusal<E>(result);
  }
  const { operations, state, calls, remainder } = result;
  return sdkOk({ operations, state, calls, remainder, ...at });
}

/**
 * {@inheritDoc planned}
 **/
function opened<E extends IGearboxError>(
  result: OpenStrategyPreviewResult,
  at: PreparedAt,
): SDKReturn<OpenStrategyResult, E> {
  return result.ok ? sdkOk({ state: result.state, ...at }) : refusal<E>(result);
}

/**
 * {@inheritDoc planned}
 *
 * Both routes are payload, refusal and all: `refused` says why a missing one is
 * missing, and it stays on the error when neither route answered, since that is
 * the same question asked of a request that has no viable half at all.
 **/
function routed<E extends IGearboxError & WithRouteRefusals>(
  result: IntentRoutesResult,
  at: PreparedAt,
): SDKReturn<StrategyRoutesResult, E> {
  if (!result.ok) {
    const { refused, ...issue } = result;
    // {@inheritDoc refusal} — the same narrowing, with `refused` carried over
    return sdkErr({ ...toRefusalError(issue), refused } as unknown as E);
  }
  const { instant, delayed, refused } = result;
  return sdkOk({
    instant: instant && {
      operations: instant.operations,
      state: instant.state,
      calls: instant.calls,
      ...at,
    },
    delayed: delayed && {
      operations: delayed.operations,
      state: delayed.state,
      calls: delayed.calls,
      delayed: delayed.delayed,
      ...at,
    },
    refused,
    ...at,
  });
}

/**
 * The pool's own numbers as the namespace reports them: the trade the service
 * priced, the market it belongs to, and where the wallet's position lands.
 *
 * The position is measured in shares and converted once, rather than added up
 * in underlying, so the figure is exactly what a later
 * `sdk.positions.list()` will report — the same balance through the same rate.
 * A withdrawal larger than the position floors at nothing: the transaction
 * would revert long before it got there, and a negative holding is not a thing
 * a screen can show.
 **/
async function lpState(
  sdk: OnchainSDK,
  pool: Address,
  wallet: Address,
  simulation: PoolSimulation,
  moved: { mints: bigint; burns?: never } | { burns: bigint; mints?: never },
): Promise<LpState> {
  const held = await sdk.pools.getShareBalance({ pool, wallet });
  const after = held + (moved.mints ?? -moved.burns);
  return {
    ...simulation,
    curator: sdk.marketRegister.findByPool(pool).curator,
    netValue: sdk.pools.sharesToUnderlying(pool, after > 0n ? after : 0n),
  };
}

/**
 * A pool route the market does not offer, as the refusal a caller reads.
 *
 * `to` is absent where {@link lpRoute} found no output to name at all, which
 * is the usual way of it; both are present where a pair exists but nothing of
 * ours implements it.
 **/
function unroutable(
  sdk: OnchainSDK,
  from: Address,
  to: Address | undefined,
): SDKError<UnsupportedTokenPairError> {
  return sdkErr(
    toRefusalError({
      reason: "unsupportedTokenPair",
      detail: {
        from: toToken(sdk, from),
        to: to === undefined ? undefined : toToken(sdk, to),
      },
    }),
  );
}

/**
 * Picks the route the operation takes out of `tokenIn`, as a value rather than
 * an exception: an unroutable or ambiguous pair is a request the caller can
 * fix, so it belongs in the failure half alongside the strategy refusals.
 *
 * A pool with no route out of the input reports it by throwing, hence the
 * catch; a requested output is checked against the list rather than trusted,
 * so that a wrong one fails here instead of deeper in call assembly.
 **/
function lpRoute(
  requested: Address | undefined,
  routes: () => Address[],
): Address | undefined {
  let options: Address[];
  try {
    options = routes();
  } catch {
    return undefined;
  }

  if (requested) {
    return options.some(o => hexEq(o, requested)) ? requested : undefined;
  }
  return options.length === 1 ? options[0] : undefined;
}
