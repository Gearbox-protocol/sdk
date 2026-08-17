import type { Address } from "viem";
import type { ChainId } from "../../model/index.js";
import type {
  CreditAccountSlice,
  MultichainSDK,
  OnchainSDK,
  StartIntent,
} from "../../sdk/index.js";
import {
  CreditAccountOperationsService,
  fetchCreditAccountSlice,
} from "../../sdk/index.js";
import type { ReadResult } from "../types.js";
import type {
  AddCollateralParams,
  AdjustLeverageParams,
  DepositStrategyParams,
  LpParams,
  LpSimulate,
  OpenStrategyParams,
  OpenStrategySimulate,
  OpportunitiesSimulate,
  PoolInput,
  PositionInput,
  SimulateOptions,
  StrategyInput,
  StrategySimulate,
  WithdrawCollateralParams,
  WithdrawStrategyParams,
} from "./types.js";

/**
 * How a simulation reaches the chain: the namespace's own on-chain read, which
 * resolves the chain, captures failures and wraps the answer in a
 * {@link ReadResult}.
 **/
export type RunOnchain = <T>(
  action: string,
  chainId: ChainId,
  fromChain: (sdk: MultichainSDK) => Promise<T>,
) => Promise<ReadResult<T>>;

/**
 * The chain's SDK, resolved on the spot.
 *
 * The LP simulations need it synchronously, because they only do arithmetic on
 * loaded state and have nothing to await.
 **/
export type ChainOf = (chainId: ChainId) => OnchainSDK;

/**
 * {@inheritDoc OpportunitiesSimulate}
 *
 * Holds no state: it owns the mapping from the public, read-model-shaped request
 * to the engine's intent, and nothing else. All protocol knowledge stays in
 * `CreditAccountOperationsService` and `PoolService`.
 **/
export class SimulateApi implements OpportunitiesSimulate {
  readonly #run: RunOnchain;
  readonly #chainOf: ChainOf;

  constructor(run: RunOnchain, chainOf: ChainOf) {
    this.#run = run;
    this.#chainOf = chainOf;
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.deposit}
   **/
  public deposit(pool: PoolInput, params: LpParams): LpSimulate {
    const sdk = this.#chainOf(pool.chainId);
    const { pools } = sdk;
    const tokenIn = params.tokenIn ?? pools.getDepositTokensIn(pool.pool)[0];
    const tokenOut = resolveTokenOut(params.tokenOut, () =>
      pools.getDepositTokensOut(pool.pool, tokenIn),
    );
    if (!tokenOut) {
      return { ok: false, reason: "unsupportedTokenPair" };
    }

    const preview = pools.simulateDeposit({
      pool: pool.pool,
      amount: params.amount,
      tokenIn,
      tokenOut,
    });
    const call = pools.addLiquidity({
      collateral: preview.tokenIn,
      pool: pool.pool,
      wallet: params.wallet,
      meta: pools.getDepositMetadata(pool.pool, tokenIn, tokenOut),
    });

    return { ok: true, operations: [], preview, calls: call?.calls ?? [] };
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.withdraw}
   **/
  public withdraw(pool: PoolInput, params: LpParams): LpSimulate {
    const sdk = this.#chainOf(pool.chainId);
    const { pools } = sdk;
    // Withdrawals are paid in shares, and the share token *is* the pool.
    const tokenIn = params.tokenIn ?? pool.pool;
    const tokenOut = resolveTokenOut(params.tokenOut, () =>
      pools.getWithdrawalTokensOut(pool.pool, tokenIn),
    );
    if (!tokenOut) {
      return { ok: false, reason: "unsupportedTokenPair" };
    }

    const preview = pools.simulateWithdraw({
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
    });

    return { ok: true, operations: [], preview, calls };
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.openNewStrategy}
   **/
  public async openNewStrategy(
    strategy: StrategyInput,
    params: OpenStrategyParams,
  ): Promise<ReadResult<OpenStrategySimulate>> {
    return this.#run(
      "simulate opening a strategy",
      strategy.chainId,
      async multichain => {
        const sdk = multichain.chain(strategy.chainId);
        return service(sdk).openStrategyIntent({
          sdk,
          creditManager: strategy.creditManager,
          collateral: params.collateral,
          targetToken: params.targetToken ?? strategy.targetCollateral,
          leverage: params.leverage,
          leftoverBalances: params.leftoverBalances,
          slippage: params.slippage,
          quotaReserve: params.quotaReserve,
        });
      },
    );
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.depositStrategy}
   **/
  public async depositStrategy(
    position: PositionInput,
    params: DepositStrategyParams,
  ): Promise<ReadResult<StrategySimulate>> {
    return this.#startIntent("simulate strategy deposit", position, params, {
      type: "DEPOSIT",
      token: params.token,
      amount: params.amount,
      value: params.value,
      positionToken: params.positionToken,
      targetLeverage: params.targetLeverage,
    });
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.withdrawStrategy}
   **/
  public async withdrawStrategy(
    position: PositionInput,
    params: WithdrawStrategyParams,
  ): Promise<ReadResult<StrategySimulate>> {
    return this.#startIntent("simulate strategy withdrawal", position, params, {
      type: "WITHDRAW",
      amount: params.amount,
      to: params.to,
      tokenOut: params.tokenOut,
      sourceToken: params.sourceToken,
    });
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.adjustLeverage}
   **/
  public async adjustLeverage(
    position: PositionInput,
    params: AdjustLeverageParams,
  ): Promise<ReadResult<StrategySimulate>> {
    return this.#startIntent("simulate leverage adjustment", position, params, {
      type: "ADJUST_LEVERAGE",
      targetLeverage: params.targetLeverage,
      token: params.token,
    });
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.addCollateral}
   **/
  public async addCollateral(
    position: PositionInput,
    params: AddCollateralParams,
  ): Promise<ReadResult<StrategySimulate>> {
    return this.#startIntent("simulate adding collateral", position, params, {
      type: "ADD_COLLATERAL",
      token: params.token,
      amount: params.amount,
      value: params.value,
    });
  }

  /**
   * {@inheritDoc OpportunitiesSimulate.withdrawCollateral}
   **/
  public async withdrawCollateral(
    position: PositionInput,
    params: WithdrawCollateralParams,
  ): Promise<ReadResult<StrategySimulate>> {
    return this.#startIntent(
      "simulate withdrawing collateral",
      position,
      params,
      {
        type: "WITHDRAW_ASSET",
        token: params.token,
        amount: params.amount,
        to: params.to,
      },
    );
  }

  /**
   * Shared path of the five flows that act on an existing account: read the
   * account, then run the intent through the engine.
   **/
  async #startIntent(
    action: string,
    position: PositionInput,
    options: SimulateOptions,
    intent: StartIntent,
  ): Promise<ReadResult<StrategySimulate>> {
    return this.#run(action, position.chainId, async multichain => {
      const sdk = multichain.chain(position.chainId);
      const creditAccount = await slice(sdk, position.creditAccount);

      return service(sdk).startIntent({
        intent,
        creditAccount,
        sdk,
        slippage: options.slippage,
        quotaReserve: options.quotaReserve,
      });
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
 * Resolves `tokenOut` the way the pool service would, but as a value rather
 * than an exception: an unroutable or ambiguous pair is a request the caller
 * can fix, so it belongs in the `ok: false` half alongside the strategy
 * refusals.
 **/
function resolveTokenOut(
  requested: Address | undefined,
  routes: () => Address[],
): Address | undefined {
  if (requested) {
    return requested;
  }
  const options = routes();
  return options.length === 1 ? options[0] : undefined;
}
