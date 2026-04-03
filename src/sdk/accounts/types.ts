import type {
  Address,
  ContractFunctionArgs,
  GetContractReturnType,
  Hex,
  PublicClient,
} from "viem";
import type { creditAccountCompressorAbi } from "../../abi/compressors/creditAccountCompressor.js";
import type { iWithdrawalCompressorV310Abi } from "../../abi/IWithdrawalCompressorV310.js";
import type {
  ConnectedBotData,
  Construct,
  CreditAccountData,
} from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { CreditSuite, PriceUpdate } from "../market/index.js";
import type {
  Asset,
  RouterCASlice,
  RouterCloseResult,
} from "../router/index.js";
import type { MultiCall, RawTx } from "../types/index.js";

/**
 * @internal
 * Arguments tuple for the credit account compressor's `getCreditAccounts` view method.
 **/
export type GetCreditAccountsArgs = ContractFunctionArgs<
  typeof creditAccountCompressorAbi,
  "pure" | "view",
  "getCreditAccounts"
>;

/**
 * @internal
 * Filtering criteria applied to individual credit accounts when querying the compressor.
 **/
export interface CreditAccountFilter {
  /**
   * Filter by account owner address.
   **/
  owner: Address;
  /**
   * Whether to include accounts with zero outstanding debt.
   **/
  includeZeroDebt: boolean;
  /**
   * Minimum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   **/
  minHealthFactor: bigint;
  /**
   * Maximum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   **/
  maxHealthFactor: bigint;
  /**
   * Whether to return only accounts whose health computation reverts.
   **/
  reverting: boolean;
}

/**
 * @internal
 * Filtering criteria to select which credit managers to query.
 **/
export interface CreditManagerFilter {
  /**
   * Only include credit managers owned by these market configurators.
   **/
  configurators: readonly Address[];
  /**
   * Only include these specific credit manager addresses.
   **/
  creditManagers: readonly Address[];
  /**
   * Only include credit managers linked to these pool addresses.
   **/
  pools: readonly Address[];
  /**
   * Only include credit managers with this underlying token.
   **/
  underlying: Address;
}

/**
 * Options for fetching credit accounts, allowing filtering by credit manager, owner, and health factor range.
 **/
export interface GetCreditAccountsOptions {
  /**
   * If set, only return accounts from this credit manager; otherwise query all attached markets.
   **/
  creditManager?: Address;
  /**
   * If set, only return accounts owned by this address.
   **/
  owner?: Address;
  /**
   * Whether to include accounts with zero outstanding debt.
   * @default false
   **/
  includeZeroDebt?: boolean;
  /**
   * Minimum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   * @default 0n
   **/
  minHealthFactor?: bigint;
  /**
   * Maximum health factor threshold (inclusive).
   * 18 digits precision (10^18 = 1)
   * @default MAX_UINT256
   **/
  maxHealthFactor?: bigint;
  /**
   * If true, exclude reserve price feed updates from the query.
   **/
  ignoreReservePrices?: boolean;
}

/**
 * Lightweight slice of credit-account data containing only token
 * balances and the enabled-tokens bitmask.
 **/
export type CreditAccountTokensSlice = Pick<
  CreditAccountData,
  "creditManager" | "creditAccount" | "tokens" | "enabledTokensMask"
>;

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
 * Close operation type: `"close"` fully closes the account, `"zeroDebt"` repays all debt but keeps the account open.
 **/
export type CloseOptions = "close" | "zeroDebt";

export interface CloseCreditAccountProps {
  /**
   * Close or zeroDebt
   */
  operation: CloseOptions;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Tokens to withdraw from credit account.
   * For credit account closing this is the underlying token, because during the closure,
   * all tokens on account are swapped into the underlying,
   * and only the underlying token will remain on the credit account
   */
  assetsToWithdraw: Array<Address>;
  /**
   * Wallet address to withdraw underlying to
   */
  to: Address;
  /**
   * Slippage in PERCENTAGE_FORMAT (100% = 10_000) per operation
   */
  slippage?: bigint;
  /**
   * Result of findBestClosePath method from router; if omited, calls marketRegister.findCreditManager {@link RouterCloseResult}
   */
  closePath?: RouterCloseResult;
}

