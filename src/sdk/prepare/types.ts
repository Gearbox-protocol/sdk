import type { Address } from "viem";
import type {
  Bps,
  DataResponse,
  PoolOpportunityKey,
  PositionCollateral,
  StrategyOpportunityKey,
  StrategyPosition,
  StrategyPositionKey,
} from "../../model/index.js";
import type {
  AccountCalculatorOperation,
  Asset,
  ClaimableWithdrawal,
  DelayedStart,
  LeverageBand,
  MultiCall,
  OpenStrategyPreview,
  OperationState,
  PoolSimulation,
  PreviewRefusal,
  ResumableIntent,
  RouteRefusals,
} from "../../onchain/index.js";

export type {
  LeverageBand,
  OperationState,
  PathLossRate,
} from "../../onchain/index.js";
/**
 * The vocabulary the failure half of everything below is written in.
 *
 * Published here because these are the types of the fields on the results this
 * module hands out: a caller switching on `reason` or reading `detail` should
 * not have to reach into `@gearbox-protocol/sdk/onchain` for the names to do
 * it with. They are defined in the intents engine and have no second home
 * here. `reason` is the discriminant — narrowing it narrows `detail` and
 * settles whether there is a `preview` — so no runtime guard is needed to
 * read one of these.
 **/
export * from "../../onchain/validation/refusal.js";

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
  | PreviewRefusal;

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
  | PreviewRefusal;

/**
 * What the leading half of a delayed operation would yield: the request
 * transaction, plus what it recorded for the tail and where that tail leads.
 *
 * Shaped like {@link StrategySimulate} with one field more, so the instant and
 * the delayed route of the same request are compared side by side — and they
 * are meant to be compared on the same footing, so `preview` is the end of the
 * operation in both, not the end of the transaction.
 **/
