import type { Address } from "viem";
import type {
  Bps,
  ChainId,
  DataResponse,
  PositionClaimableWithdrawal,
  PositionCollateral,
  StrategyPosition,
} from "../../model/index.js";
import type {
  Asset,
  ClaimableWithdrawal,
  CreditAccountSlice,
  DelayableIntent,
  DelayedIntentExtended,
  LeverageBand,
  OnchainSDK,
  ResumableIntent,
  StartIntent,
} from "../../onchain/index.js";
import {
  type ChainQueryOneProps,
  CreditAccountOperationsService,
  fetchCreditAccountSlice,
  hexEq,
  MultichainConstruct,
  type MultichainSDK,
  refuse,
  toToken,
} from "../../onchain/index.js";
import type { EnsureFreshChains } from "../types.js";
import type {
  AddCollateralParams,
  AdjustLeverageParams,
  DepositStrategyParams,
  FinalizeParams,
  IOpportunitiesPrepare,
  LpParams,
  LpPrepare,
  LpRedeemParams,
  OpenStrategyParams,
  OpenStrategyPrepare,
  PoolInput,
  PositionInput,
  PrepareOptions,
  RepayStrategyParams,
  StrategyInput,
  StrategyPrepare,
  StrategyRoutesPrepare,
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
 * {@inheritDoc IOpportunitiesPrepare}
 *
 * Holds no state of its own: it owns the mapping from the public,
 * read-model-shaped request to the engine's intent, and nothing else. All
 * protocol knowledge stays in `CreditAccountOperationsService` and
 * `PoolService`.
 *
 * A prepared operation names one chain, so it reads through
 * {@link MultichainConstruct.queryChain}: there is no second source to fall back
 * to, hence a chain the SDK does not cover, or one that fails the read, throws
 * rather than answering with empty metadata.
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

  protected override async queryChain<T>(
    props: ChainQueryOneProps<T>,
  ): Promise<DataResponse<T>> {
    await this.#ensureFresh?.([this.sdk.chain(props.network).chainId]);
    return super.queryChain(props);
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.finalize}
   **/
  public async finalize(
    position: PositionInput,
    params: FinalizeParams,
  ): Promise<DataResponse<StrategyPrepare>> {
    return this.queryChain({
      network: position.chainId,
      run: async sdk => {
        const intent = resumable(params.intent ?? params.claimable.intent);
        if (!intent) {
          return refuse("noRecordedIntent", undefined);
        }
        return service(sdk).finishIntent({
          intent,
          claimable: toClaimableWithdrawal(params.claimable),
          creditAccount: await slice(sdk, position.creditAccount),
          sdk,
          slippage: params.slippage,
          quotaReserve: params.quotaReserve,
        });
      },
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.deposit}
   **/
  public deposit(pool: PoolInput, params: LpParams): LpPrepare {
    const chain = this.sdk.chain(pool.chainId);
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

    return { ok: true, operations: [], state, calls: call.calls };
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.withdraw}
   **/
  public withdraw(pool: PoolInput, params: LpParams): LpPrepare {
    const chain = this.sdk.chain(pool.chainId);
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

    return { ok: true, operations: [], state, calls };
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.redeem}
   **/
  public redeem(pool: PoolInput, params: LpRedeemParams): LpPrepare {
    const chain = this.sdk.chain(pool.chainId);
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

    return { ok: true, operations: [], state, calls };
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.openNewStrategy}
   **/
  public async openNewStrategy(
    strategy: StrategyInput,
    params: OpenStrategyParams,
  ): Promise<DataResponse<OpenStrategyPrepare>> {
    return this.queryChain({
      network: strategy.chainId,
      run: sdk => {
        const targetToken =
          params.targetToken ??
          sdk.marketRegister.findCreditManager(strategy.creditManager)
            .strategyTargetCollateral;
        if (!targetToken) {
          throw new Error(
            `credit manager ${strategy.creditManager} has no strategy target collateral`,
          );
        }
        return service(sdk).openStrategyIntent({
          sdk,
          creditManager: strategy.creditManager,
          collateral: params.collateral,
          targetToken,
          leverage: params.leverage,
          leftoverBalances: params.leftoverBalances,
          slippage: params.slippage,
          quotaReserve: params.quotaReserve,
        });
      },
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.depositStrategy}
   **/
  public async depositStrategy(
    position: PositionInput,
    params: DepositStrategyParams,
  ): Promise<DataResponse<StrategyPrepare>> {
    return this.#startIntent(position, params, {
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
  ): Promise<DataResponse<StrategyRoutesPrepare>> {
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
  public async maxWithdraw(
    position: PositionInput,
  ): Promise<DataResponse<bigint>> {
    return this.queryChain({
      network: position.chainId,
      run: async sdk =>
        service(sdk).maxWithdraw({
          creditAccount: await slice(sdk, position.creditAccount),
          sdk,
        }),
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.repayStrategy}
   **/
  public async repayStrategy(
    position: PositionInput,
    params: RepayStrategyParams,
  ): Promise<DataResponse<StrategyPrepare>> {
    return this.#startIntent(position, params, {
      type: "REPAY",
      token: params.token,
      amount: params.amount,
      value: params.value,
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.maxRepay}
   **/
  public async maxRepay(
    position: PositionInput,
  ): Promise<DataResponse<bigint>> {
    return this.queryChain({
      network: position.chainId,
      run: async sdk =>
        service(sdk).maxRepay({
          creditAccount: await slice(sdk, position.creditAccount),
          sdk,
        }),
    });
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.adjustLeverage}
   **/
  public async adjustLeverage(
    position: PositionInput,
    params: AdjustLeverageParams,
  ): Promise<DataResponse<StrategyRoutesPrepare>> {
    return this.#startRoutes(position, params, {
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
  ): Promise<DataResponse<StrategyPrepare>> {
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
  ): Promise<DataResponse<StrategyPrepare>> {
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
    // No `queryChain`: there is nothing to read and nothing to await, and
    // wrapping arithmetic in a response would cost the caller the very
    // immediacy this answer exists to give.
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
    // No `queryChain`, as with `leverageBand`: everything needed is on the
    // position and in loaded token metadata, and wrapping a filter in a
    // response would cost the caller the immediacy this answer exists for.
    return withdrawableCollaterals(this.sdk.chain(position.chainId), position);
  }

  /**
   * {@inheritDoc IOpportunitiesPrepare.maxWithdrawCollateral}
   **/
  public async maxWithdrawCollateral(
    position: PositionInput,
    token: Address,
    targetHF?: bigint,
  ): Promise<DataResponse<bigint>> {
    return this.queryChain({
      network: position.chainId,
      run: async sdk =>
        service(sdk).maxWithdrawCollateral({
          creditAccount: await slice(sdk, position.creditAccount),
          sdk,
          token,
          targetHF,
        }),
    });
  }

  /**
   * Shared path of the two flows that sell a position asset, and therefore have
   * two routes to offer: one account read, one intent, both routes quoted.
   **/
  async #startRoutes(
    position: PositionInput,
    options: PrepareOptions,
    intent: DelayableIntent,
  ): Promise<DataResponse<StrategyRoutesPrepare>> {
    return this.queryChain({
      network: position.chainId,
      run: async sdk =>
        service(sdk).intentRoutes({
          intent,
          creditAccount: await slice(sdk, position.creditAccount),
          sdk,
          slippage: options.slippage,
          quotaReserve: options.quotaReserve,
        }),
    });
  }

  /**
   * Shared path of the five flows that act on an existing account: read the
   * account, then run the intent through the engine.
   **/
  async #startIntent(
    position: PositionInput,
    options: PrepareOptions,
    intent: StartIntent,
  ): Promise<DataResponse<StrategyPrepare>> {
    return this.queryChain({
      network: position.chainId,
      run: async sdk => {
        const creditAccount = await slice(sdk, position.creditAccount);

        return service(sdk).startIntent({
          intent,
          creditAccount,
          sdk,
          slippage: options.slippage,
          quotaReserve: options.quotaReserve,
        });
      },
    });
  }
}

function service(sdk: OnchainSDK): CreditAccountOperationsService {
  return new CreditAccountOperationsService(sdk);
}

function slice(
  sdk: OnchainSDK,
  creditAccount: Address,
): Promise<CreditAccountSlice> {
  return fetchCreditAccountSlice(sdk, creditAccount);
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
      isDelayed: false,
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
): LpPrepare {
  return refuse("unsupportedTokenPair", {
    from: toToken(sdk, from),
    to: to === undefined ? undefined : toToken(sdk, to),
  });
}

/**
 * Picks the route the operation takes out of `tokenIn`, as a value rather than
 * an exception: an unroutable or ambiguous pair is a request the caller can
 * fix, so it belongs in the `ok: false` half alongside the strategy refusals.
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