export interface RepayCreditAccountProps
  extends RepayAndLiquidateCreditAccountProps {
  /**
   * close or zeroDebt
   */
  operation: CloseOptions;
}

export interface RepayAndLiquidateCreditAccountProps {
  /**
   * Tokens to repay debt.
   * In the current implementation, this is the (debt+interest+fees) * buffer,
   * where buffer refers to amount of tokens which will exceed current debt
   * in order to cover possible debt increase over tx execution.
   */
  collateralAssets: Array<Asset>;
  /**
   * tokens to withdraw from credit account. 
      Typically all non zero ca assets (including unclaimed rewards) 
      plus underlying token (to withdraw any exceeding underlying token after repay)
   */
  assetsToWithdraw: Array<Asset>;
  /**
   * Minimal credit account data on which operation is performed.
   */
  creditAccount: RouterCASlice;
  /**
   * Wallet address to withdraw underlying to
   */
  to: Address;
  /**
   * Permits of tokens to withdraw (if any permittable token is present).
   */
  permits: Record<string, PermitResult>;
  tokensToClaim: Asset[];
}

export interface PrepareUpdateQuotasProps {
  /**
   * average quota for desired token
   */
  averageQuota: Array<Asset>;
  /**
   * minimum quota for desired token
   */
  minQuota: Array<Asset>;
}

export interface UpdateQuotasProps extends PrepareUpdateQuotasProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface AddCollateralProps extends PrepareUpdateQuotasProps {
  /**
   * Asset to add as collateral
   */
  asset: Asset;
  /**
   * Native token amount to attach to tx
   */
  ethAmount: bigint;
  /**
   * Permit of collateral asset if it is permittable
   */
  permit: PermitResult | undefined;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface WithdrawCollateralProps extends PrepareUpdateQuotasProps {
  /**
   * list of assets which should be withdrawn
   */
  assetsToWithdraw: Array<Asset>;
  /**
   * Wallet address to withdraw token to
   */
  to: Address;
  /**
   * minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

/**
 * Credit account and credit manager address pair, used for batch queries such as connected bot lookups.
 **/
export type AccountToCheck = {
  /**
   * Address of the credit account.
   **/
  creditAccount: Address;
  /**
   * Address of the credit manager that manages this account.
   **/
  creditManager: Address;
};

export interface ExecuteSwapProps extends PrepareUpdateQuotasProps {
  /**
   * Array of MultiCall from router methods getSingleSwap or getAllSwaps
   */
  calls: Array<MultiCall>;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

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
}

export interface GetPendingWithdrawalsProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: Address;
}

type WithdrawalCompressorV310InstanceType = GetContractReturnType<
  typeof iWithdrawalCompressorV310Abi,
  PublicClient
>;

/**
 * Result of previewing a delayed withdrawal request, as returned by the withdrawal compressor.
 **/
export type PreviewDelayedWithdrawalResult = Awaited<
  ReturnType<
    WithdrawalCompressorV310InstanceType["read"]["getWithdrawalRequestResult"]
  >
>;

type PendingWithdrawalResult = Awaited<
  ReturnType<
    WithdrawalCompressorV310InstanceType["read"]["getCurrentWithdrawals"]
  >
>;
/**
 * A single pending delayed withdrawal that is not yet claimable.
 **/
export type PendingWithdrawal = PendingWithdrawalResult[1][number];
/**
 * A single delayed withdrawal that is ready to be claimed.
 **/
export type ClaimableWithdrawal = PendingWithdrawalResult[0][number];

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

export interface StartDelayedWithdrawalProps extends PrepareUpdateQuotasProps {
  /**
   * Withdrawal preview
   */
  preview: PreviewDelayedWithdrawalResult;
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

export interface ClaimDelayedProps extends PrepareUpdateQuotasProps {
  /**
   * assets claimable now from getPendingWithdrawals
   */
  claimableNow: GetPendingWithdrawalsResult["claimableNow"][number];
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
}

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
   */
  withdrawDebt?: boolean;
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
   * Address of credit manager to open credit account on
   */
  creditManager: Address;
  /**
   * Wallet address to transfer credit account to
   */
  to: Address;
  /**
   * Referral code to open credit account with
   */
  referralCode: bigint;
}

export interface ChangeDeptProps {
  /**
   * Minimal credit account data on which operation is performed
   */
  creditAccount: RouterCASlice;
  /**
   * Amount to change debt by
   * 0 - prohibited value;
   * negative value for debt decrease;
   * positive value for debt increase.
   */
  amount: bigint;
  /**
   * If true, will add collateral to the credit account
   */
  addCollateral: boolean;
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

/**
 * EIP-2612 permit signature data for a token, enabling gasless approval for credit account operations.
 **/
export interface PermitResult {
  /**
   * ECDSA signature `r` component.
   **/
  r: Address;
  /**
   * ECDSA signature `s` component.
   **/
  s: Address;
  /**
   * ECDSA signature `v` component.
   **/
  v: number;

