import type { Address } from "viem";
import type {
  DataResponse,
  PoolOpportunityKey,
  StrategyOpportunityKey,
  StrategyPositionKey,
} from "../../model/index.js";
import type {
  AccountCalculatorOperation,
  Asset,
  ClaimableWithdrawal,
  DelayedStart,
  MultiCall,
  OpenStrategyPreview,
  OperationState,
  PoolSimulation,
  PreviewErrorReason,
  ResumableIntent,
} from "../../sdk/index.js";

/**
 * What a pool deposit or withdrawal would yield.
 *
 * Shaped like {@link StrategySimulate} so both kinds of simulation are consumed
 * the same way, with the pool's own numbers as the preview: the ERC-4626
 * conversion applied to the amount, at the rate of the block the market was
 * loaded at.
 **/
export type LpSimulate =
  | {
      ok: true;
      /**
       * Always empty: a pool operation is a single transaction, so there is no
       * chain of steps to show. Present so callers can treat both simulations
       * alike.
       **/
      operations: [];
      /**
       * What the wallet parts with and what it receives, plus the zapper the
       * transaction goes through when one is involved.
       **/
      preview: PoolSimulation;
      /**
       * The transaction implementing the operation: exactly one, since a pool
       * operation is a single call on the pool or on its zapper.
       **/
      calls: MultiCall[];
    }
  | { ok: false; reason: PreviewErrorReason };

/**
 * What an operation on an existing credit account would yield.
 *
 * `ok: false` means the request itself is not viable — not that a call failed —
 * so the reason is a value rather than an exception: too much leverage, too
 * little of the source token, a token the flow does not accept.
 **/
export type StrategySimulate =
  | {
      ok: true;
      /**
       * The logical steps, each carrying the amounts it was computed from.
       * Useful for showing the user what will happen, and for pinning behaviour
       * in tests.
       **/
      operations: AccountCalculatorOperation[];
      /**
       * Projected account state once the operations execute: TVL, debt,
       * balances and quotas.
       **/
      preview: OperationState;
      /**
       * Credit-facade multicall implementing the operations, ready to be sent
       * through `sdk.accounts`.
       **/
      calls: MultiCall[];
    }
  | { ok: false; reason: PreviewErrorReason };

/**
 * What the leading half of a delayed operation would yield: the request
 * transaction, plus what it recorded for the tail.
 *
 * Shaped like {@link StrategySimulate} with one field more, so the instant and
 * the delayed route of the same request are compared side by side.
 **/
export type DelayedStrategySimulate =
  | {
      ok: true;
      /**
       * {@inheritDoc StrategySimulate.operations}
       **/
      operations: AccountCalculatorOperation[];
      /**
       * State once the request executes: the source token is gone and the
       * withdrawal position stands in its place, with debt untouched — the
       * repayment belongs to the tail.
       **/
      preview: OperationState;
      /**
       * {@inheritDoc StrategySimulate.calls}
       **/
      calls: MultiCall[];
      /**
       * When the tail can be run, and what the request recorded for it, see
       * {@link DelayedStart}.
       **/
      delayed: DelayedStart;
    }
  | { ok: false; reason: PreviewErrorReason };

/**
 * What opening a new leveraged position would yield.
 *
 * The only simulation that reports both an expected and a floor branch: opening
 * takes both from a single pathfinder call, and `openCA` consumes both.
 **/
export type OpenStrategySimulate =
  | { ok: true; preview: OpenStrategyPreview }
  | { ok: false; reason: PreviewErrorReason };

/**
 * Shared knobs. Both default to the SDK's own defaults when omitted.
 **/
export interface SimulateOptions {
  /** Router slippage in PERCENTAGE_FORMAT (100% = 10_000). */
  slippage?: number;
  /**
   * Extra quota headroom in PERCENTAGE_FORMAT, to survive price drift between
   * the simulation and execution.
   **/
  quotaReserve?: number;
}

/**
 * Position to simulate against. A `StrategyPosition` from
 * `sdk.positions.list()` satisfies this, as does a bare key.
 **/
export type PositionInput = StrategyPositionKey;

/**
 * Pool to simulate against. A `PoolOpportunity` from
 * `sdk.opportunities.list()` satisfies this, as does a bare key.
 **/
export type PoolInput = PoolOpportunityKey;

/**
 * Market to open a new position in. A `StrategyOpportunity` from
 * `sdk.opportunities.list()` satisfies this, as does a bare key.
 **/
export type StrategyInput = StrategyOpportunityKey;

