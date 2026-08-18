import type { Address, Hex } from "viem";
import type { StrategyPosition } from "../../model/index.js";
import type {
  Asset,
  Construct,
  CreditAccountData,
  CreditAccountTokensSlice,
  PermitResult,
} from "../base/index.js";
import type {
  CreditSuite,
  PartialLiquidationParams,
  PrepareUpdateQuotasProps,
  PriceUpdate,
  RWAOperationArgs,
} from "../market/index.js";
import type {
  GetOpenAccountRequirementsProps,
  RWAOpenAccountRequirements,
} from "../market/rwa/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { RouterCASlice, RouterCloseResult } from "../router/index.js";
import type { MultiCall, RawTx } from "../types/index.js";
import type { AccountBotsService } from "./bots/index.js";
import type {
  GetCreditAccountsOptions,
  ListStrategyPositionsProps,
} from "./credit-account-compressor/index.js";
import type {
  ClaimableWithdrawal,
  DelayedIntent,
  PendingWithdrawal,
  RequestableWithdrawal,
} from "./withdrawal-compressor/index.js";

/**
 * Result of closing or liquidating a credit account, including the router's optimal close path.
 **/
export interface CloseCreditAccountResult extends CreditAccountOperationResult {
  /**
   * Router result describing the swap path used to convert account tokens into the underlying.
   **/
  routerCloseResult: RouterCloseResult;
}

/**
 * Result of a full liquidation, extending the close result with optional loss policy data.
 **/
export interface FullyLiquidateResult extends CloseCreditAccountResult {
  /**
   * Encoded loss policy data submitted with the liquidation, if a loss policy was applied.
   **/
  lossPolicyData?: Hex;
}

/**
 * Result of a credit account operation, containing everything needed to execute the transaction.
 **/
export interface CreditAccountOperationResult {
  /**
   * Raw transaction data ready to be signed and submitted.
   **/
  tx: RawTx;
  /**
   * Ordered multicall entries that make up the operation.
   **/
  calls: Array<MultiCall>;
  /**
   * Credit facade contract used for the operation.
   **/
  creditFacade: CreditSuite["creditFacade"];
}

/**
 * Lightweight operation result without a raw transaction, containing only multicall data.
 **/
export interface CreditManagerOperationResult {
  /**
   * Ordered multicall entries that make up the operation.
   **/
  calls: Array<MultiCall>;
  /**
   * Credit facade contract used for the operation.
   **/
  creditFacade: CreditSuite["creditFacade"];
}

/**
 * Input for {@link ICreditAccountsService.assembleCloseCreditAccountCalls}.
 */
export type AssembleCloseCreditAccountCallsProps = {
  /**
   * Minimal credit account data on which operation is performed.
   */
  creditAccount: RouterCASlice;
  /**
   * Pathfinder close router calls (`closePath.calls`).
   */
  routerCalls: Array<MultiCall>;
  /**
   * Tokens to withdraw from credit account after close path swaps.
   */
  assetsToWithdraw: Array<Address>;
  /**
   * Wallet address to withdraw tokens to.
   */
  to: Address;
};

/**
 * Input for {@link ICreditAccountsService.assembleRepayCreditAccountCalls}.
 */
export type AssembleRepayCreditAccountCallsProps = {
  collateralAssets: Array<Asset>;
  assetsToWithdraw: Array<Asset>;
  creditAccount: RouterCASlice;
  to: Address;
  permits: Record<string, PermitResult>;
  tokensToClaim: Asset[];
  /**
   * RWA wrap multicall entries (from getRWAWrapCalls).
   */
  calls?: Array<MultiCall>;
};

export interface PreviewDelayedWithdrawalProps {
  /**
   * Amount of source token (ex. cp0xlrt)
   */
  amount: bigint;
  /**
   * Address of source token (ex. cp0xlrt)
   */
  token: Address;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: Address;
  /**
   * Withdrawal phantom token that selects a specific withdrawal config when
   * the source token has more than one. When omitted, the first matching
   * config is used
   */
  withdrawalPhantomToken?: Address;
  intent?: DelayedIntent;
}

export interface GetPendingWithdrawalsProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: Address;
}

/**
 * Aggregated delayed withdrawal status, split into immediately claimable and still-pending entries.
 **/