  /**
   * Token address the permit is for.
   **/
  token: Address;
  /**
   * Address of the token holder granting the permit.
   **/
  owner: Address;
  /**
   * Address authorized to spend the tokens.
   **/
  spender: Address;
  /**
   * Amount of tokens approved.
   **/
  value: bigint;

  /**
   * Timestamp after which the permit expires.
   **/
  deadline: bigint;
  /**
   * Owner's current permit nonce.
   **/
  nonce: bigint;
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

interface CMSlice {
  creditManager: Address;
  creditFacade: Address;
  type: "creditManager";
}

export interface SetBotProps {
  /**
   * Address of a bot that is being updated
   */
  botAddress: Address;
  /**
   * Permissions to set for the bot
   */
  permissions: bigint | null;
  /**
   * Minimal credit account data {@link RouterCASlice} on which operation is performed; if omitted, credit manager data is used
   * Minimal credit manager data {@link CMSlice} on which operation is performed; used only if credit account is omitted
   * At least one of credit account or credit manager must be provided
   */
  targetContract: (RouterCASlice & { type: "creditAccount" }) | CMSlice;
}

/**
 * Multicall result of querying connected bots across multiple credit accounts.
 **/
export type GetConnectedBotsResult = Array<
  | {
      error?: undefined;
      result: readonly ConnectedBotData[];
      status: "success";
    }
  | {
      error: Error;
      result?: undefined;
      status: "failure";
    }
>;

/**
 * Result of querying a migration bot's status across credit accounts, or `undefined` if no migration bot was provided.
 **/
export type GetConnectedMigrationBotsResult =
  | {
      result: (
        | {
            error: Error;
            result?: undefined;
            status: "failure";
          }
        | {
            error?: undefined;
            result:
              | readonly [bigint, boolean, boolean]
              | readonly [bigint, boolean];
            status: "success";
          }
      )[];
      botAddress: Address;
    }
  | undefined;

/**
 * Input for previewing a proportional Llamathena withdrawal.
 **/
export interface PreviewWithdrawLlamathenaProportionallyProps {
  /**
   * Llamathena token and amount to withdraw.
   **/
  llamathena: Asset;
}
/**
 * Result of a proportional Llamathena withdrawal preview.
 **/
export interface PreviewWithdrawLlamathenaProportionallyResult {
  /**
   * Underlying assets received from the withdrawal.
   **/
  assets: [Asset];
  /**
   * Staked Llamathena token consumed.
   **/
  stkLlamathena: [Asset];
}

export interface LlamathenaProportionalWithdrawProps
  extends PrepareUpdateQuotasProps {
  /**
   * Preview of the withdrawal
   */
  preview: PreviewWithdrawLlamathenaProportionallyResult;
  /**
   * Minimal credit account data on which operation is performed.
   */
  creditAccount: RouterCASlice;
}

export interface ICreditAccountsService extends Construct {
  sdk: GearboxSDK;
  /**
   * Returns single credit account data, or undefined if it's not found
   * Performs all necessary price feed updates under the hood
   * @param account
   * @param blockNumber
   * @returns
   */
  getCreditAccountData(
    account: Address,
    blockNumber?: bigint,
  ): Promise<CreditAccountData | undefined>;
  /**
   * Methods to get all credit accounts with some optional filtering
   * Performs all necessary price feed updates under the hood
   *
   * @param options
   * @param blockNumber
   * @returns returned credit accounts are sorted by health factor in ascending order
   */
  getCreditAccounts(
    options?: GetCreditAccountsOptions,
    blockNumber?: bigint,
  ): Promise<Array<CreditAccountData>>;
  /**
   * Method to get all claimable rewards for credit account (ex. stkUSDS SKY rewards).
   * Associates rewards by adapter + stakedPhantomToken.
   * @param {Address} creditAccount - address of credit account to get rewards for
   * @returns {Array<Rewards>} list of {@link Rewards} that can be claimed
   */
  getRewards(creditAccount: Address): Promise<Array<Rewards>>;
  /**
   * Method to get all connected bots for credit account
   * @param {Array<AccountToCheck>} accountsToCheck - list of credit accounts
   * @param {Address | undefined} legacyMigrationBot - address of the bot to check connected bots on
   * and their credit managers to check connected bots on
   * @returns call result of getConnectedBots for each credit account
   */
  getConnectedBots(
    accountsToCheck: Array<AccountToCheck>,
    legacyMigrationBot: Address | undefined,
    additionalBots: Array<Address>,
  ): Promise<{
    legacy: GetConnectedBotsResult;
    legacyMigration: GetConnectedMigrationBotsResult;
    additionalBots: Array<
      Omit<NonNullable<GetConnectedMigrationBotsResult>, "botAddress">
    >;
  }>;
  /**
   * Connects/disables a bot and updates prices
   * @param props - {@link SetBotProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  setBot: (
    props: SetBotProps,
  ) => Promise<CreditAccountOperationResult | CreditManagerOperationResult>;

  /**
   * Generates transaction to liquidate credit account
   * @param props - {@link FullyLiquidateProps}
   * @returns
   */
  fullyLiquidate(props: FullyLiquidateProps): Promise<CloseCreditAccountResult>;