export interface DepositStrategyParams extends SimulateOptions {
  /**
   * Collateral to add: the market underlying, or its unwrapped asset on an RWA
   * market (USDC rather than dcUSDC).
   **/
  token: Address;
  amount: bigint;
  /** Native value to attach when paying a wrapped-native market in the coin. */
  value?: bigint;
  /**
   * Token the position ends up in. Defaults to the account's most valuable
   * non-phantom, non-underlying balance.
   **/
  positionToken?: Address;
  /**
   * Target total leverage scaled by `LEVERAGE_DECIMALS` (300n = 3x). Omit to
   * keep the account's current leverage.
   **/
  targetLeverage?: bigint;
}

export interface WithdrawStrategyParams extends SimulateOptions {
  /** Amount the wallet receives, denominated in `tokenOut`. */
  amount: bigint;
  /** Wallet receiving the payout. */
  to: Address;
  /**
   * Token the wallet receives. Defaults to the market underlying, force-unwrapped
   * to the RWA asset on an RWA market.
   **/
  tokenOut?: Address;
  /**
   * Token liquidated to fund the withdrawal. Defaults to the account's most
   * valuable non-phantom balance.
   **/
  sourceToken?: Address;
}

export interface AdjustLeverageParams extends SimulateOptions {
  /**
   * Target total leverage scaled by `LEVERAGE_DECIMALS` (300n = 3x); 100n means
   * no debt.
   **/
  targetLeverage: bigint;
  /**
   * Position token to buy into or sell out of. Defaults to the account's most
   * valuable non-phantom, non-underlying balance.
   **/
  token?: Address;
}

export interface AddCollateralParams extends SimulateOptions {
  /** Position token to deposit; nothing else is accepted. */
  token: Address;
  amount: bigint;
  /** Native value to attach when paying a wrapped-native market in the coin. */
  value?: bigint;
}

export interface WithdrawCollateralParams extends SimulateOptions {
  /** Token to move out; must already sit on the account. */
  token: Address;
  amount: bigint;
  /** Wallet receiving the tokens. */
  to: Address;
}

export interface OpenStrategyParams extends SimulateOptions {
  /** Collateral coming from the wallet, in their own tokens. */
  collateral: Asset[];
  /**
   * Target total leverage scaled by `LEVERAGE_DECIMALS` (300n = 3x).
   **/
  leverage: bigint;
  /**
   * Token the position ends up in. Defaults to the opportunity's target
   * collateral.
   **/
  targetToken?: Address;
  /** Collateral to leave unswapped; everything else is routed into the target. */
  leftoverBalances?: Asset[];
}

export interface LpParams {
  /**
   * On deposit: amount of `tokenIn`. On withdrawal: amount of `tokenOut`;
   * converted down to the shares `redeem` burns before the call is built.
   **/
  amount: bigint;
  /**
   * Wallet funding the deposit or receiving the withdrawal. Required because it
   * is baked into the calldata.
   **/
  wallet: Address;
  /**
   * Token the user parts with. Defaults to the pool underlying on deposit and to
   * the pool shares on withdrawal.
   **/
  tokenIn?: Address;
  /**
   * Token the user receives. Defaults to the only route available for `tokenIn`;
   * required when the pool offers several, otherwise the simulation reports
   * `unsupportedTokenPair`.
   **/
  tokenOut?: Address;
}

export interface FinishDelayedParams extends SimulateOptions {
  /**
   * The matured withdrawal to claim, from
   * `sdk.onchain.chain(chainId).withdrawalCompressor.getCurrentWithdrawals()`.
   **/
  claimable: ClaimableWithdrawal;
  /**
   * The operation to resume. Defaults to the one the request recorded in the
   * withdrawal's `extraData`, which is what {@link ClaimableWithdrawal.intent}
   * decodes; pass it explicitly when the compressor is too old to report it.
   **/
  intent?: ResumableIntent;
}

/**
 * The delayed route of the two operations that can take it: a source that only
 * redeems through its issuer — a Securitize dsToken, a Mellow share — instead of
 * through the router.
 *
 * Two transactions rather than one: the request, then the tail once the
 * redemption matures, which is days later. In between, nothing has to be kept on
 * the client — the request writes the operation into the withdrawal's
 * `extraData`, and reading the claimable decodes it back.
 **/
export interface DelayedSimulate {
  /**
   * The delayed counterpart of {@link OpportunitiesSimulate.withdrawStrategy}.
   *
   * Reports `noDelayedRoute` when the account has no redemption venue for the
   * source at all, so a caller offering both routes asks for both previews and
   * shows whichever answered.
   **/
  withdrawStrategy(
    position: PositionInput,
    params: WithdrawStrategyParams,
  ): Promise<DataResponse<DelayedStrategySimulate>>;