export type DelayedStrategySimulate =
  | {
      ok: true;
      /**
       * {@inheritDoc StrategySimulate.operations}
       **/
      operations: AccountCalculatorOperation[];
      /**
       * Where the operation ends: the account once the redemption has matured,
       * been claimed and the tail has run — the same place the instant route
       * reaches in one transaction, which is what makes the two comparable.
       *
       * The tail's half of it is an estimate priced by the oracle: the funds it
       * trades do not exist yet, so no route can be quoted for them. The state
       * the request alone lands in — source spent, withdrawal position in its
       * place, debt untouched — is `delayed.afterRequest`.
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
  | PreviewRefusal;

/**
 * What one of the two flows that sell a position asset —
 * {@link IOpportunitiesPrepare.withdrawStrategy} and
 * {@link IOpportunitiesPrepare.adjustLeverage} — would yield each way it can be
 * served.
 *
 * Whether the account can sell that asset on the router, redeem it through its
 * issuer, or both, is not something the caller can know up front, so both routes
 * are quoted from one request. A route the account cannot take is `undefined`
 * with its refusal in `refused`, which is what lets a form offer exactly the
 * routes that exist; `ok: false` means neither does.
 **/
export type StrategyRoutesSimulate =
  | {
      ok: true;
      /**
       * The router route: one transaction, settled on the spot. `undefined`
       * when the asset cannot be sold, see `refused.instant`.
       **/
      instant: Extract<StrategySimulate, { ok: true }> | undefined;
      /**
       * The request half of the redemption route, which
       * {@link IOpportunitiesPrepare.finalize} completes once it matures.
       * `undefined` when the route does not exist — no redemption venue for the
       * asset, or a request that settles at once anyway — see `refused.delayed`.
       **/
      delayed: Extract<DelayedStrategySimulate, { ok: true }> | undefined;
      /**
       * Why a missing route was refused, see {@link RouteRefusals}.
       **/
      refused: RouteRefusals;
    }
  /**
   * The instant route's refusal, which is the one a caller can usually act on;
   * the delayed route's when the instant one did not even get that far.
   **/
  | (PreviewRefusal & {
      /**
       * {@inheritDoc StrategyRoutesSimulate.refused}
       **/
      refused: RouteRefusals;
    });

/**
 * What opening a new leveraged position would yield.
 *
 * The only simulation that reports both an expected and a floor branch: opening
 * takes both from a single pathfinder call, and `openCA` consumes both.
 **/
export type OpenStrategySimulate =
  | { ok: true; preview: OpenStrategyPreview }
  | PreviewRefusal;

/**
 * Shared knobs. Both default to the SDK's own defaults when omitted.
 **/
export interface PrepareOptions {
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

export interface DepositStrategyParams extends PrepareOptions {
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

export interface WithdrawStrategyParams extends PrepareOptions {
  /**
   * Amount the wallet receives, denominated in `tokenOut`. `MAX_UINT256`, or
   * anything at or above the account's net value, turns the flow into an exit,
   * see {@link IOpportunitiesPrepare.withdrawStrategy}.
   **/
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

export interface RepayStrategyParams extends PrepareOptions {
  /**
   * Funding token: the market underlying, which needs no conversion and is
   * repaid where it lands, or — on an RWA market — the unwrapped asset behind
   * it (USDC rather than dcUSDC), which this flow wraps on the way in.
   **/
  token: Address;
  /**
   * Amount taken from the wallet. Anything above the outstanding debt settles
   * it in full and stays on the account as collateral, so a caller clearing the
   * account can add a buffer for the interest that accrues before the
   * transaction lands, see {@link IOpportunitiesPrepare.maxRepay}.
   * `MAX_UINT256` settles the debt and sizes that buffer itself.
   **/
  amount: bigint;
  /** Native value to attach when paying a wrapped-native market in the coin. */
  value?: bigint;
}

export interface AdjustLeverageParams extends PrepareOptions {
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

export interface AddCollateralParams extends PrepareOptions {
  /** Position token to deposit; nothing else is accepted. */
  token: Address;
  amount: bigint;
  /** Native value to attach when paying a wrapped-native market in the coin. */
  value?: bigint;
}

export interface WithdrawCollateralParams extends PrepareOptions {
  /** Token to move out; must already sit on the account. */
  token: Address;
  amount: bigint;
  /** Wallet receiving the tokens. */
  to: Address;
}

export interface OpenStrategyParams extends PrepareOptions {
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
   * On deposit: amount of `tokenIn`. On withdraw: amount of `tokenOut`, which
   * the pool's `withdraw` takes as is and prices in shares itself.
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

/**
 * Same shape as {@link LpParams}, but {@link IOpportunitiesPrepare.redeem}
 * treats `amount` as the pool shares to burn rather than the underlying to
 * receive.
 **/
export interface LpRedeemParams {
  /**
   * Amount of `tokenIn` — pool shares, or the zapper token that wraps them —
   * to redeem.
   **/
  amount: bigint;
  wallet: Address;
  tokenIn?: Address;
  tokenOut?: Address;
}

export interface FinalizeParams extends PrepareOptions {
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
 * Simulations of everything a wallet can do to a pool or a credit account.
 *
 * On-chain only: every method reads live state and, for strategies, asks the
 * pathfinder for real swap paths. Nothing is executed and nothing is signed —
 * the result is the numbers plus the calldata that would produce them.
 *
 * Not to be confused with `src/preview/simulate`, which goes the other way: it
 * takes calldata that already exists and reports what it would do.
 **/
export interface IOpportunitiesPrepare {
  /**
   * Depositing into a pool: underlying in, shares out.
   *
   * Synchronous, unlike every strategy simulation below: the answer is the
   * pool's share rate applied to the amount, and that rate is already loaded.
   **/
  deposit(pool: PoolInput, params: LpParams): LpSimulate;

  /**
   * Taking underlying out of a pool: `amount` is the `tokenOut` the wallet
   * wants back, and the pool burns whatever shares that costs.
   *
   * The LP counterpart of {@link withdrawStrategy} / {@link withdrawCollateral},
   * which act on credit accounts.
   **/
  withdraw(pool: PoolInput, params: LpParams): LpSimulate;

  /**
   * Redeeming pool shares: `amount` is the `tokenIn` the wallet parts with,
   * and the preview is the underlying it converts to.
   **/
  redeem(pool: PoolInput, params: LpRedeemParams): LpSimulate;

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
   * Answers with both routes the withdrawal can take — sold through the router
   * now, or redeemed through the source's issuer and finished days later — since
   * the source token decides which of them exist, see
   * {@link StrategyRoutesSimulate}.
   *
   * `MAX_UINT256` — or any amount at or above the account's net value — is an
   * exit instead: the quotas are dropped, the position is sold whole in one
   * many-to-one route, the debt is settled in full and every balance left goes
   * to `to`. `tokenOut` is ignored, since the proceeds are already the
   * underlying (unwrapped on an RWA market). The account stays open with
   * nothing on it.
   *
   * An exit has both routes as well, which is what lets an account whose
   * position only redeems through its issuer leave at all: the delayed route
   * redeems `sourceToken` whole and records the exit, and {@link finalize}
   * rebuilds it against the account the claim finds — the debt as it stands by
   * then, whatever else is on the account, everything sold in one route.
   *
   * @see withdrawCollateral to move an asset out without touching debt, which
   * raises leverage instead.
   **/
  withdrawStrategy(
    position: PositionInput,
    params: WithdrawStrategyParams,
  ): Promise<DataResponse<StrategyRoutesSimulate>>;

  /**
   * Largest partial withdrawal {@link withdrawStrategy} accepts, in underlying
   * units: the amount whose proportional repayment leaves the debt at the
   * credit manager's `minDebt`. Between this and the account's net value the
   * flow refuses — the leftover loan would sit below `minDebt` — and at the net
   * value it turns into an exit.
   *
   * Taking everything out needs none of this arithmetic: send `MAX_UINT256` to
   * {@link withdrawStrategy} and the exit is what runs.
   **/
  maxWithdraw(position: PositionInput): Promise<DataResponse<bigint>>;

  /**
   * Paying debt down with funds from the wallet: collateral stays where it is,
   * so net value grows by what was repaid, leverage falls and the health factor
   * rises. The flow to reach for when a position is close to liquidation.
   *
   * A partial repayment is two calls and nothing else: the funding lands and
   * the debt shrinks, quotas untouched — they still back a loan.
   *
   * A repayment that covers the whole debt clears the account's quotas with it,
   * which the facade requires of a loan going to zero, and asks for the full
   * outstanding amount, so nothing is left owing because interest moved between
   * this simulation and the transaction. `MAX_UINT256` is how to ask for that
   * settlement without naming a figure: the wallet is charged the debt plus a
   * 10bps margin for the interest still to come, and whatever the facade does
   * not take stays on the account.
   **/
  repayStrategy(
    position: PositionInput,
    params: RepayStrategyParams,
  ): Promise<DataResponse<StrategySimulate>>;

  /**
   * Debt {@link repayStrategy} would have to cover to clear the account, in
   * underlying units: principal, interest and fees as of this read. Interest
   * keeps accruing, so a wallet meaning to settle sends this with a buffer.
   **/
  maxRepay(position: PositionInput): Promise<DataResponse<bigint>>;

  /**
   * Retargeting leverage at fixed collateral: debt moves, own funds do not.
   *
   * Answers with both routes, like {@link withdrawStrategy}, since deleveraging
   * sells the position token and may only be able to redeem it. Raising leverage
   * buys instead, so there the delayed route is always absent with
   * `refused.delayed: "noDelayedRoute"`.
   **/
  adjustLeverage(
    position: PositionInput,
    params: AdjustLeverageParams,
  ): Promise<DataResponse<StrategyRoutesSimulate>>;

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
   * The leverages a deposit of a given size can reach in this market: the
   * range a leverage slider should mark as available.
   *
   * `maxLeverage` on the opportunity is the ceiling the liquidation threshold
   * allows, and it is the same number whatever the deposit. What a given
   * deposit reaches is decided by the debt it implies —
   * `debt = netValue x (leverage - 1)` — and by the band the market puts that
   * debt in.
   *
   * Synchronous, unlike the ceilings above it: those read the account from the
   * chain, this one only needs loaded market state, so a form can ask on every
   * keystroke. Hand over the collateral as it stands and the SDK values it —
   * opening takes the tokens being deposited, adjusting the position's own net
   * value in the underlying.
   *
   * Nothing at all when the market has no band to offer: a deposit too small
   * to carry `minDebt` at any leverage the threshold allows, or a manager with
   * no borrowing room left. Not the same answer as "every leverage works", and
   * a caller must not mark a range for it.
   **/
  leverageBand(
    strategy: StrategyInput,
    collateral: readonly Asset[],
    targetHF?: Bps,
  ): LeverageBand | undefined;

  /**
   * The collaterals an account can actually take out, most valuable first —
   * what a withdraw-collateral picker offers.
   *
   * `StrategyPosition.collaterals` is everything the account holds, in the
   * order the manager keeps its tokens. Phantoms are in there: the position
   * reports one as itself and puts the asset it redeems into under
   * `withdrawals`, and {@link withdrawCollateral} cannot move a balance that
   * is not transferable. Balances below dust are already gone — the position
   * drops them as it is built.
   *
   * Synchronous, like {@link leverageBand}: it reads loaded token metadata and
   * the position it was handed, so a form can ask on every render. Nothing is
   * quoted here — which of these the router can sell is a different question,
   * and the answer to it is a simulation.
   **/
  withdrawableCollaterals(position: StrategyPosition): PositionCollateral[];

  /**
   * Largest amount of one collateral {@link withdrawCollateral} can move out
   * while the account stays safely collateralised, in the token's units: the
   * remaining assets are weighed by their liquidation thresholds (quoted ones
   * capped by their quotas) and the target keeps covering what the debt still
   * requires. Zero debt frees the whole balance — the ceiling a
   * withdraw-collateral form should offer.
   *
   * `targetHF` names the health factor to leave the account at, in basis
   * points; omitted, the SDK holds it to the bar a form would.
   **/
  maxWithdrawCollateral(
    position: PositionInput,
    token: Address,
    targetHF?: bigint,
  ): Promise<DataResponse<bigint>>;

  /**
   * The tail of a delayed route: claim the matured withdrawal, then whatever the
   * operation that requested it still owes — repaying debt and paying the wallet
   * out for a withdrawal, repaying alone for a deleveraging, selling the rest of
   * the account and settling the loan for an exit, nothing beyond the claim for
   * the rest.
   *
   * The route is requested by {@link withdrawStrategy} or
   * {@link adjustLeverage}, whose `delayed` branch is the transaction that
   * starts it; days later the redemption matures and this finishes it. Nothing
   * has to be kept on the client in between: the request writes the operation
   * into the withdrawal's `extraData`, and reading the claimable decodes it
   * back.
   *
   * Answers like the instant flows, so both halves are consumed the same way.
   * Reports `noRecordedIntent` when the claim names no operation to resume.
   **/
  finalize(
    position: PositionInput,
    params: FinalizeParams,
  ): Promise<DataResponse<StrategySimulate>>;
}