  /**
   * Closes credit account or closes credit account and keeps it open with zero debt.
   * - Ca is closed in the following order: price update -> close path to swap all tokens into underlying ->
   * -> disable quotas of exiting tokens -> decrease debt -> disable exiting tokens -> withdraw underlying tokens
   * @param props - {@link CloseCreditAccountProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  closeCreditAccount(
    props: CloseCreditAccountProps,
  ): Promise<CloseCreditAccountResult>;

  /**
   * Updates quota of credit account.
   * CA quota updated in the following order: price update -> update quotas
   * @param props - {@link UpdateQuotasProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  updateQuotas(props: UpdateQuotasProps): Promise<CreditAccountOperationResult>;

  /**
   * Adds a single collateral to credit account and updates quotas
   * Collateral is added in the following order: price update -> add collateral (with permit) -> update quotas
   * @param props - {@link AddCollateralProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  addCollateral(
    props: AddCollateralProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Increases or decreases debt of credit account; debt decrease uses token ON CREDIT ACCOUNT
   * Debt is changed in the following order: price update -> (enables underlying if it was disabled) -> change debt
   * @param props - {@link ChangeDeptProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  changeDebt(props: ChangeDeptProps): Promise<CreditAccountOperationResult>;

  /**
   * Executes swap specified by given calls, update quotas of affected tokens
   * Swap is executed in the following order: price update -> execute swap path -> update quotas
   * @param props - {@link ExecuteSwapProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  executeSwap(props: ExecuteSwapProps): Promise<CreditAccountOperationResult>;

  /**
   * Start delayed withdrawal for given token
     - Withdrawal is executed in the following order: price update -> execute withdraw calls -> update quotas
   * @param props - {@link StartDelayedWithdrawalProps}
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  startDelayedWithdrawal(
    props: StartDelayedWithdrawalProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Preview delayed withdrawal for given token
   * @param props - {@link PreviewDelayedWithdrawalProps}
   * @returns
   */
  previewDelayedWithdrawal(
    props: PreviewDelayedWithdrawalProps,
  ): Promise<PreviewDelayedWithdrawalResult>;
  /**
   * Get claimable and pending withdrawals of an account
   * @param props - {@link GetPendingWithdrawalsProps}
   * @returns
   */
  getPendingWithdrawals(
    props: GetPendingWithdrawalsProps,
  ): Promise<GetPendingWithdrawalsResult>;
  /**
   * Claim tokens with delayed withdrawal
     - Claim is executed in the following order: price update -> execute claim calls -> update quotas
   * @param props - {@link ClaimDelayedProps}
   * @returns
  */
  claimDelayed(props: ClaimDelayedProps): Promise<CreditAccountOperationResult>;

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
   * @returns All necessary data to execute the transaction (call, credit facade)
   */
  openCA(props: OpenCAProps): Promise<CreditAccountOperationResult>;