  /**
   * The delayed counterpart of {@link OpportunitiesSimulate.adjustLeverage},
   * which only deleveraging reaches: raising leverage buys the position token
   * and never redeems it.
   **/
  adjustLeverage(
    position: PositionInput,
    params: AdjustLeverageParams,
  ): Promise<DataResponse<DelayedStrategySimulate>>;

  /**
   * The tail: claim the matured withdrawal, then whatever the recorded
   * operation still owes — repaying debt and paying the wallet out for a
   * withdrawal, repaying alone for a deleveraging, nothing beyond the claim for
   * the rest.
   *
   * Answers like the instant flows, so both halves are consumed the same way.
   * Reports `noRecordedIntent` when the claim names no operation to resume.
   **/
  finish(
    position: PositionInput,
    params: FinishDelayedParams,
  ): Promise<DataResponse<StrategySimulate>>;
}

/**
 * Simulations of everything a wallet can do to a pool or a credit account.
 *
 * On-chain only: every method reads live state and, for strategies, asks the
 * pathfinder for real swap paths. Nothing is executed and nothing is signed —
 * the result is the numbers plus the calldata that would produce them.
 *
 * Not to be confused with `src/preview/simulate`, which goes the other way: it
 * takes calldata that already exists and reports what it would do.
 **/
export interface OpportunitiesSimulate {
  /**
   * Depositing into a pool: underlying in, shares out.
   *
   * Synchronous, unlike every strategy simulation below: the answer is the
   * pool's share rate applied to the amount, and that rate is already loaded.
   **/
  deposit(pool: PoolInput, params: LpParams): LpSimulate;

  /**
   * Redeeming pool shares: `amount` is the `tokenOut` the wallet wants back,
   * converted down to the shares the redeem burns.
   *
   * The LP counterpart of {@link withdrawStrategy} / {@link withdrawCollateral},
   * which act on credit accounts.
   **/
  withdraw(pool: PoolInput, params: LpParams): LpSimulate;

  /**
   * Opening a leveraged position from wallet collateral.
   *
   * The one flow with no account yet, so the result carries no operation list —
   * it feeds `sdk.accounts.openCA` instead.
   **/
  openNewStrategy(
    strategy: StrategyInput,
    params: OpenStrategyParams,
  ): Promise<DataResponse<OpenStrategySimulate>>;

  /**
   * Growing a position: collateral in, debt drawn on top, both converted into
   * the position token.
   *
   * Leverage stays put unless `targetLeverage` asks for more.
   **/
  depositStrategy(
    position: PositionInput,
    params: DepositStrategyParams,
  ): Promise<DataResponse<StrategySimulate>>;

  /**
   * Shrinking a position: part of its net value goes to the wallet and debt is
   * repaid in the same proportion, so leverage is unchanged.
   *
   * @see withdrawCollateral to move an asset out without touching debt, which
   * raises leverage instead.
   **/
  withdrawStrategy(
    position: PositionInput,
    params: WithdrawStrategyParams,
  ): Promise<DataResponse<StrategySimulate>>;

  /**
   * Largest partial withdrawal {@link withdrawStrategy} accepts, in underlying
   * units: the amount whose proportional repayment leaves the debt at the
   * credit manager's `minDebt`. Taking everything out is closing the position,
   * which is a different flow.
   **/
  maxWithdraw(position: PositionInput): Promise<DataResponse<bigint>>;

  /**
   * Retargeting leverage at fixed collateral: debt moves, own funds do not.
   **/
  adjustLeverage(
    position: PositionInput,
    params: AdjustLeverageParams,
  ): Promise<DataResponse<StrategySimulate>>;

  /**
   * Putting the position token onto the account at fixed debt, which lowers
   * leverage and raises the health factor.
   **/
  addCollateral(
    position: PositionInput,
    params: AddCollateralParams,
  ): Promise<DataResponse<StrategySimulate>>;

  /**
   * Moving one asset that already sits on the account out to the wallet, at
   * fixed debt — so TVL falls and leverage rises.
   *
   * @see withdrawStrategy for the deleveraging withdrawal, which repays debt in
   * proportion and leaves leverage unchanged.
   **/
  withdrawCollateral(
    position: PositionInput,
    params: WithdrawCollateralParams,
  ): Promise<DataResponse<StrategySimulate>>;

  /**
   * The same requests routed through a delayed redemption instead of the
   * router, and the tail that finishes them, see {@link DelayedSimulate}.
   **/
  readonly delayed: DelayedSimulate;
}