export interface GetPendingWithdrawalsResult {
  /**
   * Withdrawals that have matured and can be claimed now.
   **/
  claimableNow: Array<ClaimableWithdrawal>;
  /**
   * Withdrawals that are still in their delay period.
   **/
  pending: Array<PendingWithdrawal>;
}

/**
 * Input for {@link ICreditAccountsService.assembleStartDelayedWithdrawalCalls}.
 */
export type AssembleStartDelayedWithdrawalCallsProps = {
  /**
   * Credit facade that receives `storeExpectedBalances` / `compareBalances`.
   */
  creditFacade: Address;
  /**
   * Withdrawal preview: `outputs` for expected balances, `token`/`amountIn`
   * for the negative source-token delta, `requestCalls` for the body.
   */
  preview: Pick<
    RequestableWithdrawal,
    "outputs" | "requestCalls" | "token" | "amountIn"
  >;
};

/**
 * Input for {@link ICreditAccountsService.assembleClaimDelayedCalls}.
 */
export type AssembleClaimDelayedCallsProps = {
  /**
   * Credit facade that receives `storeExpectedBalances` / `compareBalances`.
   */
  creditFacade: Address;
  /**
   * Claimable withdrawal: `outputs` for expected balances,
   * `withdrawalPhantomToken`/`withdrawalTokenSpent` for the negative
   * phantom-burn delta, `claimCalls` for the body.
   */
  claimableNow: Pick<
    ClaimableWithdrawal,
    "outputs" | "claimCalls" | "withdrawalPhantomToken" | "withdrawalTokenSpent"
  >;
};

export interface ClaimFarmRewardsProps extends PrepareUpdateQuotasProps {
  /**
    * Legacy property, v3.1 only enables token when quota is bought and when quota is bought token cannot be disabled. 
    * Tokens to disable after rewards claiming;
    sometimes is needed since old credit facade used to enable tokens on claim 
  */
  tokensToDisable: Array<Asset>;
  /**
   * External calls to execute instead of finding claim path
   */
  calls: Array<MultiCall> | undefined;
  /**
   * minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * List of token rewards of which we want to claim
   */
  tokensToClaim: Asset[];
}

export interface OpenCAProps extends PrepareUpdateQuotasProps {
  /**
   * Native token amount to attach to tx
   */
  ethAmount: bigint;
  /**
   * Array of collateral which can be just directly added or swapped using the path {@link Asset}
   */
  collateral: Array<Asset>;
  /**
   * Debt to open credit account with
   */
  debt: bigint;
  /**
   * Flag to withdraw debt to wallet after opening credit account;
   * used for borrowing functionality
   * If true, will withdraw underlying token, otherwise will withdraw specified token
   */
  withdrawToken?: boolean | Address;
  /**
   * Permits of collateral tokens (in any permittable token is present) {@link PermitResult}
   */
  permits: Record<string, PermitResult>;
  /**
   * Array of MultiCall from router methods findOpenStrategyPath {@link MultiCall}.
   * Used for trading and strategy functionality
   */
  calls: Array<MultiCall>;
  /**
   * Slot for optional call to execute after main tx.
   * For example: add bots
   */
  callsAfter?: Array<MultiCall>;
  /**
   * Address of credit manager to open credit account on
   */

  creditManager: Address;
  /**
   * Optional address of credit account to reopen
   */
  reopenCreditAccount?: Address;
  /**
   * Wallet address to transfer credit account to
   */
  to: Address;
  /**
   * Referral code to open credit account with
   */
  referralCode: bigint;
  /**
   * RWA options to open credit account with, required for RWA factories
   * First we ask for getOpenAccountRequirements,
   * then perform necessary actions (e.g. for Securitize, convert requiredSignatures to signaturesToCache)
   * to produce RWAOperationArgs
   * If getOpenAccountRequirements returned undefined, we need to pass undefined here too;
   * It means that no RWA actions are required (e.g. when we open second credit account)
   */
  rwaOptions?: RWAOperationArgs;
}

export interface FullyLiquidateProps {
  /**
   * Credit account to liquidate
   */
  account: RouterCASlice;
  /**
   * Address to transfer underlying left after liquidation
   */
  to: Address;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage?: bigint;
  /**
   * List of assets to keep on account after liquidation
   */
  keepAssets?: Address[];
  /**
   * If true, will ignore reserve prices
   */
  ignoreReservePrices?: boolean;
  /**
   * If true, will try to apply loss policy
   */
  applyLossPolicy?: boolean;
  /**
   * Debt only mode — will try to sell just enough of the most valuable token to cover debt.
   */
  debtOnly?: boolean;
}