  /**
   * Returns borrow rate with 4 digits precision (10000 = 100%)
   * @param ca
   * @returns
   */
  getBorrowRate(ca: CreditAccountData): bigint;

  /**
   * Returns optimal HF for partial liquidation with 4 digits precision (10000 = 100%)
   * @param ca
   */
  getOptimalHFForPartialLiquidation(ca: CreditAccountData): bigint;

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
   * Executes a multicall on a credit account, automatically prepending
   * necessary on-demand price feed updates inferred from the calls array.
   *
   * @param creditAccount - Credit account to execute multicall on
   * @param calls - Array of multicall operations (price updates will be inferred)
   * @param options - Optional settings for price update generation
   * @returns Raw transaction ready to be signed and sent
   */
  multicall(
    creditAccount: RouterCASlice,
    calls: Array<MultiCall>,
    options?: { ignoreReservePrices?: boolean },
  ): Promise<RawTx>;

  /**
   * Executes a bot multicall on a credit account, automatically prepending
   * necessary on-demand price feed updates inferred from the calls array.
   *
   * @param creditAccount - Credit account to execute bot multicall on
   * @param calls - Array of multicall operations (price updates will be inferred)
   * @param options - Optional settings for price update generation
   * @returns Raw transaction ready to be signed and sent
   */
  botMulticall(
    creditAccount: RouterCASlice,
    calls: Array<MultiCall>,
    options?: { ignoreReservePrices?: boolean },
  ): Promise<RawTx>;

  /**
   * Withdraws a single collateral from credit account to wallet to and updates quotas;
   * technically can withdraw several tokens at once
   *   - Collateral is withdrawn in the following order: price update -> withdraw token -> update quotas for affected tokens
   * @param props - {@link WithdrawCollateralProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  withdrawCollateral(
    props: WithdrawCollateralProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Fully repays credit account or repays credit account and keeps it open with zero debt
   * - Repays in the following order: price update -> add collateral to cover the debt ->
   *   -> disable quotas for all tokens -> decrease debt -> disable tokens all tokens -> withdraw all tokens
   * @param props - {@link RepayCreditAccountProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  repayCreditAccount(
    props: RepayCreditAccountProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Fully repays liquidatable account
   * - Repay and liquidate is executed in the following order: price update -> add collateral to cover the debt ->
   *   withdraw all tokens from credit account
   * @param props - {@link RepayAndLiquidateCreditAccountProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  repayAndLiquidateCreditAccount(
    props: RepayAndLiquidateCreditAccountProps,
  ): Promise<CreditAccountOperationResult>;

  /**
   * Claims farm rewards and optionally updates quotas
   *  - Claim rewards is executed in the following order: price update -> execute claim calls ->
   *   -> (optionally: update quotas)
   * @param props - {@link ClaimFarmRewardsProps}
   * @return All necessary data to execute the transaction (call, credit facade)
   */
  claimFarmRewards(
    props: ClaimFarmRewardsProps,
  ): Promise<CreditAccountOperationResult>;

  previewWithdrawLlamathenaProportionally(
    props: PreviewWithdrawLlamathenaProportionallyProps,
  ): Promise<PreviewWithdrawLlamathenaProportionallyResult>;
  withdrawLlamathenaProportionally(
    props: LlamathenaProportionalWithdrawProps,
  ): Promise<CreditAccountOperationResult>;
}