export interface PartiallyLiquidateProps extends PartialLiquidationParams {
  /**
   * Credit account to liquidate
   */
  account: CreditAccountData;
  /**
   * Address to transfer underlying left after liquidation
   */
  to: Address;
}

/**
 * Claimable reward tokens associated with a single staking adapter and phantom token pair.
 **/
export interface Rewards {
  /**
   * Address of the reward pool adapter on the credit account.
   **/
  adapter: Address;
  /**
   * Address of the staked phantom token representing the staking position.
   **/
  stakedPhantomToken: Address;
  /**
   * Multicall entries to claim these rewards.
   **/
  calls: Array<MultiCall>;

  /**
   * List of reward token amounts claimable from this adapter.
   **/
  rewards: Array<Asset>;
}

/**
 * Options to get approval address for collateral token
 */
export type GetApprovalAddressProps =
  | { creditManager: Address; borrower: Address }
  | {
      creditManager: Address;
      creditAccount: Address;
    };

/**
 * An enriched credit-account operation ready for encoding.
 * Each op carries everything needed to build facade / adapter multicalls —
 * swap / wrap / unwrap attach concrete `calls` (no external routerCallGroups).
 *
 * Used by {@link ICreditAccountsService.assembleCaOperations}. Does not include
 * close / repay (use dedicated assemblers).
 */
export type EncodableCreditAccountOperation =
  | { type: "increaseDebt"; amount: bigint }
  /**
   * `full` settles the loan instead of shrinking it: the facade repays whatever
   * is outstanding, so the interest accrued since `amount` was quoted is
   * covered too and no dust is left below `minDebt`.
   */
  | { type: "decreaseDebt"; amount: bigint; full?: boolean }
  | { type: "addCollateral"; token: Address; amount: bigint }
  /**
   * `all` hands over the whole balance instead of a named amount: the facade
   * reads it at execution, so whatever a swap produced above the quote leaves
   * with the rest. `amount` is still the figure the projection was built on.
   */
  | {
      type: "withdrawCollateral";
      token: Address;
      amount: bigint;
      to: Address;
      all?: boolean;
    }
  | { type: "swap"; calls: Array<MultiCall> }
  | { type: "wrapRwaCollateral"; calls: Array<MultiCall> }
  | { type: "unwrapRwaCollateral"; calls: Array<MultiCall> }
  | {
      type: "changeQuota";
      quotaIncrease: Array<Asset>;
      quotaDecrease: Array<Asset>;
    };

/**
 * Input for {@link ICreditAccountsService.assembleCaOperations}.
 */
export type AssembleCaOperationsProps = {
  operations: Array<EncodableCreditAccountOperation>;
  creditFacade: Address;
};

export interface ICreditAccountsService extends Construct {
  sdk: OnchainSDK;

  /**
   * Bots connected to credit accounts: which ones are active, with which
   * permissions, and how to connect or disconnect them.
   */
  readonly bots: AccountBotsService;

  /**
   * Returns single credit account data with investor resolved, or undefined
   * if the account is not found.
   * Performs all necessary price feed updates under the hood.
   * @param account - Credit account address
   * @param blockNumber - Optional block number for the read
   * @returns Credit account data with investor, or undefined
   */
  getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData<true> | undefined>;

  /**
   * Returns all credit accounts with optional filtering.
   * Performs all necessary price feed updates under the hood.
   *
   * @param options - Filter options
   * @param blockNumber - Optional block number for the read
   * @returns Credit accounts sorted by health factor ascending
   */
  getCreditAccounts(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData>>;

  /**
   * Returns all credit accounts for a borrower,
   * both normal and RWA accounts with investor resolved on each.
   *
   * @param borrower - Actual owner of credit account
   * @param options - Filter options (creditManager, health factor, etc.)
   * @param blockNumber - Optional block number for the read
   * @returns Credit accounts (with investor) sorted by health factor ascending
   */
  getBorrowerCreditAccounts(
    borrower: Address,
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData<true>>>;

  /**
   * Describes the open credit accounts of a wallet as the shared read model's
   * strategy positions.
   *
   * @param props - {@link ListStrategyPositionsProps}
   * @returns One row per open account. Accounts whose collateral computation
   * failed are excluded, because none of their amounts can be computed.
   */
  listPositions(props: ListStrategyPositionsProps): Promise<StrategyPosition[]>;

  /**
   * Method to get all claimable rewards for credit account (ex. stkUSDS SKY rewards).
   * Associates rewards by adapter + stakedPhantomToken.
   * @param {Address} creditAccount - address of credit account to get rewards for
   * @returns {Array<Rewards>} list of {@link Rewards} that can be claimed
   */
  getRewards(creditAccount: Address): Promise<Array<Rewards>>;

  /**
   * Generates transaction to liquidate credit account
   * @param props - {@link FullyLiquidateProps}
   * @returns Transaction data and optional loss policy data
   */
  fullyLiquidate(props: FullyLiquidateProps): Promise<FullyLiquidateResult>;

  /**
   * Generates transaction to partially liquidate credit account;
   *
   * Transaction partially liquidates credit account's debt in exchange for discounted collateral
   * by transferring underlying from the caller (requires approval to the credit manager) and uses it to repay
   * account's debt and pay fees to the treasury
   * Transfers chosen collateral token at discounted oracle price to the liquidator
   *
   * @param props - {@link PartiallyLiquidateProps}
   * @returns Raw transaction ready to be signed and sent
   */
  partiallyLiquidate(props: PartiallyLiquidateProps): Promise<RawTx>;

  /**
   * Builds close multicall calls without price feed updates: close path swaps,
   * disable quotas, decrease debt, withdraw assets. Does not prepend price
   * updates and does not build the facade transaction.
   *
   * @param props - {@link AssembleCloseCreditAccountCallsProps}
   * @returns Raw facade multicall payload for close (before price feed updates)
   */
  assembleCloseCreditAccountCalls(
    props: AssembleCloseCreditAccountCallsProps,
  ): Promise<Array<MultiCall>>;

  /**
   * Builds start-delayed-withdrawal multicall calls without price feed updates
   * or quota updates.
   *
   * Balance bracket:
   * `storeExpectedBalances` → `preview.requestCalls` → `compareBalances`.
   *
   * Besides the positive output deltas, the bracket carries a negative delta
   * of the spent source token (`preview.token` / `-preview.amountIn`). It
   * makes the input-side balance decrease previewable from the calldata alone and lets
   * `compareBalances` assert the balance doesn't drop by more than predicted.
   *
   * Does not prepend price updates and does not build the facade transaction.
   *
   * @param props - {@link AssembleStartDelayedWithdrawalCallsProps}
   * @returns Raw facade multicall payload for the delayed-withdrawal request
   * @throws If `props.creditFacade` does not belong to a loaded market.
   */
  assembleStartDelayedWithdrawalCalls(
    props: AssembleStartDelayedWithdrawalCallsProps,
  ): Array<MultiCall>;

  /**
   * Builds claim-delayed-withdrawal multicall calls without price feed updates
   * or quota updates.
   *
   * Balance bracket:
   * `storeExpectedBalances` → `claimableNow.claimCalls` → `compareBalances`.
   *
   * Besides the positive output deltas, the bracket carries a negative delta
   * of the burned withdrawal phantom token (`claimableNow.withdrawalPhantomToken`
   * / `-claimableNow.withdrawalTokenSpent`). It makes the phantom burn
   * previewable from the calldata alone and lets `compareBalances` assert the
   * balance doesn't drop by more than predicted.
   *
   * Does not prepend price updates, does not update quotas, and does not build
   * the facade transaction. Use for resume / intent assembly where claim is
   * followed by other ops and quotas/prices are applied separately.
   *
   * @param props - {@link AssembleClaimDelayedCallsProps}
   * @returns Raw facade multicall payload for the claim
   * @throws If `props.creditFacade` does not belong to a loaded market.
   */
  assembleClaimDelayedCalls(
    props: AssembleClaimDelayedCallsProps,
  ): Array<MultiCall>;

  /**
   * Preview delayed withdrawal for given token
   * @param props - {@link PreviewDelayedWithdrawalProps}
   * @returns
   */
  previewDelayedWithdrawal(
    props: PreviewDelayedWithdrawalProps,
  ): Promise<RequestableWithdrawal>;
  /**
   * Get claimable and pending withdrawals of an account
   * @param props - {@link GetPendingWithdrawalsProps}
   * @returns
   */
  getPendingWithdrawals(
    props: GetPendingWithdrawalsProps,
  ): Promise<GetPendingWithdrawalsResult>;

  /**
   * Returns address to which approval should be given on collateral token
   * It's credit manager for classical markets and special wallet for RWA markets
   * @param props - {@link GetApprovalAddressProps}
   * @returns
   */
  getApprovalAddress(props: GetApprovalAddressProps): Promise<Address>;

  /**
   * Returns open account requirements for a borrower
   * @param borrower - Borrower address
   * @param creditManager - Credit manager address
   * @param props - {@link GetOpenAccountRequirementsProps} you can pass StrategyConfigPayload here
   * @returns Open account requirements or undefined if the user can open a credit account without any further actions
   */
  getOpenAccountRequirements(
    borrower: Address,
    creditManager: Address,
    props: GetOpenAccountRequirementsProps,
  ): Promise<RWAOpenAccountRequirements | undefined>;

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
   * - Open credit account is executed in the following order: price update -> increase debt -> add collateral ->
   *   -> update quotas -> (optionally: execute swap path for trading/strategy) ->
   *   -> (optionally: withdraw debt for lending)
   * - Basic open credit account: price update -> increase debt -> add collateral -> update quotas
   * - Lending: price update -> increase debt -> add collateral -> update quotas -> withdraw debt
   * - Strategy/trading: price update -> increase debt -> add collateral -> update quotas -> execute swap path
   * - In strategy is possible situation when collateral is added, but not swapped; the only swapped value in this case will be debt
   * @param props - {@link OpenCAProps}
   * @returns Raw transaction ready to be signed and sent
   */
  openCA(props: OpenCAProps): Promise<RawTx>;

  /**
   * Returns account price updates that can be used in credit facade multicall or liquidator calls
   * @param account - Credit account to get price updates for
   * @param ignoreReservePrices - If true, exclude reserve price feed updates
   * @returns Array of price updates
   */
  getOnDemandPriceUpdates(
    account: CreditAccountTokensSlice,
    ignoreReservePrices?: boolean,
  ): Promise<PriceUpdate[]>;

  /**
   * Analyzes a multicall array and prepends necessary on-demand price feed updates.
   *
   * @param creditManager - Credit manager address
   * @param calls - Original multicall payload
   * @param creditAccount - Optional credit account slice (used to determine which tokens need prices)
   * @param options - Optional settings for price update generation
   * @returns Multicall payload with price updates prepended when needed
   */
  prependPriceUpdates(
    creditManager: Address,
    calls: Array<MultiCall>,
    creditAccount?: RouterCASlice,
    options?: { ignoreReservePrices?: boolean },
  ): Promise<Array<MultiCall>>;

  /**
   * Builds credit facade multicall calls from an enriched operation list.
   * Each operation must already carry concrete encoding data (e.g. swap/wrap
   * `calls`). Unknown operation types throw.
   *
   * Does not handle close, repay, start delayed withdrawal, or claim delayed —
   * use {@link ICreditAccountsService.assembleCloseCreditAccountCalls} /
   * {@link ICreditAccountsService.assembleRepayCreditAccountCalls} /
   * {@link ICreditAccountsService.assembleStartDelayedWithdrawalCalls} /
   * {@link ICreditAccountsService.assembleClaimDelayedCalls}.
   *
   * @param props - Encodable operations and account context
   * @returns Array of facade / adapter multicall calls (without price feed updates)
   * @throws If `props.creditFacade` does not belong to a loaded market.
   */
  assembleCaOperations(props: AssembleCaOperationsProps): Array<MultiCall>;

  /**
   * Encodes a facade `increaseDebt` multicall entry.
   *
   * @throws If `creditFacade` does not belong to a loaded market.
   * @deprecated Use `creditSuite.creditFacade.prepareIncreaseDebt(debt)`.
   */
  prepareIncreaseDebt(creditFacade: Address, debt: bigint): MultiCall;

  /**
   * Encodes a facade `increaseDebt` or `decreaseDebt` multicall entry.
   *
   * @throws If `creditFacade` does not belong to a loaded market.
   * @deprecated Use `creditSuite.creditFacade.prepareChangeDebt(change, isDecrease)`.
   */
  prepareChangeDebt(
    creditFacade: Address,
    change: bigint,
    isDecrease: boolean,
  ): MultiCall;

  /**
   * Encodes facade `addCollateral` / `addCollateralWithPermit` multicall entries.
   *
   * @throws If `creditFacade` does not belong to a loaded market.
   * @deprecated Use `creditSuite.creditFacade.prepareAddCollateral(assets, permits)`.
   */
  prepareAddCollateral(
    creditFacade: Address,
    assets: Array<Asset>,
    permits: Record<string, PermitResult>,
  ): Array<MultiCall>;

  /**
   * Encodes a facade `withdrawCollateral` multicall entry.
   *
   * @throws If `creditFacade` does not belong to a loaded market.
   * @deprecated Use `creditSuite.creditFacade.prepareWithdrawCollateral(token, amount, to)`.
   */
  prepareWithdrawToken(
    creditFacade: Address,
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall;

  /**
   * Encodes facade `updateQuota` multicall entries from average/min quota assets.
   *
   * @throws If `creditFacade` does not belong to a loaded market.
   * @deprecated Use `creditSuite.creditFacade.prepareUpdateQuotas(props)`.
   */
  prepareUpdateQuotas(
    creditFacade: Address,
    props: PrepareUpdateQuotasProps,
  ): Array<MultiCall>;

  /**
   * Executes a credit account update: prepends price feed updates and builds the raw
   * multicall transaction. Uses the RWA factory when applicable.
   *
   * @param creditAccount - Credit account to update
   * @param calls - Operation calls to execute
   * @param options - Optional price update and ETH value settings
   * @returns Raw transaction ready to be signed and sent
   */
  executeCaUpdate(
    creditAccount: RouterCASlice,
    calls: Array<MultiCall>,
    options?: { ignoreReservePrices?: boolean; ethAmount?: bigint },
  ): Promise<RawTx>;

  /**
   * Returns multicall entries to redeem (unwrap) RWA ERC-4626 vault shares into underlying for the given credit manager.
   * Used when withdrawing debt from a RWA market: redeems adapter vault shares so the underlying can be withdrawn.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Number of vault shares (adapter tokens) to redeem
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  assembleRWAUnwrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined>;

  /**
   * Returns multicall entries to deposit (wrap) underlying into RWA ERC-4626 vault shares for the given credit manager.
   * Used when adding debt on a RWA market: deposits underlying into the adapter vault so shares are minted on the account.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Amount of underlying assets to deposit into the vault (in underlying decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  assembleRWAWrapCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined>;

  /**
   * Returns multicall entries to call redeemDiff on the RWA ERC-4626 adapter for the given credit manager.
   * Redeems the leftover vault shares (e.g. after repaying debt) so the account does not hold excess RWA vault tokens.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Leftover vault share amount to redeem (in adapter/vault decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  assembleRedeemDiffCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined>;

  /**
   * Returns multicall entries to call depositDiff on the RWA ERC-4626 adapter for the given credit manager.
   * Deposits the leftover underlying (e.g. after decreasing debt) into the vault so the account does not hold excess underlying.
   * Only applies when the credit manager's underlying is RWA-gated and has an ERC-4626 adapter configured.
   * @param amount - Leftover underlying amount to deposit into the vault (in underlying decimals)
   * @param creditManager - Credit manager address
   * @returns Array of MultiCall to pass to credit facade multicall, or undefined if underlying is not RWA or no adapter is configured
   */
  assembleDepositDiffCalls(
    amount: bigint,
    creditManager: Address,
  ): Promise<Array<MultiCall> | undefined>;

  /**
   * Builds repay multicall calls without price feed updates: add collateral,
   * wrap calls, disable quotas, decrease debt, redeem/unwrap, claim rewards,
   * withdraw assets. Does not prepend price updates and does not build the
   * facade transaction.
   *
   * @param props - {@link AssembleRepayCreditAccountCallsProps}
   * @returns Raw facade multicall payload for repay (before price feed updates)
   */
  assembleRepayCreditAccountCalls(
    props: AssembleRepayCreditAccountCallsProps,
  ): Promise<Array<MultiCall>>;

  /**
   * Claims farm rewards and optionally updates quotas
   *  - Claim rewards is executed in the following order: price update -> execute claim calls ->
   *   -> (optionally: update quotas)
   * @param props - {@link ClaimFarmRewardsProps}
   * @return Raw transaction ready to be signed and sent
   */
  claimFarmRewards(props: ClaimFarmRewardsProps): Promise<RawTx>;
}
